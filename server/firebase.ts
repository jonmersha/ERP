import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

// Load the Firebase configuration
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};

if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

// Initialize Firebase Admin SDK
// Note: In this environment, we use the default credentials if possible,
// but for now we'll just initialize it.
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const db = getFirestore();
export const auth = getAuth();
