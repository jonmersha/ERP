import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

// Load the Firebase configuration
let configPath = path.join(process.cwd(), "firebase-applet-config.json");
if (!fs.existsSync(configPath)) {
  configPath = path.join(process.cwd(), "..", "firebase-applet-config.json");
}
let firebaseConfig: any = {};

if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    console.log("Initializing Firebase Admin with project:", firebaseConfig.projectId);
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(firebaseConfig.firestoreDatabaseId)
  : getFirestore();
console.log("Firestore initialized with database:", firebaseConfig.firestoreDatabaseId || "(default)");
export const auth = getAuth();
