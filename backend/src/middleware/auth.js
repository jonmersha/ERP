import admin from 'firebase-admin';
import pool from '../db.js';

// Initialize Firebase Admin (assuming default credentials work)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Look up user company_id
    const [rows] = await pool.query('SELECT company_id FROM users WHERE uid = ?', [decodedToken.uid]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    
    req.user = { ...decodedToken, company_id: rows[0].company_id };
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
