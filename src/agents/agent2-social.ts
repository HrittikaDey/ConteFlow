import Groq from "groq-sdk";
import { Langfuse } from "langfuse";
import { groqApiKey, langfuseConfig } from "../config";

const langfuse = new Langfuse({
  publicKey: langfuseConfig.publicKey,
  secretKey: langfuseConfig.secretKey,
  baseUrl: langfuseConfig.baseUrl
});


interface BlogPost {
  title: string;
  slug: string;
  intro: string;
  sections: { heading: string; body: string }[];
  conclusion: string;
  cta: string;
  word_count: number;
}

interface SocialMediaPosts {
  linkedin: { post: string; hashtags: string[]; character_count: number };
  twitter: { post: string; hashtags: string[]; character_count: number };
  instagram: { caption: string; hashtags: string[]; emoji_hook: string; character_count: number };
}

export async function generateSocialPosts(blogPost: BlogPost): Promise<SocialMediaPosts> {
  const client = new Groq({
    apiKey: groqApiKey,
  });

  console.log("Agent 2 starting - Social Media Generator");
const trace = langfuse.trace({ name: "agent2-social-media", metadata: { blog_title: blogPost.title } });
const span = trace.span({ name: "groq-social-generation", input: { blog_title: blogPost.title } });
const startTime = Date.now();
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: "You are a social media expert. Return ONLY raw valid JSON. No markdown. No backticks. No explanation."
      },
      {
        role: "user",
        content: `Based on this blog post, create social media content.
TITLE: ${blogPost.title}
INTRO: ${blogPost.intro}
SECTIONS: ${blogPost.sections.map(s => s.heading).join(", ")}
CONCLUSION: ${blogPost.conclusion}

Return ONLY this JSON structure:
{
  "linkedin": {
    "post": "write a 150 word professional post here",
    "hashtags": ["ai", "marketing", "content", "digital", "business"],
    "character_count": 800
  },
  "twitter": {
    "post": "write a punchy tweet under 250 chars here",
    "hashtags": ["ai", "marketing", "content"],
    "character_count": 200
  },
  "instagram": {
    "caption": "write an engaging caption with emojis here",
    "hashtags": ["ai", "marketing", "content", "digital", "business", "growth", "socialmedia", "branding", "strategy", "future"],
    "emoji_hook": "🤖✨📈",
    "character_count": 500
  }
}`
      }
    ]
  });

  const rawText = response.choices[0]?.message?.content || "";
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const socialPosts: SocialMediaPosts = JSON.parse(cleaned);
  span.end({ output: { platforms: ['linkedin', 'twitter', 'instagram'] }, metadata: { latency_ms: Date.now() - startTime } });
await langfuse.flushAsync();

  console.log("Agent 2 done!");
  console.log("LinkedIn: " + socialPosts.linkedin.character_count + " chars");
  console.log("Twitter: " + socialPosts.twitter.character_count + " chars");
  console.log("Instagram: " + socialPosts.instagram.character_count + " chars");

  return socialPosts;
}
