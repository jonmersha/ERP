import { Request, Response, NextFunction } from "express";
import { auth, db } from "../firebase.js";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    companyId?: string;
    role?: string;
    roles?: string[];
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user profile from Firestore to get companyId and roles
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      // If user doc doesn't exist, they might be a new user or just not set up yet
      // We still allow them through but with minimal info
      req.user = { 
        uid, 
        email: decodedToken.email 
      };
    } else {
      const userData = userDoc.data();
      req.user = {
        uid,
        email: decodedToken.email,
        companyId: userData?.companyId,
        role: userData?.role,
        roles: userData?.roles || [],
      };
    }

    next();
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
