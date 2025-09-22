'use server';

import { chat } from '@/ai/flows/chat-flow';
import { regenerateAiResponse } from '@/ai/flows/regenerate-ai-response';
import { z } from 'zod';
import { ChatInputSchema, RegenerateAiResponseInputSchema, type ChatInput, type RegenerateAiResponseInput } from './ai-schemas';
import * as fs from 'fs/promises';
import * as path from 'path';
import { revalidatePath } from 'next/cache';

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

export async function uploadFileToKnowledgeBase(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  // Basic validation for file type
  if (!file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
    return { success: false, error: 'Invalid file type. Only .txt and .docx are allowed.' };
  }

  try {
    const kbPath = path.join(process.cwd(), 'src', 'knowledge-base');
    const filePath = path.join(kbPath, file.name);

    await fs.mkdir(kbPath, { recursive: true });
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    revalidatePath('/knowledge-base');
    return { success: true, fileName: file.name };
  } catch (error) {
    console.error('Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
