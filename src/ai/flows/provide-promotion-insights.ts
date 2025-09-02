'use server';

/**
 * @fileOverview An AI agent that provides data-driven insights to support promotion creation.
 *
 * - providePromotionInsights - A function that provides insights for promotion creation.
 * - ProvidePromotionInsightsInput - The input type for the providePromotionInsights function.
 * - ProvidePromotionInsightsOutput - The return type for the providePromotionInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvidePromotionInsightsInputSchema = z.object({
  salesData: z
    .string()
    .describe('Sales data, as a JSON string, for the products being promoted.'),
  marketTrends: z
    .string()
    .describe('Market trends, as a JSON string, related to the product category.'),
  promotionHistory: z
    .string()
    .optional()
    .describe(
      'Promotion history, as a JSON string, including past promotion performance data.'
    ),
});
export type ProvidePromotionInsightsInput = z.infer<
  typeof ProvidePromotionInsightsInputSchema
>;

const ProvidePromotionInsightsOutputSchema = z.object({
  insights: z.string().describe('Data-driven insights to support promotion creation.'),
  recommendations:
    z.string().describe('Recommendations for effective promotion strategies.'),
});
export type ProvidePromotionInsightsOutput = z.infer<
  typeof ProvidePromotionInsightsOutputSchema
>;

export async function providePromotionInsights(
  input: ProvidePromotionInsightsInput
): Promise<ProvidePromotionInsightsOutput> {
  return providePromotionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'providePromotionInsightsPrompt',
  input: {schema: ProvidePromotionInsightsInputSchema},
  output: {schema: ProvidePromotionInsightsOutputSchema},
  prompt: `You are a sales and market analysis expert providing insights for promotion creation.

  Analyze the provided sales data, market trends, and promotion history (if available) to generate actionable insights and recommendations for creating effective promotion strategies.

  Sales Data:
  {{salesData}}

  Market Trends:
  {{marketTrends}}

  Promotion History:
  {{#if promotionHistory}}
  Promotion History:
  {{promotionHistory}}
  {{/if}}

  Based on this information, provide data-driven insights and recommendations for promotion strategies.
  Be specific and focus on avoiding trade slumps.
  Ensure that you provide the insights and recommendations in a well formatted human readable manner.
`,
});

const providePromotionInsightsFlow = ai.defineFlow(
  {
    name: 'providePromotionInsightsFlow',
    inputSchema: ProvidePromotionInsightsInputSchema,
    outputSchema: ProvidePromotionInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
