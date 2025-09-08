
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
  prompt: `You are an expert rule engine for a Trade Promotion Management system. Your task is to evaluate a dynamic rule against a given order. The rule consists of condition groups and a set of actions. The rule is applicable if ANY of the condition groups are fully met. Within a group, ALL conditions must be met.

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
  1.  Iterate through EACH condition group in the rule's 'conditionGroups' array.
  2.  For each group, evaluate if the order satisfies ALL conditions within that group. Use the provided hierarchy data when necessary (e.g., for 'customerHierarchy' or 'productHierarchy' conditions).
  3.  If you find a condition group where ALL of its conditions are met, the entire rule is considered applicable. You can stop checking other groups.
  4.  If no single condition group has all of its conditions satisfied, the rule is not applicable.
  5.  In the 'reasoning' field, provide a detailed, step-by-step explanation of your evaluation process. For EACH condition group you evaluated, list the conditions and state whether each passed or failed and why. This is the most important part of the output. Clearly state which group (if any) caused the rule to be applicable.
  6.  If the rule is applicable, set 'isApplicable' to true. Otherwise, set it to false.
  7.  If 'isApplicable' is true, describe the actions from the rule's 'actions' array that would be applied to the order in the 'appliedActions' array. For each action, describe what it does (e.g., "Applied a 10% discount on all Beverage products.").
  8.  If 'isApplicable' is false, the 'appliedActions' array should be empty.
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
