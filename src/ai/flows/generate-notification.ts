'use server';

/**
 * @fileOverview An AI agent that generates notification messages for promotions.
 *
 * - generateNotification - A function that creates personalized notifications.
 * - GenerateNotificationInput - The input type for the function.
 * - GenerateNotificationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

export async function generateNotification(
  input: GenerateNotificationInput
): Promise<GenerateNotificationOutput> {
  return generateNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNotificationPrompt',
  input: { schema: GenerateNotificationInputSchema },
  output: { schema: GenerateNotificationOutputSchema },
  prompt: `You are an expert FMCG marketing communications manager in India. Your task is to generate personalized, clear, and compelling notification emails to distributors about a new promotion they are eligible for.

  Promotion Details:
  {{{promotionJson}}}

  Targeted Distributors:
  {{{distributorsJson}}}

  Instructions:
  1.  For EACH distributor in the list, create a unique notification object.
  2.  The 'subject' should be engaging and clearly state the promotion's name.
  3.  The 'body' of the email should be personalized with the distributor's name.
  4.  The body must clearly and concisely explain the promotion's main benefit (e.g., the discount, the freebie, the bundle offer).
  5.  The body must include the start and end dates of the promotion.
  6.  Keep the tone professional, encouraging, and easy to understand. Avoid jargon.
  7.  Generate a notification for every distributor in the input list.
  `,
});

const generateNotificationFlow = ai.defineFlow(
  {
    name: 'generateNotificationFlow',
    inputSchema: GenerateNotificationInputSchema,
    outputSchema: GenerateNotificationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
