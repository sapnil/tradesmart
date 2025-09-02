
import { type Rule } from '@/types/rules';

export const dynamicRules: Rule[] = [
    {
        id: 'RULE-001',
        name: 'North Region Cola Discount',
        description: 'A 10% discount on all Cool Cola products for distributors in the North region during August.',
        conditions: [
            {
                type: 'DATE_RANGE',
                config: {
                    startDate: '2024-08-01',
                    endDate: '2024-08-31',
                }
            },
            {
                type: 'CUSTOMER_HIERARCHY',
                config: {
                    hierarchyIds: ['HIER-R1']
                }
            },
            {
                type: 'PRODUCT_HIERARCHY',
                config: {
                    productHierarchyIds: ['BRAND-1']
                }
            }
        ],
        actions: [
            {
                type: 'PERCENTAGE_DISCOUNT',
                config: {
                    discountPercentage: 10,
                    applicableProductHierarchyIds: ['BRAND-1']
                }
            }
        ]
    },
    {
        id: 'RULE-002',
        name: 'Forced-Buy for Zesty Orange',
        description: 'Get a 5% discount on Zesty Orange 500ml if you also buy at least 10 units of Lemon-Lime Burst.',
        conditions: [
             {
                type: 'PRODUCT_PURCHASE',
                config: {
                    productId: 'PROD-005',
                    quantity: 10,
                }
            },
            {
                type: 'PRODUCT_HIERARCHY',
                config: {
                    productHierarchyIds: ['SKU-4']
                }
            }
        ],
        actions: [
            {
                type: 'PERCENTAGE_DISCOUNT',
                config: {
                    discountPercentage: 5,
                    applicableProductHierarchyIds: ['SKU-4']
                }
            }
        ]
    }
];
