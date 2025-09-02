'use server';

/**
 * @fileOverview An AI agent that simulates the impact of a promotion on a specific organizational hierarchy.
 *
 * - simulatePromotionImpact - A function that runs the simulation.
 */

import { ai } from '@/ai/genkit';
import {
  SimulatePromotionImpactInput,
  SimulatePromotionImpactInputSchema,
  SimulatePromotionImpactOutput,
  SimulatePromotionImpactOutputSchema,
} from '@/types/promotions';

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
