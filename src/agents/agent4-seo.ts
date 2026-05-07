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

interface SEOData {
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  url_slug: string;
  secondary_keywords: string[];
  og_title: string;
  og_description: string;
  readability_score: string;
  estimated_read_time: string;
  internal_link_suggestions: string[];
  faq: { question: string; answer: string }[];
}

export async function generateSEOData(blogPost: BlogPost): Promise<SEOData> {
  const client = new Groq({
    apiKey: groqApiKey,
  });

  console.log("Agent 4 starting - SEO Optimizer");
  console.log("Blog title: " + blogPost.title);
  console.log("Calling Groq API...");

  const sectionHeadings = blogPost.sections.map(s => s.heading).join(", ");

  const userPrompt = `Analyze this blog post and generate complete SEO optimization data.
BLOG TITLE: ${blogPost.title}
BLOG INTRO: ${blogPost.intro}
KEY SECTIONS: ${sectionHeadings}
BLOG CONCLUSION: ${blogPost.conclusion}
WORD COUNT: ${blogPost.word_count}

Return ONLY this exact JSON structure with no line breaks inside strings:
{"meta_title":"SEO optimized title under 60 characters","meta_description":"compelling meta description 150-160 characters with focus keyword","focus_keyword":"main keyword phrase 2-4 words","url_slug":"seo-friendly-url-slug","secondary_keywords":["keyword1","keyword2","keyword3","keyword4","keyword5","keyword6","keyword7","keyword8"],"og_title":"Open Graph title under 60 characters","og_description":"Open Graph description under 200 characters","readability_score":"Grade 8 - Easy to Read","estimated_read_time":"5 min read","internal_link_suggestions":["related article title 1","related article title 2","related article title 3"],"faq":[{"question":"question 1 about the topic","answer":"answer in 2-3 sentences"},{"question":"question 2 about the topic","answer":"answer in 2-3 sentences"},{"question":"question 3 about the topic","answer":"answer in 2-3 sentences"}]}`;
const trace = langfuse.trace({ name: "agent2-social-media", metadata: { blog_title: blogPost.title } });
const span = trace.span({ name: "groq-social-generation", input: { blog_title: blogPost.title } });
const startTime = Date.now();
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content: "You are an expert SEO specialist. Return ONLY raw valid JSON. No markdown. No backticks. No explanation. Never use real line breaks inside string values."
      },
      {
        role: "user",
        content: userPrompt
      }
    ]
  });

  const rawText = response.choices[0]?.message?.content || "";

  let cleaned = rawText.replace(/```json|```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  cleaned = cleaned.replace(/("(?:[^"\\]|\\.)*")|(\n)/g, (match, stringMatch) => {
    if (stringMatch) return stringMatch;
    return " ";
  });

  const seoData: SEOData = JSON.parse(cleaned);
span.end({ output: { platforms: ['linkedin', 'twitter', 'instagram'] }, metadata: { latency_ms: Date.now() - startTime } });
await langfuse.flushAsync();
  console.log("Agent 4 done!");
  console.log("Focus keyword:    " + seoData.focus_keyword);
  console.log("Meta title:       " + seoData.meta_title);
  console.log("Meta description: " + seoData.meta_description);
  console.log("URL slug:         " + seoData.url_slug);
  console.log("Read time:        " + seoData.estimated_read_time);
  console.log("FAQs generated:   " + seoData.faq.length);

  return seoData;
}
