
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { db, storage } from '../src/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs/promises';
import path from 'path';

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'src', 'knowledge-base');
const FIRESTORE_COLLECTION = 'knowledgeBaseFiles';
const STORAGE_FOLDER = 'knowledge-base';

async function main() {
  console.log('Starting knowledge base seeding...');

  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("Error: Firebase environment variables are not set.");
    console.error("Please ensure your .env file is populated with the correct Firebase config.");
    return;
  }

  try {
    // Get existing files from Firestore to avoid duplicates
    const filesCollection = collection(db, FIRESTORE_COLLECTION);
    const q = query(filesCollection);
    const querySnapshot = await getDocs(q);
    const existingFiles = new Set(querySnapshot.docs.map(doc => doc.data().name));
    console.log(`Found ${existingFiles.size} existing files in Firestore.`);

    // Read local files
    const localFiles = await fs.readdir(KNOWLEDGE_BASE_DIR);
    const filesToUpload = localFiles.filter(
      file => (file.endsWith('.txt') || file.endsWith('.docx')) && !existingFiles.has(file)
    );

    if (filesToUpload.length === 0) {
      console.log('No new files to upload. Knowledge base is up to date.');
      return;
    }

    console.log(`Found ${filesToUpload.length} new files to upload.`);

    for (const fileName of filesToUpload) {
      const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
      console.log(`Processing: ${fileName}`);

      try {
        // 1. Read file content
        const fileBuffer = await fs.readFile(filePath);

        // 2. Upload to Firebase Storage
        const storageRef = ref(storage, `${STORAGE_FOLDER}/${Date.now()}-${fileName}`);
        const uploadTask = await uploadBytes(storageRef, fileBuffer);
        const url = await getDownloadURL(uploadTask.ref);
        console.log(`- Uploaded to Storage: ${url}`);

        // 3. Save metadata to Firestore
        await addDoc(collection(db, FIRESTORE_COLLECTION), {
          name: fileName,
          url: url,
          createdAt: serverTimestamp(),
          size: fileBuffer.byteLength,
          type: fileName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain',
        });
        console.log(`- Added metadata to Firestore.`);

      } catch (err: any) {
        console.error(`! Failed to process ${fileName}:`, err.message || err);
      }
    }

    console.log('Seeding complete!');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Error: The directory '${KNOWLEDGE_BASE_DIR}' was not found.`);
      console.error("Please make sure the directory exists and contains your knowledge base files.");
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

main().catch(console.error);
