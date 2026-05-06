"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Helper to aggregate sales & expenses between dates
async function aggregate(from, to) {
    const sales = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: from, lte: to } }
    });
    const expenses = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: from, lte: to } }
    });
    return {
        sales: Number(sales._sum.totalAmount ?? 0),
        expenses: Number(expenses._sum.amount ?? 0),
        profit: Number(sales._sum.totalAmount ?? 0) - Number(expenses._sum.amount ?? 0)
    };
}
router.get('/daily', async (req, res) => {
    const now = new Date();
    const from = (0, date_fns_1.startOfDay)(now);
    const to = (0, date_fns_1.endOfDay)(now);
    const data = await aggregate(from, to);
    res.json(data);
});
router.get('/weekly', async (req, res) => {
    const now = new Date();
    const from = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 }); // Monday
    const to = (0, date_fns_1.endOfDay)(now);
    const data = await aggregate(from, to);
    res.json(data);
});
router.get('/monthly', async (req, res) => {
    const now = new Date();
    const from = (0, date_fns_1.startOfMonth)(now);
    const to = (0, date_fns_1.endOfDay)(now);
    const data = await aggregate(from, to);
    res.json(data);
});
exports.default = router;
