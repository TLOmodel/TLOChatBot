import { z } from 'zod';

export const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.array(z.object({ text: z.string() })),
    })
  ),
  message: z.string().describe('The user’s message.'),
  attachment: z.object({
    dataUri: z.string().describe("An attached file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
    contentType: z.string().describe('The MIME type of the attachment.')
  }).optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('The AI’s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export const RegenerateAiResponseInputSchema = z.object({
  previousResponse: z.string().describe('The AI’s previous response.'),
  userPrompt: z.string().describe('The user’s original prompt.'),
});
export type RegenerateAiResponseInput = z.infer<typeof RegenerateAiResponseInputSchema>;

export const RegenerateAiResponseOutputSchema = z.object({
  newResponse: z.string().describe('The regenerated AI response.'),
  shouldRegenerate: z.boolean().describe('Whether the AI should regenerate the response'),
});
export type RegenerateAiResponseOutput = z.infer<typeof RegenerateAiResponseOutputSchema>;
