'use server';

/**
 * @fileOverview An AI agent that simulates the impact of a promotion on a specific organizational hierarchy.
 *
 * - simulatePromotionImpact - A function that runs the simulation.
 * - SimulatePromotionImpactInput - The input type for the function.
 * - SimulatePromotionImpactOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SimulatePromotionImpactInputSchema = z.object({
  promotionId: z.string().describe('The ID of the promotion to simulate.'),
  hierarchyId: z
    .string()
    .describe(
      'The ID of the organization hierarchy node (e.g., Region, State) to run the simulation on.'
    ),
  promotionsJson: z
    .string()
    .describe('A JSON string of all available promotions.'),
  historicalSalesJson: z
    .string()
    .describe(
      'Historical sales data for the entire organization as a JSON string.'
    ),
  ordersJson: z.string().describe('A JSON string of all past orders.'),
  organizationHierarchyJson: z
    .string()
    .describe('The organizational hierarchy as a JSON string.'),
});
export type SimulatePromotionImpactInput = z.infer<
  typeof SimulatePromotionImpactInputSchema
>;

export const SimulatePromotionImpactOutputSchema = z.object({
  predictedUplift: z
    .number()
    .describe(
      'The predicted sales uplift percentage specifically for the selected hierarchy.'
    ),
  estimatedFinancialImpact: z
    .number()
    .describe(
      'The estimated additional revenue generated within the selected hierarchy due to the promotion.'
    ),
  participatingDistributors: z
    .array(z.string())
    .describe(
      'A list of distributor names within the selected hierarchy who are likely to participate.'
    ),
  reasoning: z
    .string()
    .describe(
      'A detailed explanation for the prediction, referencing historical data, promotion type, and buying patterns in the selected area.'
    ),
});
export type SimulatePromotionImpactOutput = z.infer<
  typeof SimulatePromotionImpactOutputSchema
>;

export async function simulatePromotionImpact(
  input: SimulatePromotionImpactInput
): Promise<SimulatePromotionImpactOutput> {
  return simulatePromotionImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulatePromotionImpactPrompt',
  input: { schema: SimulatePromotionImpactInputSchema },
  output: { schema: SimulatePromotionImpactOutputSchema },
  prompt: `You are a highly skilled FMCG sales forecasting analyst. Your task is to simulate the impact of a specific promotion on a designated part of the organization.

  Simulation Parameters:
  - Promotion to Simulate (ID): {{{promotionId}}}
  - Target Hierarchy Node (ID): {{{hierarchyId}}}

  Available Data:
  - All Promotions: {{{promotionsJson}}}
  - Organization Hierarchy: {{{organizationHierarchyJson}}}
  - Historical Sales Data: {{{historicalSalesJson}}}
  - Historical Orders: {{{ordersJson}}}

  Instructions:
  1.  Identify the selected promotion from the 'All Promotions' list using its ID.
  2.  Identify the selected hierarchy node from the 'Organization Hierarchy' data. Determine all child distributors that fall under this node.
  3.  Filter the 'Historical Orders' to find orders placed by these identified distributors. This is your primary data for analyzing past behavior in this specific area.
  4.  Analyze the mechanics of the selected promotion. Is it a discount, bundle, etc.? Does it align with promotion types that have performed well in this area historically (based on past orders with applied promotions)?
  5.  Based on the buying patterns in the filtered historical orders, predict which distributors are likely to participate. List their names in 'participatingDistributors'.
  6.  Calculate the baseline sales for this area.
  7.  Based on past performance of similar promotions and the likely participation, predict the sales 'predictedUplift' (as a percentage).
  8.  Estimate the 'estimatedFinancialImpact' (additional revenue) this uplift will generate from the baseline sales.
  9.  Provide a detailed 'reasoning' for your forecast. Justify your predictions by referencing the specific distributors, their past behaviors, and the alignment of the promotion with the local market conditions observed in the data.
  `,
});

const simulatePromotionImpactFlow = ai.defineFlow(
  {
    name: 'simulatePromotionImpactFlow',
    inputSchema: SimulatePromotionImpactInputSchema,
    outputSchema: SimulatePromotionImpactOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
