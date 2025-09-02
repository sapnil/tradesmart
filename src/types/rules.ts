
import { z } from 'zod';

// ###################
// ## CONDITIONS
// ###################

export const ConditionTypeSchema = z.enum([
  'DATE_RANGE',
  'CUSTOMER_HIERARCHY',
  'PRODUCT_HIERARCHY',
  'PRODUCT_PURCHASE',
  'TOTAL_ORDER_VALUE',
  'TOTAL_ORDER_QUANTITY',
]);
export type ConditionType = z.infer<typeof ConditionTypeSchema>;

const DateRangeConditionSchema = z.object({
  type: z.literal('DATE_RANGE'),
  config: z.object({
    startDate: z.string().date(),
    endDate: z.string().date(),
  }),
});

const CustomerHierarchyConditionSchema = z.object({
  type: z.literal('CUSTOMER_HIERARCHY'),
  config: z.object({
    hierarchyIds: z.array(z.string()).min(1),
  }),
});

const ProductHierarchyConditionSchema = z.object({
  type: z.literal('PRODUCT_HIERARCHY'),
  config: z.object({
    productHierarchyIds: z.array(z.string()).min(1),
  }),
});

const ProductPurchaseConditionSchema = z.object({
  type: z.literal('PRODUCT_PURCHASE'),
  config: z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
  }),
});

const TotalOrderValueConditionSchema = z.object({
  type: z.literal('TOTAL_ORDER_VALUE'),
  config: z.object({
    productHierarchyIds: z.array(z.string()).optional(),
    minValue: z.number().min(1),
  }),
});

const TotalOrderQuantityConditionSchema = z.object({
    type: z.literal('TOTAL_ORDER_QUANTITY'),
    config: z.object({
        productHierarchyIds: z.array(z.string()).min(1),
        minQuantity: z.number().min(1),
    })
})

export const ConditionSchema = z.discriminatedUnion('type', [
  DateRangeConditionSchema,
  CustomerHierarchyConditionSchema,
  ProductHierarchyConditionSchema,
  ProductPurchaseConditionSchema,
  TotalOrderValueConditionSchema,
  TotalOrderQuantityConditionSchema,
]);
export type Condition = z.infer<typeof ConditionSchema>;

// ###################
// ## ACTIONS
// ###################

export const ActionTypeSchema = z.enum([
  'PERCENTAGE_DISCOUNT',
  'FIXED_VALUE_DISCOUNT',
  'FREE_PRODUCT',
  'BUNDLE_PRICE',
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

const PercentageDiscountActionSchema = z.object({
  type: z.literal('PERCENTAGE_DISCOUNT'),
  config: z.object({
    discountPercentage: z.number().min(1).max(100),
    applicableProductHierarchyIds: z.array(z.string()).optional(),
  }),
});

const FixedValueDiscountActionSchema = z.object({
  type: z.literal('FIXED_VALUE_DISCOUNT'),
  config: z.object({
    discountValue: z.number().min(1),
  }),
});

const FreeProductActionSchema = z.object({
  type: z.literal('FREE_PRODUCT'),
  config: z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
  }),
});

const BundlePriceActionSchema = z.object({
    type: z.literal('BUNDLE_PRICE'),
    config: z.object({
        bundlePrice: z.number().min(1),
    })
})


export const ActionSchema = z.discriminatedUnion('type', [
  PercentageDiscountActionSchema,
  FixedValueDiscountActionSchema,
  FreeProductActionSchema,
  BundlePriceActionSchema,
]);

export type Action = z.infer<typeof ActionSchema>;

// ###################
// ## RULE
// ###################

export const RuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  conditions: z.array(ConditionSchema),
  actions: z.array(ActionSchema),
});

export type Rule = z.infer<typeof RuleSchema>;


// ###################
// ## AI FLOW
// ###################

export const EvaluateDynamicRuleInputSchema = z.object({
  orderJson: z.string().describe('The order details as a JSON string.'),
  ruleJson: z.string().describe('The dynamic rule as a JSON string, containing conditions and actions.'),
  organizationHierarchyJson: z.string().describe('The organizational hierarchy as a JSON string.'),
  productHierarchyJson: z.string().describe('The product hierarchy as a JSON string.'),
});
export type EvaluateDynamicRuleInput = z.infer<typeof EvaluateDynamicRuleInputSchema>;


export const EvaluateDynamicRuleOutputSchema = z.object({
    applicable: z.boolean().describe('Whether the rule is applicable to the order.'),
    reasoning: z.string().describe('A step-by-step explanation of which conditions passed or failed.'),
    appliedActions: z.array(ActionSchema).optional().describe('A list of actions that should be applied if the rule is applicable.')
});
export type EvaluateDynamicRuleOutput = z.infer<typeof EvaluateDynamicRuleOutputSchema>;
