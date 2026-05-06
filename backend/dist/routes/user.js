"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET all users (admin only)
router.get('/', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
    res.json(users);
});
// GET user by id (admin only)
router.get('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        select: { id: true, email: true, role: true, createdAt: true }
    });
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    res.json(user);
});
// CREATE user (admin only) – password will be hashed
router.post('/', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const { email, password, role } = req.body;
    const hashed = await bcryptjs_1.default.hash(password, 10);
    try {
        const newUser = await prisma.user.create({
            data: { email, password: hashed, role },
            select: { id: true, email: true, role: true, createdAt: true }
        });
        res.status(201).json(newUser);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
// UPDATE user (admin only) – optional password change
router.put('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const { email, password, role } = req.body;
    const data = {};
    if (email)
        data.email = email;
    if (role)
        data.role = role;
    if (password)
        data.password = await bcryptjs_1.default.hash(password, 10);
    try {
        const updated = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data,
            select: { id: true, email: true, role: true, createdAt: true }
        });
        res.json(updated);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
// DELETE user (admin only)
router.delete('/:id', async (req, res) => {
    if (req.user?.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    try {
        await prisma.user.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Deleted' });
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
exports.default = router;
