import { handleGoogleAuth } from './auth.service.js';

export async function googleAuthController(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'ID token missing' });
    }

    const data = await handleGoogleAuth(idToken);
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
}
