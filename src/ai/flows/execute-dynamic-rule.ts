'use server';

/**
 * @fileOverview An AI agent that executes a dynamic rule against an order.
 *
 * - executeDynamicRule - A function that handles the dynamic rule execution.
 */

import { ai } from '@/ai/genkit';
import {
  ExecuteDynamicRuleInput,
  ExecuteDynamicRuleInputSchema,
  ExecuteDynamicRuleOutput,
  ExecuteDynamicRuleOutputSchema,
} from '@/types/rules';

export async function executeDynamicRule(
  input: ExecuteDynamicRuleInput
): Promise<ExecuteDynamicRuleOutput> {
  return executeDynamicRuleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'executeDynamicRulePrompt',
  input: { schema: ExecuteDynamicRuleInputSchema },
  output: { schema: ExecuteDynamicRuleOutputSchema },
  prompt: `You are an expert rule engine for a Trade Promotion Management system. Your task is to evaluate a dynamic rule against a given order. The rule consists of a set of conditions that must ALL be met for a set of actions to be applied.

  First, analyze the incoming order:
  Order Details:
  {{{orderJson}}}

  Next, here is the dynamic rule to evaluate:
  Rule Details:
  {{{ruleJson}}}

  Finally, here is the hierarchy data needed for evaluation:
  Organization Hierarchy:
  {{{organizationHierarchyJson}}}

  Product Hierarchy:
  {{{productHierarchyJson}}}

  Follow these steps carefully:
  1.  Iterate through EACH condition in the rule's 'conditions' array.
  2.  For each condition, evaluate if the order satisfies it. Use the provided hierarchy data when necessary (e.g., for 'customerHierarchy' or 'productHierarchy' conditions).
  3.  ALL conditions must be satisfied for the rule to be applicable. If even one condition fails, the rule is not applicable.
  4.  In the 'reasoning' field, provide a detailed, step-by-step explanation of your evaluation process. For EACH condition, state whether it passed or failed and why. This is the most important part of the output.
  5.  If all conditions pass, set 'isApplicable' to true. Otherwise, set it to false.
  6.  If 'isApplicable' is true, describe the actions from the rule's 'actions' array that would be applied to the order in the 'appliedActions' array. For each action, describe what it does (e.g., "Applied a 10% discount on all Beverage products.").
  7.  If 'isApplicable' is false, the 'appliedActions' array should be empty.
  `,
});

const executeDynamicRuleFlow = ai.defineFlow(
  {
    name: 'executeDynamicRuleFlow',
    inputSchema: ExecuteDynamicRuleInputSchema,
    outputSchema: ExecuteDynamicRuleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
