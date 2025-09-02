'use server';

/**
 * @fileOverview An AI agent that predicts the sales uplift for a new promotion.
 *
 * - predictPromotionUplift - A function that predicts the uplift.
 */

import { ai } from '@/ai/genkit';
import {
  PredictPromotionUpliftInput,
  PredictPromotionUpliftInputSchema,
  PredictPromotionUpliftOutput,
  PredictPromotionUpliftOutputSchema,
} from '@/types/promotions';

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
