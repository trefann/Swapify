'use server';

/**
 * @fileOverview A flow to generate a summary of a swap request for the user to review.
 *
 * - generateSwapRequestSummary - A function that generates the swap request summary.
 * - SwapRequestSummaryInput - The input type for the generateSwapRequestSummary function.
 * - SwapRequestSummaryOutput - The return type for the generateSwapRequestSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SwapRequestSummaryInputSchema = z.object({
  offeredSkill: z.string().describe('The skill the user is offering to teach.'),
  requestedSkill: z.string().describe('The skill the user wants to learn.'),
  dateTime: z.string().describe('The date and time of the requested swap session.'),
  otherUser: z.string().describe('The username of the other user involved in the swap.'),
  userBio: z.string().describe('The bio of the user initiating the swap request.'),
  otherUserBio: z.string().describe('The bio of the other user.'),
});
export type SwapRequestSummaryInput = z.infer<typeof SwapRequestSummaryInputSchema>;

const SwapRequestSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the swap request details.'),
});
export type SwapRequestSummaryOutput = z.infer<typeof SwapRequestSummaryOutputSchema>;

export async function generateSwapRequestSummary(input: SwapRequestSummaryInput): Promise<SwapRequestSummaryOutput> {
  return swapRequestSummaryFlow(input);
}

const swapRequestSummaryPrompt = ai.definePrompt({
  name: 'swapRequestSummaryPrompt',
  input: {schema: SwapRequestSummaryInputSchema},
  output: {schema: SwapRequestSummaryOutputSchema},
  prompt: `You are an AI assistant that generates summaries for skill swap requests.

  Given the details below, create a short and clear summary of the skill swap request.

  Offered Skill: {{{offeredSkill}}}
  Requested Skill: {{{requestedSkill}}}
  Date and Time: {{{dateTime}}}
  Other User: {{{otherUser}}}
  User Bio: {{{userBio}}}
  Other User Bio: {{{otherUserBio}}}

  Summary:`,
});

const swapRequestSummaryFlow = ai.defineFlow(
  {
    name: 'swapRequestSummaryFlow',
    inputSchema: SwapRequestSummaryInputSchema,
    outputSchema: SwapRequestSummaryOutputSchema,
  },
  async input => {
    const {output} = await swapRequestSummaryPrompt(input);
    return output!;
  }
);
