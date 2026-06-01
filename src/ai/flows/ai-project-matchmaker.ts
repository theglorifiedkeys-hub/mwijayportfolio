'use server';
/**
 * @fileOverview Elite AI Concierge v2 — Mwijay Services
 * - Smart intent detection
 * - Context-aware navigation
 * - Emotion filtering
 * - Dynamic action signals
 * - Lead conversion optimized
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIProjectMatchmakerInputSchema = z.object({
  query: z.string().describe("The user's message to Mwijay's AI Assistant."),
  language: z.enum(['en', 'sw']).optional().default('en'),
  sessionContext: z.object({
    currentPage: z.string().optional(),
    userAuthenticated: z.boolean().optional(),
  }).optional()
});
export type AIProjectMatchmakerInput = z.infer<typeof AIProjectMatchmakerInputSchema>;

const AIProjectMatchmakerOutputSchema = z.object({
  response: z.string(),
  intent: z.enum([
    'contact',
    'call',
    'pricing',
    'portfolio',
    'tracking',
    'start_project',
    'about',
    'general',
    'blocked'
  ]).optional(),
  confidence: z.number().optional(),
  suggestedProjects: z.array(z.string()).optional(),
  suggestedActions: z.array(z.object({
    label: z.string(),
    link: z.string(),
    type: z.enum(['whatsapp', 'call', 'nav', 'theme'])
  })).optional(),
});
export type AIProjectMatchmakerOutput = z.infer<typeof AIProjectMatchmakerOutputSchema>;

/* ════════════════════════════════════════
   KNOWLEDGE REGISTRY
════════════════════════════════════════ */
const portfolioData = `
# Identity Node: David Erick Mwijage
- Role: Systems Architect & AI Automation Engineer.
- WhatsApp: https://wa.me/255620641695
- Call: +255 620 641 695
- Location: Dar es Salaam, Tanzania.

## Navigation Registry:
- Projects: '/projects'
- Pricing: '/pricing'
- Track Order: '/track-order'
- Start Project: '/book'
- About: '/about'

## Capabilities:
- Next.js 15 Enterprise Systems
- AI Agents & Automation Pipelines
- SaaS Architecture
- Branding & UI/UX Systems
`;

/* ════════════════════════════════════════
   PROMPT DEFINITION
════════════════════════════════════════ */
const projectMatchmakerPrompt = ai.definePrompt({
  name: 'projectMatchmakerPrompt_v2',
  input: { schema: AIProjectMatchmakerInputSchema },
  output: { schema: AIProjectMatchmakerOutputSchema },
  prompt: `
You are the ELITE AI CONCIERGE for Mwijay Services.

Your purpose:
- Detect user intent.
- Guide navigation.
- Trigger action signals.
- Convert visitors into leads.
- Maintain technical professionalism.

STRICT PROTOCOLS:

1. ABUSE FILTER:
If insults, hate speech, or disrespect are detected:
→ intent: "blocked"
→ response: "Signal Rejected. Please maintain technical decorum."
→ No suggestedActions.

2. CONTACT DETECTION:
If user says: talk, chat, WhatsApp, message, DM
→ intent: "contact"
→ Provide WhatsApp handshake link.
→ Prefill WhatsApp message with:
   "Hi Mwijay, I would like to discuss my project: [USER_TOPIC]"

3. CALL DETECTION:
If user wants phone call
→ intent: "call"
→ Tell them to dial +255 620 641 695.

4. PRICING:
If user asks about price, cost, budget
→ intent: "pricing"
→ Navigate to '/pricing'

5. PORTFOLIO:
If user asks to see work
→ intent: "portfolio"
→ Navigate to '/projects'

6. TRACKING:
If user mentions order ID or tracking
→ intent: "tracking"
→ Navigate to '/track-order'

7. START PROJECT:
If user wants to begin
→ intent: "start_project"
→ Navigate to '/book'

8. LANGUAGE MODE:
If language = "sw"
→ Use professional Swahili-Tech hybrid tone.

9. VIBE:
Use high-tech tone like:
- "Signal Received."
- "Protocol Initiated."
- "Handshake Link Generated."
- "Architecture Pathway Activated."

KNOWLEDGE BASE:
${portfolioData}

User Message:
{{{query}}}
`,
});

/* ════════════════════════════════════════
   FLOW EXECUTION
════════════════════════════════════════ */
const aiProjectMatchmakerFlow = ai.defineFlow(
  {
    name: 'aiProjectMatchmakerFlow_v2',
    inputSchema: AIProjectMatchmakerInputSchema,
    outputSchema: AIProjectMatchmakerOutputSchema,
  },
  async (input) => {
    const { output } = await projectMatchmakerPrompt(input);
    if (!output) throw new Error("No output generated");

    // Confidence boost logic
    return {
      ...output,
      response: output.response || "",
      confidence: output.confidence ?? 0.92
    };
  }
);

export async function aiProjectMatchmaker(
  input: AIProjectMatchmakerInput
): Promise<AIProjectMatchmakerOutput> {
  return aiProjectMatchmakerFlow(input);
}