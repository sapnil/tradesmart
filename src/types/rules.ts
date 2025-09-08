
import { z } from 'zod';

// #region -------- Condition Types --------

export const ConditionTypeSchema = z.enum([
  'dateRange',
  'customerHierarchy',
  'productHierarchy',
  'productPurchase',
  'totalOrderValue',
  'totalOrderQuantity',
]);
export type ConditionType = z.infer<typeof ConditionTypeSchema>;

export const conditionTypes: ConditionType[] = [
  'dateRange',
  'customerHierarchy',
  'productHierarchy',
  'productPurchase',
  'totalOrderValue',
  'totalOrderQuantity',
];

export const conditionLabels: Record<ConditionType, string> = {
    dateRange: 'Date Range',
    customerHierarchy: 'Customer Hierarchy',
    productHierarchy: 'Product Hierarchy',
    productPurchase: 'Product Purchase',
    totalOrderValue: 'Total Order Value',
    totalOrderQuantity: 'Total Order Quantity',
};


export const DateRangeConditionSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const CustomerHierarchyConditionSchema = z.object({
  hierarchyIds: z.array(z.string()).min(1),
});

export const ProductHierarchyConditionSchema = z.object({
  hierarchyIds: z.array(z.string()).min(1),
});

export const ProductPurchaseConditionSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

export const TotalOrderValueConditionSchema = z.object({
    productHierarchyIds: z.array(z.string()).min(1),
    value: z.number().min(0),
});

export const TotalOrderQuantityConditionSchema = z.object({
    productHierarchyIds: z.array(z.string()).min(1),
    quantity: z.number().min(1),
});

export const ConditionSchema = z.object({
  id: z.string(),
  type: ConditionTypeSchema,
  config: z.any(),
});
export type Condition = z.infer<typeof ConditionSchema>;

export const ConditionGroupSchema = z.object({
    id: z.string(),
    conditions: z.array(ConditionSchema),
});
export type ConditionGroup = z.infer<typeof ConditionGroupSchema>;

// #endregion

// #region -------- Action Types --------

export const ActionTypeSchema = z.enum([
    'applyPercentageDiscount',
    'applyFixedValueDiscount',
    'addFreeProduct',
    'setBundlePrice',
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const actionTypes: ActionType[] = [
    'applyPercentageDiscount',
    'applyFixedValueDiscount',
    'addFreeProduct',
    'setBundlePrice',
];

export const actionLabels: Record<ActionType, string> = {
    applyPercentageDiscount: 'Apply Percentage Discount',
    applyFixedValueDiscount: 'Apply Fixed Value Discount',
    addFreeProduct: 'Add Free Product',
    setBundlePrice: 'Set Bundle Price',
};

export const ApplyPercentageDiscountActionSchema = z.object({
  productHierarchyIds: z.array(z.string()).min(1),
  discount: z.number().min(1).max(100),
});

export const ApplyFixedValueDiscountActionSchema = z.object({
  discount: z.number().min(0),
});

export const AddFreeProductActionSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
});

export const SetBundlePriceActionSchema = z.object({
    productIds: z.array(z.string()).min(1),
    price: z.number().min(0),
});


export const ActionSchema = z.object({
    id: z.string(),
    type: ActionTypeSchema,
    config: z.any(),
});
export type Action = z.infer<typeof ActionSchema>;

// #endregion

// #region -------- Rule --------

export const RuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  conditionGroups: z.array(ConditionGroupSchema),
  actions: z.array(ActionSchema),
});
export type Rule = z.infer<typeof RuleSchema>;

// #endregion

// #region -------- AI Flow Types --------

export const ExecuteDynamicRuleInputSchema = z.object({
  orderJson: z.string(),
  ruleJson: z.string(),
  organizationHierarchyJson: z.string(),
  productHierarchyJson: z.string(),
});
export type ExecuteDynamicRuleInput = z.infer<typeof ExecuteDynamicRuleInputSchema>;

export const ExecuteDynamicRuleOutputSchema = z.object({
  isApplicable: z.boolean(),
  reasoning: z.string(),
  appliedActions: z.array(z.object({
    actionType: z.string(),
    description: z.string(),
  })),
});
export type ExecuteDynamicRuleOutput = z.infer<typeof ExecuteDynamicRuleOutputSchema>;

// #endregion
