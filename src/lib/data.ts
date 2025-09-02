import type { Promotion, SalesData, Product, OrganizationHierarchy, ProductHierarchy, Order } from '@/types';

export const salesData: SalesData[] = [
  { month: "Jan '24", sales: 2890 },
  { month: "Feb '24", sales: 2756 },
  { month: "Mar '24", sales: 3322 },
  { month: "Apr '24", sales: 3470 },
  { month: "May '24", sales: 3123 },
  { month: "Jun '24", sales: 3890 },
  { month: "Jul '24", sales: 3590 },
  { month: "Aug '24", sales: 4102 },
];

export const products: Product[] = [
    { id: 'PROD-001', name: 'Cool Cola 300ml', sku: 'CC300' },
    { id: 'PROD-002', name: 'Cool Cola 500ml', sku: 'CC500' },
    { id: 'PROD-003', name: 'Zesty Orange 300ml', sku: 'ZO300' },
    { id: 'PROD-004', name: 'Zesty Orange 500ml', sku: 'ZO500' },
    { id: 'PROD-005', name: 'Lemon-Lime Burst 300ml', sku: 'LLB300' },
];

export const productHierarchy: ProductHierarchy[] = [
  { id: 'CAT-1', name: 'Beverages', level: 'Category' },
  { id: 'BRAND-1', name: 'Cool Cola', level: 'Brand', parentId: 'CAT-1' },
  { id: 'SKU-1', name: 'Cool Cola 300ml', level: 'SKU', parentId: 'BRAND-1' },
  { id: 'SKU-2', name: 'Cool Cola 500ml', level: 'SKU', parentId: 'BRAND-1' },
  { id: 'BRAND-2', name: 'Zesty Orange', level: 'Brand', parentId: 'CAT-1' },
  { id: 'SKU-3', name: 'Zesty Orange 300ml', level: 'SKU', parentId: 'BRAND-2' },
  { id: 'SKU-4', name: 'Zesty Orange 500ml', level: 'SKU', parentId: 'BRAND-2' },
  { id: 'CAT-2', name: 'Snacks', level: 'Category' },
];

export const organizationHierarchy: OrganizationHierarchy[] = [
    { id: 'HIER-R1', name: 'North', level: 'Region' },
    { id: 'HIER-S1', name: 'Delhi NCR', level: 'State', parentId: 'HIER-R1' },
    { id: 'HIER-A1', name: 'North Delhi', level: 'Area', parentId: 'HIER-S1' },
    { id: 'HIER-D1', name: 'Gupta Distributors', level: 'Distributor', parentId: 'HIER-A1' },
    { id: 'HIER-RET1', name: 'Sharma Kirana Store', level: 'Retailer', parentId: 'HIER-D1' },
    { id: 'HIER-S2', name: 'Punjab', level: 'State', parentId: 'HIER-R1' },
    { id: 'HIER-R2', name: 'West', level: 'Region' },
    { id: 'HIER-S3', name: 'Maharashtra', level: 'State', parentId: 'HIER-R2' },
];

export const promotions: Promotion[] = [
  {
    id: 'PROMO-001',
    schemeName: 'Monsoon Bonanza',
    status: 'Active',
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    type: 'Discount',
    uplift: 15.2,
    products: [
        { productId: 'PROD-001', buyQuantity: 6, getQuantity: 1, getSKU: 'PROD-001' }
    ],
    hierarchyIds: ['HIER-R1'],
    productHierarchyIds: ['CAT-1'],
  },
  {
    id: 'PROMO-002',
    schemeName: 'Independence Day Special',
    status: 'Active',
    startDate: '2024-08-10',
    endDate: '2024-08-20',
    type: 'Bundle',
    uplift: 8.5,
    products: [],
    hierarchyIds: ['HIER-S1'],
    productHierarchyIds: ['BRAND-1'],
  },
  {
    id: 'PROMO-003',
    schemeName: 'Diwali Dhamaka',
    status: 'Upcoming',
    startDate: '2024-10-15',
    endDate: '2024-11-15',
    type: 'Contest',
    uplift: 0,
    products: [],
    hierarchyIds: ['HIER-R1', 'HIER-R2'],
    productHierarchyIds: ['CAT-1', 'CAT-2'],
  },
  {
    id: 'PROMO-004',
    schemeName: 'Summer Cooler Offer',
    status: 'Expired',
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    type: 'Freebie',
    uplift: 12.5,
    products: [],
    hierarchyIds: ['HIER-S3'],
    productHierarchyIds: ['BRAND-2'],
  },
  {
    id: 'PROMO-005',
    schemeName: 'Holi Hungama',
    status: 'Expired',
    startDate: '2024-03-10',
    endDate: '2024-03-25',
    type: 'Discount',
    uplift: 22.1,
    products: [],
    hierarchyIds: ['HIER-S1', 'HIER-S2'],
    productHierarchyIds: ['BRAND-1'],
  },
];

export const orders: Order[] = [
    { id: 'ORD-001', distributorName: 'Gupta Distributors', date: '2024-08-12', amount: 45000, status: 'Fulfilled', appliedPromotionId: 'PROMO-001' },
    { id: 'ORD-002', distributorName: 'Patel Trading Co.', date: '2024-08-12', amount: 78000, status: 'Pending', appliedPromotionId: 'PROMO-002' },
    { id: 'ORD-003', distributorName: 'Sharma & Sons', date: '2024-08-11', amount: 23500, status: 'Fulfilled' },
    { id: 'ORD-004', distributorName: 'Modern Traders', date: '2024-08-10', amount: 112000, status: 'Fulfilled', appliedPromotionId: 'PROMO-001' },
    { id: 'ORD-005', distributorName: 'Gupta Distributors', date: '2024-08-09', amount: 32000, status: 'Cancelled' },
    { id: 'ORD-006', distributorName: 'Southern Wholesalers', date: '2024-08-08', amount: 56000, status: 'Fulfilled' },
];
