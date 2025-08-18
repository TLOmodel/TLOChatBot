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

async function getKnowledgeBaseContent(): Promise<string> {
  const kbPath = path.join(process.cwd(), 'src', 'knowledge-base');
  try {
    const files = await fs.readdir(kbPath);
    const contents = await Promise.all(
      files.map(file => fs.readFile(path.join(kbPath, file), 'utf-8'))
    );
    return contents.join('\n\n---\n\n');
  } catch (error) {
    console.warn('Knowledge base directory not found or unreadable, skipping.');
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

    const prompt = `
You are TLO, a helpful AI assistant.
Your answers should be concise and helpful.
You can format your responses with Markdown.

${knowledgeBase ? 'Refer to the following knowledge base content if relevant to the user query:\n' + knowledgeBase : ''}

{{#if attachment}}
The user has provided an attachment. Use it to answer the prompt.
Attachment: {{media url=attachment.dataUri}}
{{/if}}

User prompt: ${message}
`;

    const { text } = await ai.generate({
      history: history,
      prompt: prompt,
      model: attachment ? 'googleai/gemini-2.0-flash' : 'googleai/gemini-2.0-flash',
    });
    return { response: text };
  }
);
