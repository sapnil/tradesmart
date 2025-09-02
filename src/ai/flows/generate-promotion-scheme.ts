'use server';

/**
 * @fileOverview Generates promotion schemes using AI to avoid trade slumps.
 *
 * - generatePromotionScheme - A function that generates promotion schemes.
 * - GeneratePromotionSchemeInput - The input type for the generatePromotionScheme function.
 * - GeneratePromotionSchemeOutput - The return type for the generatePromotionScheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromotionSchemeInputSchema = z.object({
  trendAnalysis: z
    .string()
    .describe(
      'Trend analysis data, which may include sales data, market trends, and competitor activities, to identify potential trade slumps.'
    ),
  productCategory: z
    .string()
    .describe('The product category for which the promotion scheme is being generated.'),
  objective: z
    .string()
    .describe(
      'The objective of the promotion scheme, e.g., to increase sales volume, market share, or customer engagement.'
    ),
  distributorBehavior: z
    .string()
    .optional()
    .describe(
      'Insights into distributor buying patterns, such as bulk buying at month-end, or focusing only on discounted products. This is used to design schemes that prevent misuse.'
    ),
});
export type GeneratePromotionSchemeInput = z.infer<typeof GeneratePromotionSchemeInputSchema>;

const GeneratePromotionSchemeOutputSchema = z.object({
  schemeName: z.string().describe('The name of the generated promotion scheme.'),
  schemeDescription: z.string().describe('A detailed description of the promotion scheme.'),
  targetAudience: z.string().describe('The target audience for the promotion scheme.'),
  promotionMechanics: z.array(z.string()).describe('The promotion mechanics, e.g., discounts, bundles, gifts.'),
  duration: z.string().describe('The duration of the promotion scheme.'),
  budget: z.string().describe('The budget for the promotion scheme.'),
  expectedResults: z.string().describe('The expected results of the promotion scheme.'),
});
export type GeneratePromotionSchemeOutput = z.infer<typeof GeneratePromotionSchemeOutputSchema>;

export async function generatePromotionScheme(input: GeneratePromotionSchemeInput): Promise<GeneratePromotionSchemeOutput> {
  return generatePromotionSchemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromotionSchemePrompt',
  input: {schema: GeneratePromotionSchemeInputSchema},
  output: {schema: GeneratePromotionSchemeOutputSchema},
  prompt: `You are an expert marketing strategist specializing in creating promotion schemes to avoid trade slumps in the FMCG domain in India.

  Based on the trend analysis, product category, and objective, generate a promotion scheme that can help avoid trade slumps.

  Trend Analysis: {{{trendAnalysis}}}
  Product Category: {{{productCategory}}}
  Objective: {{{objective}}}
  {{#if distributorBehavior}}
  Distributor Buying Behavior Insights: {{{distributorBehavior}}}
  {{/if}}

  Consider the following factors when generating the promotion scheme:
  - Market trends
  - Competitor activities
  - Customer preferences
  - Budget constraints
  - **Crucially, analyze the Distributor Buying Behavior to design scheme mechanics that prevent misuse.** For example, if distributors only buy promoted items, suggest a scheme that requires a mix of products. If they buy in bulk at month-end, consider a scheme with a steady, longer-term incentive.

  Provide the promotion scheme in the following format:
  - Scheme Name: [Scheme Name]
  - Scheme Description: [A detailed description of the promotion scheme, including how it prevents misuse]
  - Target Audience: [The target audience for the promotion scheme]
  - Promotion Mechanics: [The promotion mechanics, e.g., discounts, bundles, gifts. Be specific about how they prevent misuse]
  - Duration: [The duration of the promotion scheme]
  - Budget: [The budget for the promotion scheme]
  - Expected Results: [The expected results of the promotion scheme]
  `,
});

const generatePromotionSchemeFlow = ai.defineFlow(
  {
    name: 'generatePromotionSchemeFlow',
    inputSchema: GeneratePromotionSchemeInputSchema,
    outputSchema: GeneratePromotionSchemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
