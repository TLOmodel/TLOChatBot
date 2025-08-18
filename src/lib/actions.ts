'use server';

import { regenerateAiResponse } from '@/ai/flows/regenerate-ai-response';
import { z } from 'zod';

const RegenerateSchema = z.object({
  previousResponse: z.string(),
  userPrompt: z.string(),
});

export async function handleRegenerate(values: {
  previousResponse: string;
  userPrompt: string;
}) {
  const validated = RegenerateSchema.safeParse(values);
  if (!validated.data) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await regenerateAiResponse(validated.data);
    if (result.shouldRegenerate && result.newResponse) {
      return { success: true, newResponse: result.newResponse };
    } else {
      return { success: false, message: 'Could not regenerate a better response.' };
    }
  } catch (error) {
    console.error('Error regenerating response:', error);
    return { error: 'An unexpected error occurred while regenerating the response.' };
  }
}
