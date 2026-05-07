import { Langfuse } from "langfuse";
import { groqApiKey, langfuseConfig } from "../config";
import Groq from "groq-sdk";

const langfuse = new Langfuse({
  publicKey: langfuseConfig.publicKey,
  secretKey: langfuseConfig.secretKey,
  baseUrl: langfuseConfig.baseUrl
});

interface BlogPost {
  title: string;
  slug: string;
  intro: string;
  sections: {
    heading: string;
    body: string;
  }[];
  conclusion: string;
  cta: string;
  word_count: number;
}

export async function generateBlogPost(
  topic: string,
  audience: string = "business professionals",
  tone: string = "informative and engaging"
): Promise<BlogPost> {
  const client = new Groq({
  apiKey: groqApiKey,
});

  console.log(`\n🤖 Agent 1 starting — Topic: "${topic}"`);
  console.log(`   Audience: ${audience} | Tone: ${tone}`);
  console.log(`   Calling Groq API...`);
  const trace = langfuse.trace({
  name: "agent1-blog-writer",
  metadata: { topic, audience, tone }
});

const span = trace.span({
  name: "groq-blog-generation",
  input: { topic, audience, tone }
});

const startTime = Date.now();
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4000,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are an expert content writer who writes high-quality blog posts. 
You always return ONLY valid JSON with no markdown, no backticks, no explanation. 
Just raw JSON that can be parsed directly.`,
      },
      {
        role: "user",
        content: `Write a detailed blog post about the topic below.

TOPIC: ${topic}
AUDIENCE: ${audience}
TONE: ${tone}

Return ONLY this exact JSON structure:
{
  "title": "compelling blog post title",
  "slug": "url-friendly-slug-here",
  "intro": "2-3 sentence hook that draws the reader in",
  "sections": [
    { "heading": "Section 1 Title", "body": "3-4 paragraph section body" },
    { "heading": "Section 2 Title", "body": "3-4 paragraph section body" },
    { "heading": "Section 3 Title", "body": "3-4 paragraph section body" }
  ],
  "conclusion": "1-2 paragraph wrap-up",
  "cta": "one clear call-to-action sentence",
  "word_count": 950
}`,
      },
    ],
  });

  // Extract the text from Groq's response
  const rawText = response.choices[0]?.message?.content || "";

  // Clean any accidental markdown backticks Groq sometimes adds
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  // Parse the JSON
  const blogPost: BlogPost = JSON.parse(cleaned);
  const latency = Date.now() - startTime;

span.end({
  output: { title: blogPost.title, word_count: blogPost.word_count },
  metadata: {
    latency_ms: latency,
    tokens_in: response.usage?.prompt_tokens,
    tokens_out: response.usage?.completion_tokens,
    model: "llama-3.3-70b-versatile"
  }
});

await langfuse.flushAsync();
console.log("Langfuse trace saved!");

  console.log(`✅ Agent 1 done!`);
  console.log(`   Title: "${blogPost.title}"`);
  console.log(`   Sections: ${blogPost.sections.length}`);
  console.log(`   Words: ~${blogPost.word_count}`);
  console.log(`   Tokens used: ${response.usage?.prompt_tokens} in / ${response.usage?.completion_tokens} out`);

  return blogPost;
}
