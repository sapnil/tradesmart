import type { Promotion, SalesData } from '@/types';

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

export const promotions: Promotion[] = [
  {
    id: 'PROMO-001',
    schemeName: 'Monsoon Bonanza',
    status: 'Active',
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    type: 'Discount',
    uplift: 15.2,
  },
  {
    id: 'PROMO-002',
    schemeName: 'Independence Day Special',
    status: 'Active',
    startDate: '2024-08-10',
    endDate: '2024-08-20',
    type: 'Bundle',
    uplift: 8.5,
  },
  {
    id: 'PROMO-003',
    schemeName: 'Diwali Dhamaka',
    status: 'Upcoming',
    startDate: '2024-10-15',
    endDate: '2024-11-15',
    type: 'Contest',
    uplift: 0,
  },
  {
    id: 'PROMO-004',
    schemeName: 'Summer Cooler Offer',
    status: 'Expired',
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    type: 'Freebie',
    uplift: 12.5,
  },
  {
    id: 'PROMO-005',
    schemeName: 'Holi Hungama',
    status: 'Expired',
    startDate: '2024-03-10',
    endDate: '2024-03-25',
    type: 'Discount',
    uplift: 22.1,
  },
];
