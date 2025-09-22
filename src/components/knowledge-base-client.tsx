"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, Book, Github, Globe, FileText, File } from "lucide-react";
import * as React from 'react';
import { FileUploadForm } from "./file-upload-form";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeBaseClientProps {
    files: string[];
}

const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.docx')) {
        return <File className="size-5 text-blue-500" />;
    }
    if (fileName.endsWith('.txt')) {
        return <FileText className="size-5 text-gray-500" />;
    }
    return <FileText className="size-5 text-gray-500" />;
};


export function KnowledgeBaseClient({ files: initialFiles }: KnowledgeBaseClientProps) {
  const [files, setFiles] = React.useState(initialFiles);
  const { toast } = useToast();

  const handleUploadSuccess = (newFileName: string) => {
    setFiles(prevFiles => [...prevFiles, newFileName].sort());
    toast({
        title: "Upload Successful",
        description: `File "${newFileName}" has been added to the knowledge base.`,
    })
  };

  const handleUploadError = (errorMessage: string) => {
    toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage,
    });
  }

  return (
    <div className="flex flex-col h-full">
        <header className="flex h-16 items-center border-b bg-background px-4">
            <Button variant="outline" size="icon" className="mr-4" asChild>
                <Link href="/">
                    <ArrowLeft className="size-4" />
                </Link>
            </Button>
            <h1 className="text-xl font-semibold">Knowledge Base</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>AI Context Sources</CardTitle>
                                <CardDescription>
                                    The AI uses the files listed below as its primary source of knowledge. Add .txt or .docx files to give the AI more context.
                                </CardDescription>
                            </div>
                            <FileUploadForm 
                                onUploadSuccess={handleUploadSuccess} 
                                onUploadError={handleUploadError} 
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64 rounded-md border">
                            <div className="p-4">
                                {files.length > 0 ? (
                                    <ul>
                                        {files.map(file => (
                                            <li key={file} className="flex items-center gap-3 py-2">
                                                {getFileIcon(file)}
                                                <span className="font-mono text-sm">{file}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-muted-foreground">No files found. Upload a file to get started.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>External Resources</CardTitle>
                        <CardDescription>
                            Remember to add content from these key resources to the knowledge base for a more comprehensive AI assistant.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                       <a href="https://www.tlomodel.org/index.html" target="_blank" rel="noopener noreferrer" className="group">
                           <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent">
                               <Globe className="size-6 text-primary" />
                               <div>
                                   <p className="font-semibold">TLOmodel Website</p>
                                   <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">Official project website.</p>
                               </div>
                           </div>
                       </a>
                       <a href="https://github.com/UCL/TLOmodel" target="_blank" rel="noopener noreferrer" className="group">
                           <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent">
                               <Github className="size-6" />
                               <div>
                                   <p className="font-semibold">GitHub Repository</p>
                                   <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">Project source code.</p>
                               </div>
                           </div>
                       </a>
                        <a href="https://www.tlomodel.org/docs/index.html" target="_blank" rel="noopener noreferrer" className="group">
                           <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent">
                               <Book className="size-6 text-green-600" />
                               <div>
                                   <p className="font-semibold">Official Documentation</p>
                                   <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">Detailed model documentation.</p>
                               </div>
                           </div>
                       </a>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">Download relevant documents and add them to the knowledge base folder.</p>
                    </CardFooter>
                </Card>
            </div>
        </main>
    </div>
  )
}
