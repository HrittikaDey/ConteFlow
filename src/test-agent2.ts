import { generateBlogPost } from "./agents/agent1-blog";
import { generateSocialPosts } from "./agents/agent2-social";

async function main() {
  try {
    console.log("🚀 Starting pipeline...");
    
    const blogPost = await generateBlogPost(
      "How AI is transforming content marketing in 2025",
      "marketing managers at mid-size companies",
      "practical and data-driven"
    );

    const socialPosts = await generateSocialPosts(blogPost);

    console.log("\n========== LINKEDIN POST ==========");
    console.log(socialPosts.linkedin.post);
    console.log("Hashtags: #" + socialPosts.linkedin.hashtags.join(" #"));

    console.log("\n========== TWITTER/X POST ==========");
    console.log(socialPosts.twitter.post);
    console.log("Hashtags: #" + socialPosts.twitter.hashtags.join(" #"));

    console.log("\n========== INSTAGRAM CAPTION ==========");
    console.log(socialPosts.instagram.emoji_hook);
    console.log(socialPosts.instagram.caption);
    console.log("Hashtags: #" + socialPosts.instagram.hashtags.join(" #"));

    console.log("\n========== FULL JSON OUTPUT ==========");
    console.log(JSON.stringify(socialPosts, null, 2));

  } catch (error) {
    console.error("❌ Something went wrong:", error);
  }
}

main();
