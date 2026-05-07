import { generateBlogPost } from "./agents/agent1-blog";
import { generateSocialPosts } from "./agents/agent2-social";
import { generateEmailNewsletter } from "./agents/agent3-email";
import { generateSEOData } from "./agents/agent4-seo";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/pipeline" && req.method === "POST") {
      try {
        const body = await req.json() as {
          topic: string;
          audience?: string;
          tone?: string;
        };

        const { topic, audience, tone } = body;

        if (!topic) {
          return new Response(
            JSON.stringify({ error: "topic is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        console.log("\n🚀 Pipeline triggered!");
        console.log("Topic: " + topic);

        const blogPost = await generateBlogPost(
          topic,
          audience || "business professionals",
          tone || "informative and engaging"
        );

        const socialPosts = await generateSocialPosts(blogPost);
        const email = await generateEmailNewsletter(blogPost);
        const seoData = await generateSEOData(blogPost);

        console.log("💾 Saving to Supabase...");

        const { data, error } = await supabase
          .from("pipeline_runs")
          .insert({
            topic,
            audience: audience || "business professionals",
            tone: tone || "informative and engaging",
            status: "completed",
            blog_title: blogPost.title,
            blog_slug: blogPost.slug,
            blog_intro: blogPost.intro,
            blog_sections: blogPost.sections,
            blog_conclusion: blogPost.conclusion,
            blog_cta: blogPost.cta,
            blog_word_count: blogPost.word_count,
            linkedin_post: socialPosts.linkedin.post,
            linkedin_hashtags: socialPosts.linkedin.hashtags,
            twitter_post: socialPosts.twitter.post,
            twitter_hashtags: socialPosts.twitter.hashtags,
            instagram_caption: socialPosts.instagram.caption,
            instagram_hashtags: socialPosts.instagram.hashtags,
            instagram_emoji_hook: socialPosts.instagram.emoji_hook,
            email_subject: email.subject_line,
            email_preview_text: email.preview_text,
            email_greeting: email.greeting,
            email_opening: email.opening_paragraph,
            email_sections: email.main_sections,
            email_cta_button: email.cta_button_text,
            email_closing: email.closing_paragraph,
            seo_meta_title: seoData.meta_title,
            seo_meta_description: seoData.meta_description,
            seo_focus_keyword: seoData.focus_keyword,
            seo_url_slug: seoData.url_slug,
            seo_secondary_keywords: seoData.secondary_keywords,
            seo_faq: seoData.faq,
            seo_read_time: seoData.estimated_read_time,
            blog_published: false,
            social_published: false,
            email_sent: false
          })
          .select()
          .single();

        console.log("Supabase response - error:", error, "data:", data);
if (error) {
  console.error("Supabase error:", error);
  throw new Error("Failed to save to database: " + error.message);
}

        console.log("✅ Saved to Supabase! Run ID: " + data.id);

        return new Response(JSON.stringify({
          success: true,
          run_id: data.id,
          topic,
          generated_at: data.created_at,
          blog_post: blogPost,
          social_posts: socialPosts,
          email_newsletter: email,
          seo_data: seoData
        }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (error) {
        console.error("Pipeline error:", error);
        return new Response(
          JSON.stringify({ error: "Pipeline failed", details: String(error) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (url.pathname === "/runs" && req.method === "GET") {
      const { data, error } = await supabase
        .from("pipeline_runs")
        .select("id, created_at, topic, status, blog_title, blog_published, social_published, email_sent")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ runs: data }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
});

console.log("🚀 Pipeline API server running on http://localhost:3000");
console.log("   POST http://localhost:3000/pipeline");
console.log("   GET  http://localhost:3000/health");
console.log("   GET  http://localhost:3000/runs");
