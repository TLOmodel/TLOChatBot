// regenerate-ai-response.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for regenerating the last AI response.
 *
 * regenerateAiResponse - An async function that regenerates the last AI response.
 * RegenerateAiResponseInput - The input type for the regenerateAiResponse function.
 * RegenerateAiResponseOutput - The output type for the regenerateAiResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateAiResponseInputSchema = z.object({
  previousResponse: z.string().describe('The AI’s previous response.'),
  userPrompt: z.string().describe('The user’s original prompt.'),
});
export type RegenerateAiResponseInput = z.infer<typeof RegenerateAiResponseInputSchema>;

const RegenerateAiResponseOutputSchema = z.object({
  newResponse: z.string().describe('The regenerated AI response.'),
  shouldRegenerate: z.boolean().describe('Whether the AI should regenerate the response'),
});
export type RegenerateAiResponseOutput = z.infer<typeof RegenerateAiResponseOutputSchema>;

const shouldRegenerateResponseTool = ai.defineTool({
  name: 'shouldRegenerateResponse',
  description: 'Determines if a new AI response would be better than the previous one.',
  inputSchema: z.object({
    previousResponse: z.string().describe('The AI’s previous response.'),
    userPrompt: z.string().describe('The user’s original prompt.'),
  }),
  outputSchema: z.boolean().describe('True if the AI should regenerate the response, false otherwise.'),
}, async (input) => {
  // In a real application, this would involve a more sophisticated check,
  // potentially using another LLM or a set of heuristics to determine
  // if a regeneration is likely to produce a better result.
  // For this example, we'll just return true to always regenerate.
  console.log('Tool input:', input);
  return true;
});

const regenerateResponsePrompt = ai.definePrompt({
  name: 'regenerateResponsePrompt',
  input: {schema: RegenerateAiResponseInputSchema},
  output: {schema: RegenerateAiResponseOutputSchema},
  tools: [shouldRegenerateResponseTool],
  prompt: `You are an AI assistant that can regenerate previous responses to provide better answers.

The user has requested a new response to their original prompt:
"""
{{userPrompt}}
"""

Your previous response was:
"""
{{previousResponse}}
"""

First, use the shouldRegenerateResponse tool to determine if you should regenerate the response.

Then, if the tool indicates that you should regenerate the response, generate a new response that is more helpful and accurate.

Output your decision to regenerate, and if regenerating, the new response.`, // Ensure newlines are included in the prompt.
});

export async function regenerateAiResponse(input: RegenerateAiResponseInput): Promise<RegenerateAiResponseOutput> {
  return regenerateAiResponseFlow(input);
}

const regenerateAiResponseFlow = ai.defineFlow(
  {
    name: 'regenerateAiResponseFlow',
    inputSchema: RegenerateAiResponseInputSchema,
    outputSchema: RegenerateAiResponseOutputSchema,
  },
  async input => {
    const {
      output: {newResponse, shouldRegenerate},
    } = await regenerateResponsePrompt(input);
    return {newResponse: newResponse!, shouldRegenerate: shouldRegenerate!};
  }
);
