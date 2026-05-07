import { generateBlogPost } from "./agents/agent1-blog";
import { generateSocialPosts } from "./agents/agent2-social";
import { generateEmailNewsletter } from "./agents/agent3-email";
import { generateSEOData } from "./agents/agent4-seo";

async function main() {
  try {
    console.log("🚀 Running FULL pipeline - All 4 Agents...\n");

    const blogPost = await generateBlogPost(
      "How AI is transforming content marketing in 2025",
      "marketing managers at mid-size companies",
      "practical and data-driven"
    );

    const socialPosts = await generateSocialPosts(blogPost);
    const email = await generateEmailNewsletter(blogPost);
    const seoData = await generateSEOData(blogPost);

    console.log("\n========== PIPELINE COMPLETE ✅ ==========");
    console.log("Blog:    " + blogPost.title);
    console.log("Twitter: " + socialPosts.twitter.post);
    console.log("Subject: " + email.subject_line);
    console.log("Keyword: " + seoData.focus_keyword);

  } catch (error) {
    console.error("Something went wrong:", error);
  }
}

main();
