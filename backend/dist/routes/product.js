"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Multer config – store in public/uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        const uniq = Date.now() + '-' + file.originalname;
        cb(null, uniq);
    }
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 2 * 1024 * 1024 } });
// CREATE
router.post('/', upload.single('image'), async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const { name, sku, price, cost, stock, categoryId, supplierId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    try {
        const product = await prisma.product.create({
            data: { name, sku, price: Number(price), cost: Number(cost), stock: Number(stock), categoryId: Number(categoryId), supplierId: Number(supplierId), imageUrl }
        });
        res.json(product);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
// READ all
router.get('/', async (req, res) => {
    const products = await prisma.product.findMany({ include: { category: true, supplier: true } });
    res.json(products);
});
// READ one
router.get('/:id', async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: Number(req.params.id) },
        include: { category: true, supplier: true }
    });
    if (!product)
        return res.status(404).json({ message: 'Not found' });
    res.json(product);
});
// UPDATE
router.put('/:id', upload.single('image'), async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const { name, sku, price, cost, stock, categoryId, supplierId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const data = { name, sku, price: Number(price), cost: Number(cost), stock: Number(stock), categoryId: Number(categoryId), supplierId: Number(supplierId) };
    if (imageUrl)
        data.imageUrl = imageUrl;
    try {
        const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
        res.json(product);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
// DELETE
router.delete('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
});
exports.default = router;
