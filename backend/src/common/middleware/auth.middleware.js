import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';

export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, ENV.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}
