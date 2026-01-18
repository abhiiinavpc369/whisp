import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import friendRoutes from './modules/friends/friend.routes.js';
import messageRoutes from './modules/messages/message.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.send('Whisp API running');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/friends', friendRoutes);
app.use('/messages', messageRoutes);

export default app;
