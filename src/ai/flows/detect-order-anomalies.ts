'use server';

/**
 * @fileOverview An AI agent that detects anomalies in orders to prevent scheme misuse.
 *
 * - detectOrderAnomalies - A function that analyzes orders for suspicious patterns.
 * - DetectOrderAnomaliesInput - The input type for the function.
 * - DetectOrderAnomaliesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectOrderAnomaliesInputSchema = z.object({
  ordersJson: z.string().describe('A JSON string of recent orders.'),
  promotionsJson: z
    .string()
    .describe('A JSON string of active and past promotions for context.'),
});
export type DetectOrderAnomaliesInput = z.infer<
  typeof DetectOrderAnomaliesInputSchema
>;

const AnomalySchema = z.object({
  orderId: z.string().describe('The ID of the anomalous order.'),
  distributorName: z
    .string()
    .describe('The name of the distributor who placed the order.'),
  severity: z.enum(['Low', 'Medium', 'High']).describe('The severity of the anomaly.'),
  reason: z
    .string()
    .describe('A detailed explanation of why the order is considered anomalous.'),
  recommendation: z
    .string()
    .describe('A recommended action to take, e.g., "Review manually" or "Flag for audit".'),
});

const DetectOrderAnomaliesOutputSchema = z.object({
  anomalies: z.array(AnomalySchema).describe('A list of detected anomalies.'),
});
export type DetectOrderAnomaliesOutput = z.infer<
  typeof DetectOrderAnomaliesOutputSchema
>;

export async function detectOrderAnomalies(
  input: DetectOrderAnomaliesInput
): Promise<DetectOrderAnomaliesOutput> {
  return detectOrderAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectOrderAnomaliesPrompt',
  input: { schema: DetectOrderAnomaliesInputSchema },
  output: { schema: DetectOrderAnomaliesOutputSchema },
  prompt: `You are a fraud detection analyst for a large FMCG company in India. Your job is to analyze a batch of recent orders and identify any suspicious patterns that might indicate misuse of trade promotion schemes.

  Here are the recent orders:
  {{{ordersJson}}}

  Here are the active and past promotions for context:
  {{{promotionsJson}}}

  Analyze the orders for the following types of anomalies:
  1.  **Splitting Orders**: A distributor placing multiple small orders that each barely qualify for a promotion, instead of one larger order. This maximizes their promotional benefits.
  2.  **High Frequency**: A single distributor claiming the same promotion an unusually high number of times in a short period.
  3.  **Product Mix Exploitation**: Orders that contain the exact product mix and quantity to qualify for a promotion, but deviate significantly from the distributor's typical purchasing patterns.
  4.  **Suspicious Timing**: A sudden spike in orders from a distributor just before a promotion is about to expire.
  5.  **Cross-Promotion Exploitation**: Orders that seem structured to take advantage of loopholes across multiple overlapping promotions.

  For each anomaly you identify, create an entry in the 'anomalies' array. Include the order ID, distributor name, a severity level (Low, Medium, High), a clear 'reason' explaining the suspicious pattern you detected, and a 'recommendation' for the sales team.

  If you find no anomalies, return an empty 'anomalies' array.
  `,
});

const detectOrderAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectOrderAnomaliesFlow',
    inputSchema: DetectOrderAnomaliesInputSchema,
    outputSchema: DetectOrderAnomaliesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
