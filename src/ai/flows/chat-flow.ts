'use server';

/**
 * @fileOverview A simple chat flow that responds to user messages.
 *
 * - chat - A function that handles the chat interaction.
 */

import { ai } from '@/ai/genkit';
import { ChatInputSchema, ChatOutputSchema, type ChatInput } from '@/lib/ai-schemas';
import * as fs from 'fs/promises';
import * as path from 'path';
import mammoth from 'mammoth';

async function getKnowledgeBaseContent(): Promise<string> {
  const kbPath = path.join(process.cwd(), 'src', 'knowledge-base');
  try {
    const files = await fs.readdir(kbPath);
    const contents = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(kbPath, file);
        if (file.endsWith('.txt')) {
          return fs.readFile(filePath, 'utf-8');
        } else if (file.endsWith('.docx')) {
          const result = await mammoth.extractRawText({ path: filePath });
          return result.value;
        }
        return '';
      })
    );
    return contents.filter(Boolean).join('\n\n---\n\n');
  } catch (error) {
    console.warn('Knowledge base directory not found or unreadable, or contains unsupported file types.', error);
    return '';
  }
}

export async function chat(input: ChatInput) {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, message, attachment }) => {
    
    const knowledgeBase = await getKnowledgeBaseContent();

    const systemPrompt = `You are TLO, a helpful AI assistant and an expert on the TLOmodel (Thanzi la Onse model).
Your answers should be in-depth, helpful, and based on the provided context.
You can format your responses with Markdown.
You have been provided with a knowledge base containing information about the TLOmodel. Use this information to answer user questions.
If the user's question is not covered by the knowledge base, state that you do not have information on that topic based on the provided documents.

${knowledgeBase ? `START OF KNOWLEDGE BASE\n${knowledgeBase}\nEND OF KNOWLEDGE BASE` : ''}`;

    const { text } = await ai.generate({
      history: [
        { role: 'system', content: [{ text: systemPrompt }] },
        ...history,
      ],
      prompt: {
        text: message,
        media: attachment ? { url: attachment.dataUri } : undefined,
      },
      model: attachment ? 'googleai/gemini-2.0-flash' : 'googleai/gemini-2.0-flash',
    });
    
    return { response: text };
  }
);
