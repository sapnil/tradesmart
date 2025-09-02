
export type SalesData = {
  month: string;
  sales: number;
};

export const promotionTypes = [
  'Quantity Price Schemes (QPS)',
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
  'Discount',
  'Bundle',
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
    getSKU: string;
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
};
