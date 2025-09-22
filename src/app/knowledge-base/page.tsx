import { KnowledgeBaseClient } from "@/components/knowledge-base-client";
import { readdir } from "fs/promises";
import path from "path";
import * as fs from 'fs';

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
  const kbPath = path.join(process.cwd(), 'src', 'knowledge-base');
  let files: string[] = [];
  try {
    // Check if directory exists synchronously to avoid issues with async in Server Components
    if (fs.existsSync(kbPath)) {
        const allFiles = await readdir(kbPath);
        // Filter for only .txt and .docx files and ensure no empty filenames
        files = allFiles.filter(file => (file.endsWith('.txt') || file.endsWith('.docx')) && file.trim() !== '');
    } else {
        console.warn("Knowledge base directory not found. It will be created on first upload.");
    }
  } catch (error) {
    // Log other errors to the console for debugging.
    console.error("Could not read knowledge base directory:", error);
  }

  return (
    <div className="h-screen w-full">
        <KnowledgeBaseClient files={files} />
    </div>
  );
}
