"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// LIST sales (admin sees all, cashier sees only own)
router.get('/', async (req, res) => {
    const where = req.user?.role === 'ADMIN' ? {} : { userId: req.user?.id };
    const sales = await prisma.sale.findMany({
        where,
        include: { items: { include: { product: true } }, customer: true, user: true }
    });
    res.json(sales);
});
// GET single sale
router.get('/:id', async (req, res) => {
    const sale = await prisma.sale.findUnique({
        where: { id: Number(req.params.id) },
        include: { items: { include: { product: true } }, customer: true, user: true }
    });
    if (!sale)
        return res.status(404).json({ message: 'Sale not found' });
    // cashiers can only see their own sales
    if (req.user?.role !== 'ADMIN' && sale.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(sale);
});
// CREATE a sale (cashier or admin)
router.post('/', async (req, res) => {
    const { customerId, items } = req.body;
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    // calculate totalAmount
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const sale = await prisma.sale.create({
        data: {
            userId: req.user.id,
            customerId: customerId ?? undefined,
            totalAmount: total,
            items: { create: items.map(i => ({ productId: i.productId, qty: i.qty, price: i.price })) }
        },
        include: { items: true }
    });
    res.status(201).json(sale);
});
// UPDATE sale (admin only for simplicity)
router.put('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const { customerId, items } = req.body;
    // For brevity we allow only updating customerId here; full item edit would need more logic.
    const data = {};
    if (customerId !== undefined)
        data.customerId = customerId;
    const updated = await prisma.sale.update({
        where: { id: Number(req.params.id) },
        data,
        include: { items: true }
    });
    res.json(updated);
});
// DELETE sale (admin only)
router.delete('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    await prisma.sale.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
});
exports.default = router;
