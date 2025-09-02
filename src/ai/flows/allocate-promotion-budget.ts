'use server';

/**
 * @fileOverview An AI agent that recommends how to allocate a promotion budget.
 *
 * - allocatePromotionBudget - A function that recommends budget allocation.
 * - AllocatePromotionBudgetInput - The input type for the function.
 * - AllocatePromotionBudgetOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AllocatePromotionBudgetInputSchema = z.object({
  totalBudget: z.number().describe('The total budget available for promotion.'),
  allocationStrategy: z
    .enum(['Maximize ROI', 'Maximize Volume', 'Market Share Growth'])
    .describe('The primary strategic goal for the budget allocation.'),
  historicalSalesJson: z
    .string()
    .describe('Historical sales data as a JSON string.'),
  productHierarchyJson: z
    .string()
    .describe('The product hierarchy as a JSON string.'),
  organizationHierarchyJson: z
    .string()
    .describe('The organizational hierarchy as a JSON string.'),
  pastPromotionsJson: z
    .string()
    .describe('Performance data from past promotions as a JSON string.'),
});
export type AllocatePromotionBudgetInput = z.infer<typeof AllocatePromotionBudgetInputSchema>;

const AllocationRecommendationSchema = z.object({
    targetType: z.enum(['Product Category', 'Region', 'Distributor Tier', 'Brand']),
    targetName: z.string().describe('The name of the category, region, or tier.'),
    allocatedBudget: z.number().describe('The amount of budget allocated.'),
    reasoning: z.string().describe('The justification for this specific allocation.'),
});

const AllocatePromotionBudgetOutputSchema = z.object({
  recommendations: z.array(AllocationRecommendationSchema).describe('A list of budget allocation recommendations.'),
  summary: z.string().describe('An overall summary of the allocation strategy and rationale.'),
});
export type AllocatePromotionBudgetOutput = z.infer<typeof AllocatePromotionBudgetOutputSchema>;

export async function allocatePromotionBudget(
  input: AllocatePromotionBudgetInput
): Promise<AllocatePromotionBudgetOutput> {
  return allocatePromotionBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'allocatePromotionBudgetPrompt',
  input: { schema: AllocatePromotionBudgetInputSchema },
  output: { schema: AllocatePromotionBudgetOutputSchema },
  prompt: `You are an expert trade marketing financial analyst for an FMCG company in India. Your task is to recommend a budget allocation for promotions based on the provided data and strategic goal.

  Total Budget: {{{totalBudget}}}
  Strategic Goal: {{{allocationStrategy}}}

  Available Data:
  - Historical Sales: {{{historicalSalesJson}}}
  - Product Hierarchy: {{{productHierarchyJson}}}
  - Organization Hierarchy: {{{organizationHierarchyJson}}}
  - Past Promotion Performance: {{{pastPromotionsJson}}}

  Instructions:
  1.  Analyze all the provided data in the context of the chosen 'Strategic Goal'.
  2.  If the goal is 'Maximize ROI', focus on allocating budget to products/regions that have historically shown high uplift with profitable promotions (e.g., high-margin products, successful discount schemes).
  3.  If the goal is 'Maximize Volume', prioritize high-volume products or regions with high sales potential, even if the margins are lower. Consider schemes like 'QPS' or 'Bundles' that drive volume.
  4.  If the goal is 'Market Share Growth', identify emerging markets or categories where the company is losing to competitors. Allocate budget to aggressive schemes to capture market share.
  5.  Develop a set of allocation recommendations. You can allocate by product category, brand, region, or a combination.
  6.  For each recommendation, provide the target, the allocated amount, and a clear, data-driven 'reasoning'. For example, "Allocate 40% to North Region because it contributes to 60% of sales and has responded well to discount schemes in the past (15.2% uplift)."
  7.  Provide an overall 'summary' explaining your high-level strategy and how the individual allocations work together to achieve the main goal.
  8.  Ensure the sum of all 'allocatedBudget' in your recommendations equals the 'totalBudget'.
  `,
});

const allocatePromotionBudgetFlow = ai.defineFlow(
  {
    name: 'allocatePromotionBudgetFlow',
    inputSchema: AllocatePromotionBudgetInputSchema,
    outputSchema: AllocatePromotionBudgetOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
