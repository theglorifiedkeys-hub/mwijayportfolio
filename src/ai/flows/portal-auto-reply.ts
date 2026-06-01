'use server';
/**
 * @fileOverview Client Portal Automated AI Responder.
 * Handles auto-replies when the admin is away.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PortalAutoReplyInputSchema = z.object({
  clientName: z.string().describe("The name of the client asking the question."),
  clientMessage: z.string().describe("The message sent by the client."),
  projectName: z.string().describe("The name of the project the client is tracking."),
  adminStatus: z.string().optional().default("OFFLINE (UAUT Academic Intensification Phase)"),
});

const PortalAutoReplyOutputSchema = z.object({
  reply: z.string().describe("The AI's automated response."),
  isUrgent: z.boolean().describe("Whether the message sounds like an emergency."),
});

export async function portalAutoReply(input: z.infer<typeof PortalAutoReplyInputSchema>) {
  const prompt = ai.definePrompt({
    name: 'portalAutoReplyPrompt',
    input: { schema: PortalAutoReplyInputSchema },
    output: { schema: PortalAutoReplyOutputSchema },
    prompt: `You are the AI Assistant for Mwijay Services. 
A client named {{{clientName}}} has sent a message regarding their project "{{{projectName}}}".

The Lead Architect (David) is currently: {{{adminStatus}}}.

INSTRUCTIONS:
1. Be professional, high-tech, and reassuring.
2. Acknowledge their message: "{{{clientMessage}}}"
3. Explain that David is currently in a high-intensity academic season at UAUT (University) and might take up to 6-12 hours to respond personally.
4. If it's very urgent, tell them to call David directly at +255 620 641 695.
5. Do NOT try to solve technical problems, just acknowledge and provide the "Signal Received" confirmation.
6. Use a mix of professional English and friendly Swahili if appropriate (e.g. "Karibu back", "Mambo yatakuwa sawa").

Client Message: {{{clientMessage}}}
`,
  });

  const { output } = await prompt(input);
  return output!;
}
