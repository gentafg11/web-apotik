import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatCard from '../components/ui/StatCard';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch products on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/products');
        setProducts(res.data);
        setError('');
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Derived stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const totalValue = useMemo(() =>
    products.reduce((sum, p) => sum + p.price * p.stock, 0), [products]
  );

  // Delete handler
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Clean up preview URL
  useEffect(() => {
    if (imagePreview) {
      return () => URL.revokeObjectURL(imagePreview);
    }
  }, [imagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        sku,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
      };

      let res;
      if (editingId !== null) {
        res = await axios.put(`/api/products/${editingId}`, payload);
        setProducts(products.map(p => p.id === editingId ? res.data : p));
        setEditingId(null);
      } else {
        res = await axios.post('/api/products', payload);
        setProducts([res.data, ...products]);
      }
      setName(''); setSku(''); setPrice(''); setCost(''); setStock('');
      setImageFile(null);
      setImagePreview(null);
    } catch (e: any) {
      alert(e.response?.data?.message || (editingId !== null ? 'Update failed' : 'Create failed'));
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setSku(p.sku);
    setPrice(String(p.price));
    setCost(String(p.cost));
    setStock(String(p.stock));
    setImageFile(null);
    setImagePreview(null);
  };

  // Determine existing image for edit preview
  const existingImage = editingId ? products.find(p => p.id === editingId)?.imageUrl : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Products</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Products" value={totalProducts} icon="📦" />
        <StatCard title="Low Stock" value={lowStockCount} icon="⚠️" variant={lowStockCount > 0 ? 'warning' : 'default'} />
        <StatCard title="Total Value" value={`Rp ${totalValue.toLocaleString()}`} icon="💰" variant="success" />
      </div>

      {error && (
        <Card className="border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Product Form */}
      <Card title={editingId !== null ? 'Edit Product' : 'Add Product'} className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Product Name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
            <Input
              label="SKU"
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="e.g. PRD-001"
              required
            />
            <Input
              label="Price (Rp)"
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              required
            />
            <Input
              label="Cost (Rp)"
              type="number"
              value={cost}
              onChange={e => setCost(e.target.value)}
              placeholder="0"
              required
            />
            <Input
              label="Stock"
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
              placeholder="0"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full border p-2 rounded"
              />
              {(imagePreview || existingImage) && (
                <div className="mt-2">
                  <img
                    src={imagePreview || existingImage || ''}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" variant="primary">
              {editingId !== null ? 'Update Product' : 'Add Product'}
            </Button>
            {editingId !== null && (
              <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setName(''); setSku(''); setPrice(''); setCost(''); setStock(''); setImageFile(null); setImagePreview(null); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Products Table */}
      <Card title="Product List" className="shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Image</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>SKU</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Stock</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>Rp {Number(p.price).toLocaleString()}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <Badge variant={p.stock < 10 ? 'danger' : 'success'}>
                    {p.stock < 10 ? 'Low Stock' : 'In Stock'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(p)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
}
