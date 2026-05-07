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

interface EmailNewsletter {
  subject_line: string;
  preview_text: string;
  greeting: string;
  opening_paragraph: string;
  main_sections: {
    heading: string;
    body: string;
  }[];
  cta_button_text: string;
  cta_url_placeholder: string;
  closing_paragraph: string;
  sign_off: string;
}

export async function generateEmailNewsletter(
  blogPost: BlogPost
): Promise<EmailNewsletter> {
  const client = new Groq({
    apiKey: groqApiKey,
  });

  console.log("Agent 3 starting - Email Newsletter Generator");
  console.log("Blog title: " + blogPost.title);
  console.log("Calling Groq API...");
const trace = langfuse.trace({ name: "agent3-email", metadata: { blog_title: blogPost.title } });
const span = trace.span({ name: "groq-social-generation", input: { blog_title: blogPost.title } });
const startTime = Date.now();
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content: "You are an expert email marketing copywriter who writes newsletters people actually want to read. You write in a warm, conversational tone. Return ONLY raw valid JSON. No markdown. No backticks. No explanation whatsoever."
      },
      {
        role: "user",
        content: `Write a complete email newsletter based on this blog post.

BLOG TITLE: ${blogPost.title}
BLOG INTRO: ${blogPost.intro}
KEY SECTIONS: ${blogPost.sections.map(s => s.heading).join(", ")}
BLOG CONCLUSION: ${blogPost.conclusion}
BLOG CTA: ${blogPost.cta}

Return ONLY this exact JSON structure:
{
  "subject_line": "compelling email subject under 50 characters",
  "preview_text": "preview text that appears in inbox under 90 characters",
  "greeting": "Hi [First Name],",
  "opening_paragraph": "2-3 warm conversational sentences that hook the reader and make them want to keep reading",
  "main_sections": [
    { "heading": "First Key Point", "body": "2-3 sentences expanding on this point in email-friendly language" },
    { "heading": "Second Key Point", "body": "2-3 sentences expanding on this point in email-friendly language" },
    { "heading": "Third Key Point", "body": "2-3 sentences expanding on this point in email-friendly language" }
  ],
  "cta_button_text": "short action phrase for button like Read Full Article",
  "cta_url_placeholder": "https://yourblog.com/slug-here",
  "closing_paragraph": "2-3 warm closing sentences that feel personal and human",
  "sign_off": "Warm regards,\nThe [Company] Team"
}`
      }
    ]
  });

  const rawText = response.choices[0]?.message?.content || "";

// Clean markdown backticks if any
let cleaned = rawText.replace(/```json|```/g, "").trim();
// Find the first { and last } to extract pure JSON
const firstBrace = cleaned.indexOf("{");
const lastBrace = cleaned.lastIndexOf("}");
if (firstBrace === -1 || lastBrace === -1) {
  throw new Error("No valid JSON found in response");
}
cleaned = cleaned.slice(firstBrace, lastBrace + 1);

// Fix illegal line breaks inside JSON strings
const fixed = cleaned.replace(/:\s*"([^"]*)"/gs, (match) => {
  return match.replace(/\n/g, "\\n").replace(/\r/g, "");
});

const email: EmailNewsletter = JSON.parse(fixed);
span.end({ output: { platforms: ['linkedin', 'twitter', 'instagram'] }, metadata: { latency_ms: Date.now() - startTime } });
await langfuse.flushAsync();
  console.log("Agent 3 done!");
  console.log("Subject line: " + email.subject_line);
  console.log("Preview text: " + email.preview_text);
  console.log("CTA button: " + email.cta_button_text);

  return email;
}
