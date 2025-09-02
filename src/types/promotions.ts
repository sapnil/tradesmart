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


export const PredictPromotionUpliftInputSchema = z.object({
  promotionJson: z
    .string()
    .describe(
      'The promotion being created, as a JSON string. This includes its type, duration, products, and hierarchy targets.'
    ),
  salesDataJson: z
    .string()
    .describe('Historical sales data as a JSON string.'),
  pastPromotionsJson: z
    .string()
    .describe(
      'Performance data from past promotions as a JSON string, including their uplift.'
    ),
});
export type PredictPromotionUpliftInput = z.infer<
  typeof PredictPromotionUpliftInputSchema
>;

export const PredictPromotionUpliftOutputSchema = z.object({
  predictedUplift: z
    .number()
    .describe('The predicted sales uplift percentage for the promotion.'),
  reasoning: z
    .string()
    .describe(
      'A detailed explanation of the factors that contributed to the predicted uplift, such as seasonality, promotion type, and comparison with past promotions.'
    ),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A confidence score (0-100) for the prediction.'),
});
export type PredictPromotionUpliftOutput = z.infer<
  typeof PredictPromotionUpliftOutputSchema
>;

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
