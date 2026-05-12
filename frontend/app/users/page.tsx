'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/users');
        setUsers(res.data);
        setError('');
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const updates: any = { email, role };
        if (password) updates.password = password;
        const res = await axios.put(`/api/users/${editingId}`, updates);
        setUsers(users.map(u => u.id === editingId ? res.data : u));
        setEditingId(null);
      } else {
        const res = await axios.post('/api/users', { email, password, role });
        setUsers([...users, res.data]);
      }
      setEmail('');
      setPassword('');
      setRole('CASHIER');
    } catch (e: any) {
      alert(e.response?.data?.message || (editingId !== null ? 'Update failed' : 'Create failed'));
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEmail(user.email);
    setRole(user.role);
    setPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">User Management</h1>

      {error && (
        <Card className="border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <Card title={editingId !== null ? 'Edit User' : 'Add New User'} className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required={editingId === null} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full border p-2 rounded" required>
                <option value="CASHIER">Cashier</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button type="submit" variant="primary">{editingId !== null ? 'Update User' : 'Add User'}</Button>
            {editingId !== null && (
              <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setEmail(''); setPassword(''); setRole('CASHIER'); }}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <Card title="Users List" className="shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">No users found.</TableCell>
            </TableRow>
          ) : (
            users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="w-12">{u.id}</TableCell>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'ADMIN' ? 'danger' : 'warning'}>{u.role}</Badge>
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="space-x-2 whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(u)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
}