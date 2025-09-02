

export type SalesData = {
  month: string;
  sales: number;
};

export const promotionTypes = [
  'Discount', // Simple discount %
  'Tiered Volume Discount', // Discount % based on quantity
  'Quantity-Based Freebie (Buy X, Get Y)',
  'Bundle',
  'Value-Based Discount', // Discount on minimum purchase value
  'Forced-Buy / Must-Stock', // Discount on one product conditional on buying another
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
