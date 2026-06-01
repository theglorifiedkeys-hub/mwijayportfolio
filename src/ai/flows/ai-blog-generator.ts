'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIBlogGeneratorInputSchema = z.object({
  topic: z.string().describe("The topic or prompt for the blog post."),
  tone: z.string().optional().default("technical and professional"),
  category: z.string().optional().default("Tech Strategy")
});

const AIBlogGeneratorOutputSchema = z.object({
  title: z.string().describe("The generated high-retention title for the blog post."),
  excerpt: z.string().describe("A brief, engaging 1-2 sentence excerpt summarizing the blog post."),
  content: z.string().describe("The full markdown formatted body content of the blog post.")
});

const blogGeneratorPrompt = ai.definePrompt({
  name: 'blogGeneratorPrompt_v1',
  input: { schema: AIBlogGeneratorInputSchema },
  output: { schema: AIBlogGeneratorOutputSchema },
  prompt: `
You are an expert tech writer and systems architect. Write a high-retention blog post about the following topic:
Topic: {{{topic}}}
Tone: {{{tone}}}
Category: {{{category}}}

Follow these guidelines:
1. Compose a highly engaging, click-worthy title.
2. Write a clear, short abstract excerpt (approx 30-50 words).
3. The content must be in clean Markdown formatting. Focus on precision, engineering excellence, and actual insights.
4. Structure the content with clear headers (H2/H3), bullet points, and clean syntax highlights if code examples are relevant.
5. Use high-performance terminology matching the rest of the Mwijay portfolio (e.g., signals, architecture nodes, logic flow, registries).
`
});

const aiBlogGeneratorFlow = ai.defineFlow(
  {
    name: 'aiBlogGeneratorFlow_v1',
    inputSchema: AIBlogGeneratorInputSchema,
    outputSchema: AIBlogGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await blogGeneratorPrompt(input);
    if (!output) throw new Error("Failed to generate blog content");
    return output;
  }
);

export async function aiGenerateBlog(topic: string, tone = "technical and professional", category = "Tech Strategy") {
  return aiBlogGeneratorFlow({ topic, tone, category });
}
