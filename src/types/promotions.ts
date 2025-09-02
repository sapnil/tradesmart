import { z } from 'zod';

export const ApplyPromotionRulesInputSchema = z.object({
  orderJson: z
    .string()
    .describe(
      'The order details as a JSON string. It includes distributor info, items, and quantities.'
    ),
  promotionsJson: z
    .string()
    .describe(
      'A list of active promotion schemes as a JSON string. Each promotion has its own set of rules and conditions like target products, hierarchies, and validity dates.'
    ),
  organizationHierarchyJson: z
    .string()
    .describe('The organizational hierarchy as a JSON string.'),
  productHierarchyJson: z
    .string()
    .describe('The product hierarchy as a JSON string.'),
});
export type ApplyPromotionRulesInput = z.infer<
  typeof ApplyPromotionRulesInputSchema
>;

export const ApplyPromotionRulesOutputSchema = z.object({
  bestPromotionId: z
    .string()
    .optional()
    .describe('The ID of the best-suited promotion. Null if no promotion applies.'),
  reasoning: z
    .string()
    .describe(
      'A step-by-step explanation of why a promotion was chosen or why no promotion was applied. Mention which rules passed and which failed for the chosen promotion or other potential promotions.'
    ),
});
export type ApplyPromotionRulesOutput = z.infer<
  typeof ApplyPromotionRulesOutputSchema
>;
