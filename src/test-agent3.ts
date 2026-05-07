import { generateBlogPost } from "./agents/agent1-blog";
import { generateSocialPosts } from "./agents/agent2-social";
import { generateEmailNewsletter } from "./agents/agent3-email";

async function main() {
  try {
    console.log("Starting pipeline - Agents 1 + 2 + 3...\n");

    // Agent 1 — Blog Post
    const blogPost = await generateBlogPost(
      "How AI is transforming content marketing in 2025",
      "marketing managers at mid-size companies",
      "practical and data-driven"
    );

    // Agent 2 — Social Media
    const socialPosts = await generateSocialPosts(blogPost);

    // Agent 3 — Email Newsletter
    const email = await generateEmailNewsletter(blogPost);

    console.log("\n========== EMAIL NEWSLETTER ==========");
    console.log("SUBJECT:  " + email.subject_line);
    console.log("PREVIEW:  " + email.preview_text);
    console.log("GREETING: " + email.greeting);
    console.log("\nOPENING:");
    console.log(email.opening_paragraph);
    console.log("\nMAIN SECTIONS:");
    email.main_sections.forEach((section, i) => {
      console.log("\n[" + (i + 1) + "] " + section.heading);
      console.log(section.body);
    });
    console.log("\nCTA BUTTON: " + email.cta_button_text);
    console.log("CTA URL:    " + email.cta_url_placeholder);
    console.log("\nCLOSING:");
    console.log(email.closing_paragraph);
    console.log("\nSIGN OFF:");
    console.log(email.sign_off);

    console.log("\n========== FULL JSON ==========");
    console.log(JSON.stringify(email, null, 2));

  } catch (error) {
    console.error("Something went wrong:", error);
  }
}

main();
