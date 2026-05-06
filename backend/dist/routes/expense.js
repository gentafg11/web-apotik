"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// LIST expenses – admin sees all, cashier sees own
router.get('/', async (req, res) => {
    const where = req.user?.role === 'ADMIN' ? {} : { userId: req.user?.id };
    const expenses = await prisma.expense.findMany({ where, include: { user: true } });
    res.json(expenses);
});
// GET single expense (owner or admin)
router.get('/:id', async (req, res) => {
    const expense = await prisma.expense.findUnique({
        where: { id: Number(req.params.id) },
        include: { user: true }
    });
    if (!expense)
        return res.status(404).json({ message: 'Expense not found' });
    if (req.user?.role !== 'ADMIN' && expense.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(expense);
});
// CREATE expense (cashier or admin)
router.post('/', async (req, res) => {
    const { description, amount } = req.body;
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    const expense = await prisma.expense.create({
        data: { description, amount, userId: req.user.id },
        include: { user: true }
    });
    res.status(201).json(expense);
});
// UPDATE expense (admin only for simplicity)
router.put('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const { description, amount } = req.body;
    const data = {};
    if (description !== undefined)
        data.description = description;
    if (amount !== undefined)
        data.amount = amount;
    const updated = await prisma.expense.update({
        where: { id: Number(req.params.id) },
        data,
        include: { user: true }
    });
    res.json(updated);
});
// DELETE expense (admin only)
router.delete('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    await prisma.expense.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
});
exports.default = router;
