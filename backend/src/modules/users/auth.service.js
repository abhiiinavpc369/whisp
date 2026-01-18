import jwt from 'jsonwebtoken';
import { googleClient } from '../../config/google.js';
import { ENV } from '../../config/env.js';
import { User } from '../users/user.model.js';

async function generateUsername(name) {
  let base = `whisp_${name.toLowerCase().replace(/\s+/g, '')}`;
  let username = base;
  let count = 1;

  while (await User.findOne({ username })) {
    username = `${base}_${count++}`;
  }
  return username;
}

export async function handleGoogleAuth(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: ENV.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const { sub, email, name, picture } = payload;

  let user = await User.findOne({
    'authProviders.google.googleId': sub
  });

  if (!user) {
    user = new User({
      username: await generateUsername(name),
      email,
      avatar: picture,
      authProviders: {
        google: { googleId: sub }
      }
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { userId: user._id },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      avatar: user.avatar
    }
  };
}
