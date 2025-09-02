'use server';

/**
 * @fileOverview An AI agent that predicts the sales uplift for a new promotion.
 *
 * - predictPromotionUplift - A function that predicts the uplift.
 * - PredictPromotionUpliftInput - The input type for the function.
 * - PredictPromotionUpliftOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const PredictPromotionUpliftInputSchema = z.object({
  promotionJson: z
    .string()
    .describe(
      'The promotion being created, as a JSON string. This includes its type, duration, products, and hierarchy targets.'
    ),
  salesDataJson: z
    .string()
    .describe('Historical sales data as a JSON string.'),
  pastPromotionsJson: z
    .string()
    .describe(
      'Performance data from past promotions as a JSON string, including their uplift.'
    ),
});
export type PredictPromotionUpliftInput = z.infer<
  typeof PredictPromotionUpliftInputSchema
>;

export const PredictPromotionUpliftOutputSchema = z.object({
  predictedUplift: z
    .number()
    .describe('The predicted sales uplift percentage for the promotion.'),
  reasoning: z
    .string()
    .describe(
      'A detailed explanation of the factors that contributed to the predicted uplift, such as seasonality, promotion type, and comparison with past promotions.'
    ),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A confidence score (0-100) for the prediction.'),
});
export type PredictPromotionUpliftOutput = z.infer<
  typeof PredictPromotionUpliftOutputSchema
>;

export async function predictPromotionUplift(
  input: PredictPromotionUpliftInput
): Promise<PredictPromotionUpliftOutput> {
  return predictPromotionUpliftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPromotionUpliftPrompt',
  input: { schema: PredictPromotionUpliftInputSchema },
  output: { schema: PredictPromotionUpliftOutputSchema },
  prompt: `You are a data scientist specializing in FMCG trade marketing analytics. Your task is to predict the sales uplift for a new promotion based on the provided data.

  New Promotion Details:
  {{{promotionJson}}}

  Historical Sales Data:
  {{{salesDataJson}}}

  Past Promotion Performance:
  {{{pastPromotionsJson}}}

  Follow these steps for your analysis:
  1.  Analyze the new promotion's mechanics (type, duration, products, target hierarchies).
  2.  Compare the new promotion with past promotions. Identify similarities and differences. For instance, is it similar to a past successful 'Discount' scheme or a less successful 'Contest' scheme?
  3.  Consider the historical sales data. Is the promotion running during a historically high or low sales period?
  4.  Based on this comprehensive analysis, predict the sales uplift percentage.
  5.  Provide a detailed 'reasoning' for your prediction. Cite specific data points from the past promotions and sales data. For example, "The 'Monsoon Bonanza' (a discount scheme) achieved 15.2% uplift in a similar period. This new scheme is also a discount scheme but targets a wider hierarchy, so uplift is predicted to be slightly higher."
  6.  Provide a 'confidenceScore' (0-100) based on how much relevant historical data is available to support your prediction.
  `,
});

const predictPromotionUpliftFlow = ai.defineFlow(
  {
    name: 'predictPromotionUpliftFlow',
    inputSchema: PredictPromotionUpliftInputSchema,
    outputSchema: PredictPromotionUpliftOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
