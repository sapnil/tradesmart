
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

  Available Data:
  - All Promotions: {{{promotionsJson}}}
  - All External Factors (Master Data): {{{externalFactorsJson}}}
  - Organization Hierarchy: {{{organizationHierarchyJson}}}
  - Historical Sales Data: {{{historicalSalesJson}}}
  - Historical Orders: {{{ordersJson}}}

  Instructions:
  1.  First, identify the selected promotion from the 'All Promotions' list using its ID. Note its start and end dates.
  2.  Identify the selected hierarchy node from the 'Organization Hierarchy' data. Determine all child distributors and parent regions/states that fall under this node.
  3.  **Crucially, analyze the 'All External Factors' master data. Find all factors whose date ranges overlap with the promotion's date range AND whose 'applicableHierarchyIds' are relevant to the selected 'Target Hierarchy Node' or its parents.**
  4.  Filter the 'Historical Orders' to find orders placed by distributors in the target hierarchy. This is your primary data for analyzing past behavior in this specific area.
  5.  Analyze the mechanics of the selected promotion. Is it a discount, bundle, etc.? Does it align with promotion types that have performed well in this area historically?
  6.  **Incorporate the relevant external factors you identified into your analysis.**
      - For 'Seasonality' factors (e.g., 'Peak Season' like a heatwave), the baseline sales and potential uplift could be higher. If 'Off-Season', the impact might be muted.
      - If there is significant 'CompetitorActivity', it may reduce your predicted uplift.
      - 'LocalEvents' like festivals could create a temporary surge in demand.
  7.  Based on the buying patterns in the filtered historical orders and the full external context, predict which distributors are likely to participate. List their names in 'participatingDistributors'.
  8.  Calculate the baseline sales for this area, adjusting for seasonality if applicable based on the external factors.
  9.  Based on past performance of similar promotions, likely participation, and all external factors, predict the sales 'predictedUplift' (as a percentage).
  10. Estimate the 'estimatedFinancialImpact' (additional revenue) this uplift will generate from the baseline sales.
  11. Provide a detailed 'reasoning' for your forecast. Justify your predictions by referencing specific distributors, their past behaviors, the relevant external factors you found, and how they all interact. For example, "Although this is a strong promotion, the 'FizzUp BOGO Offer' external factor is active in this region, which will likely reduce uplift to 12%."
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
