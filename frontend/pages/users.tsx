import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import SearchInput from '../components/ui/SearchInput';
import ConfirmModal from '../components/ui/ConfirmModal';
import { TableWrapper, Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import withAuth from '../components/withAuth';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch users on mount
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

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Delete handler
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        // Update user
        const updates: any = { email, role };
        if (password) updates.password = password;

        const res = await axios.put(`/api/users/${editingId}`, updates);
        setUsers(users.map(u => u.id === editingId ? res.data : u));
        setEditingId(null);
      } else {
        // Create user
        const res = await axios.post('/api/users', { email, password, role });
        setUsers([...users, res.data]);
      }
      setEmail('');
      setPassword('');
      setRole('USER');
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
      <h1 className="text-3xl font-bold text-theme-primary">Manajemen User</h1>

      {error && (
        <Card className="border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* User Form */}
      <Card title={editingId !== null ? 'Edit User' : 'Tambah User Baru'} className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@contoh.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required={editingId === null}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="USER">User</option>
                <option value="CASHIER">Kasir</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button type="submit" variant="primary">
              {editingId !== null ? 'Update User' : 'Tambah User'}
            </Button>
            {editingId !== null && (
              <Button type="button" variant="secondary" onClick={() => {
                setEditingId(null);
                setEmail('');
                setPassword('');
                setRole('USER');
              }}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <Card title="Daftar User" className="shadow-lg overflow-hidden">
        <div className="mb-4 max-w-xs">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari user..."
          />
        </div>
        <TableWrapper>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Dibuat</TableHeader>
                <TableHeader>Aksi</TableHeader>
              </TableRow>
            </TableHead>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  {searchTerm ? 'User tidak ditemukan.' : 'Tidak ada user.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="w-12">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'CASHIER' ? 'warning' : 'success'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap">
                    <Button size="sm" variant="ghost" type="button" onClick={(e) => { e.stopPropagation(); startEdit(u); }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" type="button" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(u.id); }}>
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </Table>
          </TableWrapper>
        </Card>

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Hapus User"
        message="Apakah Anda yakin ingin menghapus user ini?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default withAuth(UsersPage, true);