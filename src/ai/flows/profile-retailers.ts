'use server';

/**
 * @fileOverview An AI agent that profiles retailers to identify high-potential and low-response outlets.
 *
 * - profileRetailers - A function that analyzes retailer performance.
 * - ProfileRetailersInput - The input type for the function.
 * - ProfileRetailersOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProfileRetailersInputSchema = z.object({
  ordersJson: z.string().describe('A JSON string of all orders.'),
  promotionsJson: z
    .string()
    .describe('A JSON string of all active and past promotions.'),
  organizationHierarchyJson: z
    .string()
    .describe('The organizational hierarchy as a JSON string.'),
});
export type ProfileRetailersInput = z.infer<
  typeof ProfileRetailersInputSchema
>;

const RetailerProfileSchema = z.object({
  retailerId: z.string().describe('The ID of the retailer.'),
  retailerName: z.string().describe('The name of the retailer.'),
  distributorName: z.string().describe('The name of the parent distributor.'),
  totalOrderValue: z.number().describe('The total value of all orders associated with this retailer.'),
  promotionParticipationCount: z.number().describe('The number of distinct promotions the retailer has participated in.'),
  reasoning: z
    .string()
    .describe('A detailed explanation for why the retailer is categorized as high-potential or low-response.'),
});

const ProfileRetailersOutputSchema = z.object({
  highPotentialRetailers: z.array(RetailerProfileSchema).describe('A list of retailers identified as having high potential.'),
  lowResponseRetailers: z.array(RetailerProfileSchema).describe('A list of retailers identified as having a low response or engagement.'),
});
export type ProfileRetailersOutput = z.infer<
  typeof ProfileRetailersOutputSchema
>;

export async function profileRetailers(
  input: ProfileRetailersInput
): Promise<ProfileRetailersOutput> {
  return profileRetailersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'profileRetailersPrompt',
  input: { schema: ProfileRetailersInputSchema },
  output: { schema: ProfileRetailersOutputSchema },
  prompt: `You are an expert FMCG sales analyst. Your task is to profile retailers based on their order history, promotion participation, and hierarchy.

  Data:
  - Orders: {{{ordersJson}}}
  - Promotions: {{{promotionsJson}}}
  - Organization Hierarchy: {{{organizationHierarchyJson}}}

  Instructions:
  1. First, map all retailers to their parent distributors using the organization hierarchy.
  2. For each retailer, calculate their total order value and the number of distinct promotions they have participated in by analyzing the orders placed by their parent distributor.
  3. Identify 'High Potential Retailers'. These are outlets that:
     - Consistently participate in promotions.
     - Have a high total order value compared to peers in the same area/distributor.
     - Show a growth trend in order value or participation.
     - May not have high volume yet but are in strategic locations or are new and growing fast.
  4. Identify 'Low Response Retailers'. These are outlets that:
     - Rarely or never participate in promotions.
     - Have low or declining order values.
     - Place small, infrequent orders.
  5. For each retailer you categorize, provide a clear 'reasoning' based on the data. For example, "High potential due to 30% YoY growth in order value and participation in 5 of the last 6 promotions." or "Low response, as they have not participated in any promotion in the last 6 months."
  6. Compile the final lists for 'highPotentialRetailers' and 'lowResponseRetailers'.
  `,
});

const profileRetailersFlow = ai.defineFlow(
  {
    name: 'profileRetailersFlow',
    inputSchema: ProfileRetailersInputSchema,
    outputSchema: ProfileRetailersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
