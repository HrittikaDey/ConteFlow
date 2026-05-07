import { generateBlogPost } from "./agents/agent1-blog";

async function main() {
  try {
    const result = await generateBlogPost(
      "How AI is transforming content marketing in 2025",
      "marketing managers at mid-size companies",
      "practical and data-driven"
    );

    console.log("\n========== FULL OUTPUT ==========");
    console.log(JSON.stringify(result, null, 2));
    console.log("=================================");

  } catch (error) {
    console.error("❌ Something went wrong:", error);
  }
}

main();
