import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth as baseGetAuth } from "firebase-admin/auth";
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
    if (firebaseConfig.projectId) {
      console.log("Initializing Firebase Admin with project:", firebaseConfig.projectId);
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
      console.log("Firebase Admin initialized successfully");
    } else {
      console.warn("Firebase projectId not found in config. Skipping Admin SDK initialization or using ADC.");
      try {
        initializeApp();
        console.log("Firebase Admin initialized via ADC");
      } catch (adcError) {
        console.error("Firebase Admin initialization failed both with config and ADC:", adcError);
      }
    }
  } catch (error) {
    console.error("Error during Firebase Admin initialization attempt:", error);
  }
}

let _db: any = null;
let _auth: any = null;

export const getDb = () => {
  if (!_db) {
    _db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(firebaseConfig.firestoreDatabaseId)
      : getFirestore();
    console.log("Firestore initialized with database:", firebaseConfig.firestoreDatabaseId || "(default)");
  }
  return _db;
};

export const getAuth = () => {
  if (!_auth) {
    _auth = baseGetAuth();
  }
  return _auth;
};
