'use server';

/**
 * @fileOverview This file defines a Genkit flow for checking potential time conflicts when scheduling skill swaps.
 *
 * The flow uses the ai.defineTool to define a tool to check if a given schedule conflicts with any existing schedules.
 * - `checkScheduleConflict`: Checks if a proposed schedule conflicts with existing schedules.
 * - `ScheduleConflictInput`: Input type for the `checkScheduleConflict` function.
 * - `ScheduleConflictOutput`: Output type for the `checkScheduleConflict` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleConflictInputSchema = z.object({
  proposedStartTime: z.string().describe('The proposed start time for the new event (ISO format).'),
  proposedEndTime: z.string().describe('The proposed end time for the new event (ISO format).'),
  existingSchedules: z
    .array(
      z.object({
        startTime: z.string().describe('Start time of the existing event (ISO format).'),
        endTime: z.string().describe('End time of the existing event (ISO format).'),
      })
    )
    .describe('Array of existing schedules with start and end times.'),
});

export type ScheduleConflictInput = z.infer<typeof ScheduleConflictInputSchema>;

const ScheduleConflictOutputSchema = z.object({
  hasConflict: z
    .boolean()
    .describe('Indicates whether the proposed schedule conflicts with any existing schedules.'),
  conflictDetails: z
    .string()
    .optional()
    .describe('Details about the conflict, if any.'),
});

export type ScheduleConflictOutput = z.infer<typeof ScheduleConflictOutputSchema>;

const checkScheduleConflictTool = ai.defineTool(
  {
    name: 'checkScheduleConflict',
    description: 'Checks if a given schedule conflicts with any existing schedules.',
    inputSchema: ScheduleConflictInputSchema,
    outputSchema: ScheduleConflictOutputSchema,
  },
  async input => {
    const {proposedStartTime, proposedEndTime, existingSchedules} = input;

    for (const existingSchedule of existingSchedules) {
      // Convert time strings to Date objects for comparison
      const proposedStart = new Date(proposedStartTime);
      const proposedEnd = new Date(proposedEndTime);
      const existingStart = new Date(existingSchedule.startTime);
      const existingEnd = new Date(existingSchedule.endTime);

      if (proposedStart < existingEnd && proposedEnd > existingStart) {
        return {
          hasConflict: true,
          conflictDetails: `The proposed schedule conflicts with an existing schedule from ${existingSchedule.startTime} to ${existingSchedule.endTime}.`,
        };
      }
    }

    return {hasConflict: false};
  }
);

const ScheduleConflictFlowInputSchema = z.object({
  proposedStartTime: z.string().describe('The proposed start time for the new event (ISO format).'),
  proposedEndTime: z.string().describe('The proposed end time for the new event (ISO format).'),
  existingSchedules: z
    .array(
      z.object({
        startTime: z.string().describe('Start time of the existing event (ISO format).'),
        endTime: z.string().describe('End time of the existing event (ISO format).'),
      })
    )
    .describe('Array of existing schedules with start and end times.'),
});

const ScheduleConflictFlowOutputSchema = z.object({
  hasConflict: z
    .boolean()
    .describe('Indicates whether the proposed schedule conflicts with any existing schedules.'),
  conflictDetails: z
    .string()
    .optional()
    .describe('Details about the conflict, if any.'),
});

/**
 * Checks if a proposed schedule conflicts with existing schedules.
 * @param input - The input containing the proposed schedule and existing schedules.
 * @returns A promise resolving to a ScheduleConflictOutput indicating whether there is a conflict.
 */
export async function checkScheduleConflict(
  input: ScheduleConflictInput
): Promise<ScheduleConflictOutput> {
  return scheduleConflictFlow(input);
}

const scheduleConflictFlow = ai.defineFlow(
  {
    name: 'scheduleConflictFlow',
    inputSchema: ScheduleConflictFlowInputSchema,
    outputSchema: ScheduleConflictFlowOutputSchema,
  },
  async input => {
    return checkScheduleConflictTool(input);
  }
);
