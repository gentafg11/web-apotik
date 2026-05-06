import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRouter from './routes/auth';
import { verifyToken } from './middleware/auth';
import userRouter from './routes/user';
import productRouter from './routes/product';
import saleRouter from './routes/sale';
import expenseRouter from './routes/expense';
import reportRouter from './routes/report';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: 'http://localhost:3002' }));
app.use(express.json());

// Public endpoint
app.use('/api/reports', reportRouter);

// Auth routes (no token needed)
app.use('/api/auth', authRouter);

// Protected routes (require token)
app.use(verifyToken);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/sales', saleRouter);
app.use('/api/expenses', expenseRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));