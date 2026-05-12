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
import Receipt from '../components/ui/Receipt';
import withAuth from '../components/withAuth';

interface SaleItem {
  id: number;
  productId: number;
  qty: number;
  price: number;
  productName?: string;
}

interface Sale {
  id: number;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
  customer?: { name: string };
}

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [productOptions, setProductOptions] = useState<{id:number; name:string;}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editProductId, setEditProductId] = useState<number | "">('');
  const [editQty, setEditQty] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [printSale, setPrintSale] = useState<Sale | null>(null);

  // Fetch sales list
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/sales');
        setSales(res.data);
        setError('');
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load sales');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProductOptions(res.data);
      } catch (e) {}
    };
    fetchProducts();
  }, []);

  // Stats
  const totalSales = sales.length;
  const totalRevenue = useMemo(() =>
    sales.reduce((sum, s) => sum + Number(s.totalAmount), 0), [sales]
  );
  const avgTransaction = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Filtered sales
  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    const term = searchTerm.toLowerCase();
    return sales.filter(s =>
      s.id.toString().includes(term) ||
      new Date(s.createdAt).toLocaleString().toLowerCase().includes(term)
    );
  }, [sales, searchTerm]);

  // Delete handler
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/sales/${id}`);
      setSales(sales.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const handlePrint = (sale: Sale) => {
    setPrintSale(sale);
  };

  const closePrint = () => {
    setPrintSale(null);
  };

  // Create form state (single item)
  const [productId, setProductId] = useState<number | "">('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        items: [{ productId: Number(productId), qty: Number(qty), price: Number(price) }]
      };
      const res = await axios.post('/api/sales', payload);
      setSales([res.data, ...sales]);
      setProductId(''); setQty(''); setPrice('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Create failed');
    }
  };

  const startEdit = (sale: Sale) => {
    // Assuming single item per sale for now
    if (sale.items.length === 0) return;
    const item = sale.items[0];
    setEditingId(sale.id);
    setEditProductId(item.productId);
    setEditQty(String(item.qty));
    setEditPrice(String(item.price));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditProductId('');
    setEditQty('');
    setEditPrice('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        items: [{ productId: Number(editProductId), qty: Number(editQty), price: Number(editPrice) }]
      };
      const res = await axios.put(`/api/sales/${editingId}`, payload);
      setSales(sales.map(s => s.id === editingId ? res.data : s));
      cancelEdit();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  // Helper to get product name from ID
  const getProductName = (pid: number) => {
    const p = productOptions.find(opt => opt.id === pid);
    return p ? p.name : `Product ${pid}`;
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
      <h1 className="text-3xl font-bold text-gray-800">Sales</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Sales" value={totalSales} icon="🧾" />
        <StatCard title="Revenue" value={`Rp ${totalRevenue.toLocaleString()}`} icon="💵" variant="success" />
        <StatCard title="Avg Transaction" value={`Rp ${avgTransaction.toLocaleString(undefined, {maximumFractionDigits:0})}`} icon="📊" />
      </div>

      {error && (
        <Card className="border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Sale Form (Create or Edit) */}
      <Card title={editingId !== null ? 'Edit Sale' : 'Create New Sale'} className="shadow-lg">
        <form onSubmit={editingId !== null ? handleUpdate : handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={editingId !== null ? editProductId : productId}
                onChange={e => editingId !== null ? setEditProductId(Number(e.target.value)) : setProductId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled>Select product</option>
                {productOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Quantity"
              type="number"
              value={editingId !== null ? editQty : qty}
              onChange={e => editingId !== null ? setEditQty(e.target.value) : setQty(e.target.value)}
              placeholder="1"
              required
              min="1"
            />
            <Input
              label="Price (Rp)"
              type="number"
              value={editingId !== null ? editPrice : price}
              onChange={e => editingId !== null ? setEditPrice(e.target.value) : setPrice(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" variant="primary">
              {editingId !== null ? 'Update Sale' : 'Add Sale'}
            </Button>
            {editingId !== null && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      {printSale && (
        <Receipt
          sale={printSale}
          onClose={closePrint}
          getProductName={getProductName}
        />
      )}

      {/* Sales Table */}
      <Card title="Sales History" className="shadow-lg overflow-hidden">
        <div className="mb-4 max-w-xs">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari penjualan..."
          />
        </div>
        <TableWrapper>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Items</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  {searchTerm ? 'Penjualan tidak ditemukan.' : 'Belum ada penjualan.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {s.items.map((it, idx) => (
                        <span key={idx} className="text-sm">
                          {getProductName(it.productId)} × {it.qty} @ Rp {Number(it.price).toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Rp {Number(s.totalAmount).toLocaleString()}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="primary" onClick={() => handlePrint(s)}>Print</Button>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(s)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(s.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </Table>
          </TableWrapper>
        </Card>

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Hapus Penjualan"
        message="Apakah Anda yakin ingin menghapus penjualan ini?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

export default withAuth(SalesPage);
