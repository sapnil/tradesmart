'use server';

/**
 * @fileOverview An AI agent that evaluates a dynamic promotion rule against an order.
 *
 * - evaluateDynamicRule - A function that evaluates a rule.
 */

import { ai } from '@/ai/genkit';
import {
  EvaluateDynamicRuleInput,
  EvaluateDynamicRuleInputSchema,
  EvaluateDynamicRuleOutput,
  EvaluateDynamicRuleOutputSchema,
} from '@/types/rules';

export async function evaluateDynamicRule(
  input: EvaluateDynamicRuleInput
): Promise<EvaluateDynamicRuleOutput> {
  return evaluateDynamicRuleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateDynamicRulePrompt',
  input: { schema: EvaluateDynamicRuleInputSchema },
  output: { schema: EvaluateDynamicRuleOutputSchema },
  prompt: `You are an expert rule engine for a Trade Promotion Management system. Your task is to evaluate a dynamic promotion rule against a given order.

  Order Details:
  {{{orderJson}}}

  Dynamic Promotion Rule:
  {{{ruleJson}}}

  Available Hierarchies:
  - Organization Hierarchy: {{{organizationHierarchyJson}}}
  - Product Hierarchy: {{{productHierarchyJson}}}

  Instructions:
  1.  You must evaluate EACH condition defined in the 'conditions' array of the rule.
  2.  For a condition to pass, the order must satisfy its requirements. Use the provided hierarchies to check for parentage (e.g., if a distributor belongs to a targeted region, or a product belongs to a targeted category).
  3.  **All conditions must pass for the rule to be considered 'applicable'.** If even one condition fails, the entire rule is not applicable.
  4.  Provide a detailed, step-by-step 'reasoning'. For each condition, state whether it passed or failed and why. This is the most critical part of your output.
  5.  If all conditions pass, set 'applicable' to true and include the actions from the rule in the 'appliedActions' array.
  6.  If any condition fails, set 'applicable' to false and do not include any 'appliedActions'.
  `,
});

const evaluateDynamicRuleFlow = ai.defineFlow(
  {
    name: 'evaluateDynamicRuleFlow',
    inputSchema: EvaluateDynamicRuleInputSchema,
    outputSchema: EvaluateDynamicRuleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
