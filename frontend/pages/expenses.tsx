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
import StatCard from '../components/ui/StatCard';
import withAuth from '../components/withAuth';

interface Expense {
  id: number;
  description: string;
  amount: number;
  createdAt: string;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch list
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/expenses');
        setExpenses(res.data);
        setError('');
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Stats
  const totalExpenses = expenses.length;
  const totalAmount = useMemo(() =>
    expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]
  );
  const avgAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return expenses;
    const term = searchTerm.toLowerCase();
    return expenses.filter(e =>
      e.description.toLowerCase().includes(term)
    );
  }, [expenses, searchTerm]);

  // Delete handler
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { description, amount: Number(amount) };
      let res;
      if (editingId !== null) {
        res = await axios.put(`/api/expenses/${editingId}`, payload);
        setExpenses(expenses.map(ex => ex.id === editingId ? res.data : ex));
        setEditingId(null);
      } else {
        res = await axios.post('/api/expenses', payload);
        setExpenses([res.data, ...expenses]);
      }
      setDescription(''); setAmount('');
    } catch (e: any) {
      alert(e.response?.data?.message || (editingId !== null ? 'Update failed' : 'Create failed'));
    }
  };

  const startEdit = (e: Expense) => {
    setEditingId(e.id);
    setDescription(e.description);
    setAmount(String(e.amount));
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
      <h1 className="text-3xl font-bold text-gray-800">Pengeluaran</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Pengeluaran" value={totalExpenses} icon="📤" />
        <StatCard title="Jumlah Total" value={`Rp ${totalAmount.toLocaleString()}`} icon="💸" variant="danger" />
        <StatCard title="Rata-rata" value={`Rp ${avgAmount.toLocaleString(undefined, {maximumFractionDigits:0})}`} icon="📉" />
      </div>

      {error && (
        <Card className="border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Expense Form */}
      <Card title={editingId !== null ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'} className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Keterangan"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Deskripsi pengeluaran"
              required
            />
            <Input
              label="Jumlah (Rp)"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              required
              min="0"
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" variant="primary">
              {editingId !== null ? 'Update Pengeluaran' : 'Tambah Pengeluaran'}
            </Button>
            {editingId !== null && (
              <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setDescription(''); setAmount(''); }}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Expenses Table */}
      <Card title="Riwayat Pengeluaran" className="shadow-lg overflow-hidden">
        <div className="mb-4 max-w-xs">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari pengeluaran..."
          />
        </div>
        <TableWrapper>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Keterangan</TableHeader>
                <TableHeader>Jumlah</TableHeader>
                <TableHeader>Tanggal</TableHeader>
                <TableHeader>Aksi</TableHeader>
              </TableRow>
            </TableHead>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  {searchTerm ? 'Pengeluaran tidak ditemukan.' : 'Belum ada pengeluaran.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{e.id}</TableCell>
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell>
                    <Badge variant="danger">Rp {Number(e.amount).toLocaleString()}</Badge>
                  </TableCell>
                  <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(e)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(e.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </Table>
          </TableWrapper>
        </Card>

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Hapus Pengeluaran"
        message="Apakah Anda yakin ingin menghapus pengeluaran ini?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

export default withAuth(ExpensesPage);
