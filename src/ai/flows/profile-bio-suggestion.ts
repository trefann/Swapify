'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a profile bio based on the user's selected skills.
 *
 * The flow takes a list of skills as input and returns a suggested profile bio.
 * - `suggestProfileBio` -  A function that takes a list of skills and returns a suggested profile bio.
 * - `ProfileBioSuggestionInput` - The input type for the suggestProfileBio function, which is a list of skills.
 * - `ProfileBioSuggestionOutput` - The output type for the suggestProfileBio function, which is a string containing the suggested profile bio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfileBioSuggestionInputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('A list of skills that the user possesses.'),
});
export type ProfileBioSuggestionInput = z.infer<
  typeof ProfileBioSuggestionInputSchema
>;

const ProfileBioSuggestionOutputSchema = z.object({
  bio: z.string().describe('A suggested profile bio for the user.'),
});
export type ProfileBioSuggestionOutput = z.infer<
  typeof ProfileBioSuggestionOutputSchema
>;

export async function suggestProfileBio(
  input: ProfileBioSuggestionInput
): Promise<ProfileBioSuggestionOutput> {
  return suggestProfileBioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'profileBioSuggestionPrompt',
  input: {schema: ProfileBioSuggestionInputSchema},
  output: {schema: ProfileBioSuggestionOutputSchema},
  prompt: `You are an AI assistant that helps users write their profile bios for a skill swapping app. The users will provide a list of their skills, and you will return a short, compelling profile bio.

Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const suggestProfileBioFlow = ai.defineFlow(
  {
    name: 'suggestProfileBioFlow',
    inputSchema: ProfileBioSuggestionInputSchema,
    outputSchema: ProfileBioSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
