'use server';

import { chat } from '@/ai/flows/chat-flow';
import { regenerateAiResponse } from '@/ai/flows/regenerate-ai-response';
import { z } from 'zod';
import { ChatInputSchema, RegenerateAiResponseInputSchema, type ChatInput, type RegenerateAiResponseInput } from './ai-schemas';

export async function handleRegenerate(values: RegenerateAiResponseInput) {
  const validated = RegenerateAiResponseInputSchema.safeParse(values);
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
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { error: errorMessage, success: false };
  }
}


export async function handleChat(values: ChatInput) {
    const validated = ChatInputSchema.safeParse(values);
    if (!validated.data) {
      return { error: 'Invalid input.', success: false };
    }
  
    try {
      const result = await chat(validated.data);
      return { success: true, response: result.response };
    } catch (error) {
      console.error('Error handling chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      return { error: errorMessage, success: false };
    }
  }
