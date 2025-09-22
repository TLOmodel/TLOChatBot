import { KnowledgeBaseClient } from "@/components/knowledge-base-client";
import { readdir } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
  const kbPath = path.join(process.cwd(), 'src', 'knowledge-base');
  let files: string[] = [];
  try {
    const allFiles = await readdir(kbPath);
    // Filter for only .txt and .docx files
    files = allFiles.filter(file => file.endsWith('.txt') || file.endsWith('.docx'));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // If the directory doesn't exist, we can just proceed with an empty list.
        console.warn("Knowledge base directory not found. It will be created on first upload.");
    } else {
        // Log other errors to the console for debugging.
        console.error("Could not read knowledge base directory:", error);
    }
  }

  return (
    <div className="h-screen w-full">
        <KnowledgeBaseClient files={files} />
    </div>
  );
}
