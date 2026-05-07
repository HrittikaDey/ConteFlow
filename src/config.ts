export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const groqApiKey = requireEnv("GROQ_API_KEY");

export const langfuseConfig = {
  publicKey: requireEnv("LANGFUSE_PUBLIC_KEY"),
  secretKey: requireEnv("LANGFUSE_SECRET_KEY"),
  baseUrl: process.env.LANGFUSE_BASE_URL || "https://us.cloud.langfuse.com",
};

export const supabaseConfig = {
  url: requireEnv("SUPABASE_URL"),
  anonKey: requireEnv("SUPABASE_ANON_KEY"),
};

