'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIAgreementGeneratorInputSchema = z.object({
  projectTitle: z.string().describe("The title of the project to generate a solution specification for."),
  description: z.string().optional().describe("An optional short description or brief from the client."),
  serviceType: z.string().optional().describe("The service type node under discussion.")
});

const AIAgreementGeneratorOutputSchema = z.object({
  projectMission: z.string().describe("A professional, inspiring project mission statement."),
  features: z.string().describe("A comma-separated list of 4-6 highly specific technical features or modules."),
  targetAudience: z.string().describe("A comma-separated list of 3-4 target customer or user segments."),
  description: z.string().describe("An expanded, technical and professional system narrative overview.")
});

const agreementGeneratorPrompt = ai.definePrompt({
  name: 'agreementGeneratorPrompt_v1',
  input: { schema: AIAgreementGeneratorInputSchema },
  output: { schema: AIAgreementGeneratorOutputSchema },
  prompt: `
You are an elite systems architect, product manager, and technical solutions engineer.
Compose a highly detailed, professional project specification and requirements blueprint based on the following details:
Project Title: {{{projectTitle}}}
Service Type: {{{serviceType}}}
Brief Description: {{{description}}}

Follow these guidelines strictly:
1. **Project Mission Statement (projectMission)**: Formulate an inspiring, professional mission statement (approx 20-30 words) focused on digital authority, speed, reliability, and business impact. Can use high-performance technical English or professional Swahili-Tech hybrid (e.g. "Kujenga mfumo thabiti...", "Kuwezesha digital presence...") if Swahili context is present in description, otherwise English.
2. **Technical Features (features)**: Create a comma-separated list of exactly 4-6 highly specific, modular features/components relevant to the project (e.g., "Secure Stripe payment gateway, Real-time SMS notifications via Twilio, Dynamic admin dashboard with charts, Multi-factor auth via Firebase"). Do NOT make them generic.
3. **Strategic Target Audience (targetAudience)**: Define 3-4 specific user groups or demographics (e.g., "Local retail shoppers, System administrators, Small business owners, Corporate partners") as a comma-separated string.
4. **Narrative Overview (description)**: Expand the initial description into a comprehensive, paragraph-long technical and business narrative explaining the architectural value, usability, and design goals of the system.
`
});

const aiAgreementGeneratorFlow = ai.defineFlow(
  {
    name: 'aiAgreementGeneratorFlow_v1',
    inputSchema: AIAgreementGeneratorInputSchema,
    outputSchema: AIAgreementGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await agreementGeneratorPrompt(input);
    if (!output) throw new Error("Failed to generate solution specification");
    return output;
  }
);

export async function aiGenerateAgreement(projectTitle: string, description = "", serviceType = "") {
  try {
    const data = await aiAgreementGeneratorFlow({ projectTitle, description, serviceType });
    return { success: true, data };
  } catch (err: any) {
    console.error("Genkit Agreement Generation Error:", err);
    let errMsg = err.message || "An unknown error occurred during agreement generation.";
    if (errMsg.includes("API key") || errMsg.includes("API_KEY") || errMsg.includes("credentials") || errMsg.includes("authorized") || errMsg.includes("key")) {
      errMsg += " Please ensure your GEMINI_API_KEY environment variable is correctly configured in your Vercel project settings.";
    }
    return { success: false, error: errMsg };
  }
}
