'use server';

/**
 * @fileOverview An AI agent that analyzes competitor promotions.
 *
 * - analyzeCompetitorPromotion - A function that analyzes a competitor's offer.
 * - AnalyzeCompetitorPromotionInput - The input type for the function.
 * - AnalyzeCompetitorPromotionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeCompetitorPromotionInputSchema = z
  .object({
    photoDataUri: z
      .string()
      .optional()
      .describe(
        "A photo of the competitor's promotion, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
    promotionText: z
      .string()
      .optional()
      .describe("The text of the competitor's promotion."),
  })
  .refine((data) => !!data.photoDataUri || !!data.promotionText, {
    message: 'Either a photo or promotion text must be provided.',
  });

export type AnalyzeCompetitorPromotionInput = z.infer<
  typeof AnalyzeCompetitorPromotionInputSchema
>;

const AnalyzeCompetitorPromotionOutputSchema = z.object({
  analysis: z.object({
    strengths: z
      .array(z.string())
      .describe('The key strengths of the competitor a an expert in FMCG trade marketing in India would identify.'),
    weaknesses: z
      .array(z.string())
      .describe('The potential weaknesses or loopholes an expert in FMCG trade marketing in India would identify.'),
  }),
  strategy: z
    .string()
    .describe(
      "The likely strategic objective of the competitor's promotion (e.g., market penetration, volume push, brand building)."
    ),
  counterPromotion: z.object({
    schemeName: z.string().describe('A catchy name for the counter-promotion.'),
    schemeDescription: z
      .string()
      .describe('A brief description of the counter-promotion.'),
    promotionMechanics: z
      .array(z.string())
      .describe('The specific mechanics of the suggested counter-promotion.'),
  }),
});

export type AnalyzeCompetitorPromotionOutput = z.infer<
  typeof AnalyzeCompetitorPromotionOutputSchema
>;

export async function analyzeCompetitorPromotion(
  input: AnalyzeCompetitorPromotionInput
): Promise<AnalyzeCompetitorPromotionOutput> {
  return analyzeCompetitorPromotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCompetitorPromotionPrompt',
  input: { schema: AnalyzeCompetitorPromotionInputSchema },
  output: { schema: AnalyzeCompetitorPromotionOutputSchema },
  prompt: `You are an expert FMCG trade marketing strategist in India. Your task is to analyze a competitor's promotion and devise a counter-strategy.

  Analyze the following competitor promotion:
  {{#if photoDataUri}}
  - Promotion Image: {{media url=photoDataUri}}
  {{/if}}
  {{#if promotionText}}
  - Promotion Text: {{{promotionText}}}
  {{/if}}

  Your analysis must include:
  1.  **Analysis**: Identify the key 'strengths' (e.g., high consumer appeal, simple to understand) and 'weaknesses' (e.g., complex redemption, low margin for retailers, potential for misuse) of their offer.
  2.  **Strategy**: Determine the competitor's likely 'strategy' with this promotion. Are they trying to drive volume, increase trial, disrupt your market share, or something else?
  3.  **Counter-Promotion**: Based on your analysis, design a 'counterPromotion'. This should be a smart, effective scheme that your company can run to defend its market position. Provide a creative scheme name, a clear description, and specific promotion mechanics. The counter-promotion should exploit the weaknesses of the competitor's offer.
  `,
});

const analyzeCompetitorPromotionFlow = ai.defineFlow(
  {
    name: 'analyzeCompetitorPromotionFlow',
    inputSchema: AnalyzeCompetitorPromotionInputSchema,
    outputSchema: AnalyzeCompetitorPromotionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
