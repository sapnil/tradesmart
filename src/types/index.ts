

import { z } from 'zod';

export type SalesData = {
  month: string;
  sales: number;
};

export const promotionTypes = [
  'Discount',
  'Tiered Volume Discount',
  'Quantity-Based Freebie (Buy X, Get Y)',
  'Bundle',
  'Value-Based Discount',
  'Forced-Buy / Must-Stock',
  'QPS (Long-Term Incentive)',
  'Rebate and Loyalty Programs',
  'Free Goods and Sampling Schemes',
  'Channel-Specific Schemes',
  'Retailer Channel-Group Specific Schemes',
  'Strategic Implementation Approaches',
  'Seasonal and Geographic Promotions',
  'Liquidation Schemes',
  'Cross-Sell and Bundling Programs',
  'Performance-Driven Incentives',
  'Trade Contests and Incentives',
  'Display and Visibility Support',
  'Freebie',
  'Contest',
] as const;

export type PromotionType = (typeof promotionTypes)[number];

export type Product = {
    id: string;
    name: string;
    sku: string;
};

export type ProductHierarchy = {
  id: string;
  name: string;
  level: 'Category' | 'Brand' | 'SKU';
  parentId?: string;
};

export type PromotionProduct = {
    productId: string;
    buyQuantity: number;
    getQuantity: number;
    getProductId: string;
}

export type BundleProduct = {
    productId: string;
    quantity: number;
}

export type MustBuyProduct = {
    productId: string;
    quantity: number;
}


export type DiscountTier = {
    minQuantity: number;
    maxQuantity: number;
    discountPercentage: number;
}

export type OrganizationHierarchy = {
  id: string;
  name: string;
  level: 'Region' | 'State' | 'Area' | 'Distributor' | 'Retailer';
  parentId?: string;
}

export type OrganizationGroup = {
  id: string;
  name: string;
  memberIds: string[];
};

export type Promotion = {
  id: string;
  schemeName: string;
  status: 'Active' | 'Upcoming' | 'Expired';
  startDate: string;
  endDate: string;
  type: PromotionType;
  uplift: number;
  products: PromotionProduct[];
  hierarchyIds: string[];
  organizationGroupIds?: string[];
  productHierarchyIds: string[];
  discountTiers?: DiscountTier[];
  bundleProducts?: BundleProduct[];
  bundlePrice?: number;
  minValue?: number;
  discountValue?: number;
  mustBuyProducts?: MustBuyProduct[];
  discountPercentage?: number;
  qpsTargetQuantity?: number;
  qpsDurationMonths?: number;
  qpsReward?: string;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  distributorName: string;
  date: string;
  amount: number;
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
  appliedPromotionId?: string;
  items: OrderItem[];
};

export type SentNotification = {
    id: string;
    distributorName: string;
    promotionName: string;
    subject: string;
    body: string;
    sentDate: string;
};

// Types for GenerateNotification Flow
export const DistributorInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
export type DistributorInfo = z.infer<typeof DistributorInfoSchema>;

export const GenerateNotificationInputSchema = z.object({
  promotionJson: z
    .string()
    .describe('The full details of the promotion as a JSON string.'),
  distributorsJson: z
    .string()
    .describe(
      'A list of targeted distributors as a JSON string. Each distributor has an id, name, and email.'
    ),
});
export type GenerateNotificationInput = z.infer<
  typeof GenerateNotificationInputSchema
>;

const NotificationSchema = z.object({
  distributorId: z.string(),
  subject: z.string().describe('A catchy and relevant email subject line.'),
  body: z.string().describe('A personalized and concise email body.'),
});

export const GenerateNotificationOutputSchema = z.object({
  notifications: z
    .array(NotificationSchema)
    .describe('A list of personalized notifications for each distributor.'),
});
export type GenerateNotificationOutput = z.infer<
  typeof GenerateNotificationOutputSchema
>;
