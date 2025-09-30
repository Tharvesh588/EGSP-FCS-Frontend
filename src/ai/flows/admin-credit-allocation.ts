'use server';

/**
 * @fileOverview This file defines a Genkit flow for super-admins to get AI-recommended credit values for faculty submissions.
 *
 * - getCreditRecommendation - A function that takes faculty submission data and returns a credit recommendation.
 * - CreditRecommendationInput - The input type for the getCreditRecommendation function.
 * - CreditRecommendationOutput - The return type for the getCreditRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreditRecommendationInputSchema = z.object({
  submissionText: z
    .string()
    .describe('The text of the faculty member\'s submission describing their good work.'),
  supportingDocumentDescription: z
    .string()
    .optional()
    .describe('A description of the supporting documentation provided by the faculty member.'),
  previousCreditAllocations: z
    .string()
    .optional()
    .describe('Examples of previous credit allocations for similar submissions, including the submission description, supporting document description, and credit value.'),
});
export type CreditRecommendationInput = z.infer<typeof CreditRecommendationInputSchema>;

const CreditRecommendationOutputSchema = z.object({
  recommendedCredit: z
    .number()
    .describe('The AI-recommended credit value for the faculty submission.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the recommended credit value.'),
});
export type CreditRecommendationOutput = z.infer<typeof CreditRecommendationOutputSchema>;

export async function getCreditRecommendation(
  input: CreditRecommendationInput
): Promise<CreditRecommendationOutput> {
  return adminCreditAllocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminCreditAllocationPrompt',
  input: {schema: CreditRecommendationInputSchema},
  output: {schema: CreditRecommendationOutputSchema},
  prompt: `You are an AI assistant that helps super-admins at EGS Pillay Engineering College determine appropriate credit values for faculty submissions.

  The faculty member has submitted the following description of their good work:
  {{submissionText}}

  They have also provided the following description of supporting documentation:
  {{supportingDocumentDescription}}

  Here are some examples of previous credit allocations for similar submissions:
  {{previousCreditAllocations}}

  Based on this information, recommend an appropriate credit value and explain your reasoning.
  Your recommendation should take into account the effort, impact, and importance of the submission.

  Respond with a JSON object that contains the following fields:
  - recommendedCredit: The AI-recommended credit value for the faculty submission.
  - reasoning: The AI reasoning behind the recommended credit value.

  Ensure the recommendedCredit is a number and the reasoning is a string.
  `,
});

const adminCreditAllocationFlow = ai.defineFlow(
  {
    name: 'adminCreditAllocationFlow',
    inputSchema: CreditRecommendationInputSchema,
    outputSchema: CreditRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
