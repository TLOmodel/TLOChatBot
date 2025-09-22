import { KnowledgeBaseClient } from "@/components/knowledge-base-client";
import { readdir } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
  const kbPath = path.join(process.cwd(), 'src', 'knowledge-base');
  let files: string[] = [];
  try {
    files = await readdir(kbPath);
  } catch (error) {
    console.error("Could not read knowledge base directory", error);
  }

  return (
    <div className="h-screen w-full">
        <KnowledgeBaseClient files={files} />
    </div>
  );
}
