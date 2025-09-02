'use server';

/**
 * @fileOverview An AI agent that simulates a rule engine to apply promotions to orders.
 *
 * - applyPromotionRules - A function that simulates the rule engine.
 */

import { ai } from '@/ai/genkit';
import {
  ApplyPromotionRulesInput,
  ApplyPromotionRulesInputSchema,
  ApplyPromotionRulesOutput,
  ApplyPromotionRulesOutputSchema,
} from '@/types/promotions';

export async function applyPromotionRules(
  input: ApplyPromotionRulesInput
): Promise<ApplyPromotionRulesOutput> {
  return applyPromotionRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'applyPromotionRulesPrompt',
  input: { schema: ApplyPromotionRulesInputSchema },
  output: { schema: ApplyPromotionRulesOutputSchema },
  prompt: `You are an expert rule engine for a Trade Promotion Management system. Your task is to find the best promotion to apply to a given order based on a set of active promotions and their rules.

  First, analyze the incoming order:
  Order Details:
  {{{orderJson}}}

  Next, consider the available hierarchies:
  Organization Hierarchy:
  {{{organizationHierarchyJson}}}

  Product Hierarchy:
  {{{productHierarchyJson}}}

  Now, evaluate the order against the list of active promotions:
  Available Promotions:
  {{{promotionsJson}}}

  Follow these steps carefully:
  1. For EACH promotion, check if the order satisfies ALL its conditions (hierarchy, products, quantities, dates).
  2. The promotion's 'hierarchyIds' must contain a hierarchy element that the order's distributor belongs to. Use the organization hierarchy to trace parentage.
  3. The promotion's 'productHierarchyIds' must contain a product hierarchy element that at least one item in the order belongs to. Use the product hierarchy to trace parentage.
  4. If a promotion has specific product rules ('products' array), the order must satisfy those rules (e.g., buy X quantity of Product A to get Y quantity of Product B).
  5. If multiple promotions are applicable, choose the one that offers the best value or is most specific. If no promotions are applicable, state that clearly.
  6. Provide a 'bestPromotionId' which should be the ID of the selected promotion, or null if none apply.
  7. In the 'reasoning' field, provide a detailed, step-by-step explanation for your choice. Explain which rules were checked for the most likely promotions and what the outcome was (pass/fail). This is the most important part of the output.
  `,
});

const applyPromotionRulesFlow = ai.defineFlow(
  {
    name: 'applyPromotionRulesFlow',
    inputSchema: ApplyPromotionRulesInputSchema,
    outputSchema: ApplyPromotionRulesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
