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
  prompt: `You are a highly skilled FMCG sales forecasting analyst. Your task is to simulate the impact of a specific promotion on a designated part of the organization, considering various internal and external factors.

  Simulation Parameters:
  - Promotion to Simulate (ID): {{{promotionId}}}
  - Target Hierarchy Node (ID): {{{hierarchyId}}}

  External Factors:
  - Seasonality: {{{seasonality}}}
  {{#if competitorActivity}}
  - Competitor Activity: {{{competitorActivity}}}
  {{/if}}
  {{#if localEvents}}
  - Local Events/Holidays: {{{localEvents}}}
  {{/if}}

  Available Data:
  - All Promotions: {{{promotionsJson}}}
  - Organization Hierarchy: {{{organizationHierarchyJson}}}
  - Historical Sales Data: {{{historicalSalesJson}}}
  - Historical Orders: {{{ordersJson}}}

  Instructions:
  1.  Identify the selected promotion from the 'All Promotions' list using its ID.
  2.  Identify the selected hierarchy node from the 'Organization Hierarchy' data. Determine all child distributors that fall under this node.
  3.  Filter the 'Historical Orders' to find orders placed by these identified distributors. This is your primary data for analyzing past behavior in this specific area.
  4.  Analyze the mechanics of the selected promotion. Is it a discount, bundle, etc.? Does it align with promotion types that have performed well in this area historically?
  5.  **Crucially, incorporate the External Factors into your analysis.**
      - If 'Seasonality' is 'Peak Season' (e.g., summer for beverages), the baseline sales and potential uplift could be higher. If 'Off-Season', the impact might be muted.
      - If there is significant 'Competitor Activity', it may reduce your predicted uplift.
      - 'Local Events' like festivals could create a temporary surge in demand.
  6.  Based on the buying patterns in the filtered historical orders and the external context, predict which distributors are likely to participate. List their names in 'participatingDistributors'.
  7.  Calculate the baseline sales for this area, adjusting for seasonality if applicable.
  8.  Based on past performance of similar promotions, likely participation, and all external factors, predict the sales 'predictedUplift' (as a percentage).
  9.  Estimate the 'estimatedFinancialImpact' (additional revenue) this uplift will generate from the baseline sales.
  10. Provide a detailed 'reasoning' for your forecast. Justify your predictions by referencing specific distributors, their past behaviors, the external factors, and how they all interact. For example, "Although this is a strong promotion, a competitor is running a BOGO offer, so uplift is slightly reduced to 12%."
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
