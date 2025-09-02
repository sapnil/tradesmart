export type SalesData = {
  month: string;
  sales: number;
};

export type Promotion = {
  id: string;
  schemeName: string;
  status: 'Active' | 'Upcoming' | 'Expired';
  startDate: string;
  endDate: string;
  type: 'Discount' | 'Bundle' | 'Freebie' | 'Contest';
  uplift: number;
};
