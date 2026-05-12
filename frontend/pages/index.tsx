import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatCard from '../components/ui/StatCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface SaleItem {
  productId: number;
  qty: number;
  price: number;
}

interface Sale {
  id: number;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  createdAt: string;
}

interface ReportData {
  sales: number;
  expenses: number;
  profit: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, sRes, eRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/sales'),
          axios.get('/api/expenses')
        ]);
        setProducts(pRes.data);
        setSales(sRes.data);
        setExpenses(eRes.data);
        setError('');
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const totalProducts = products.length;
  const totalStockValue = useMemo(() =>
    products.reduce((sum, p) => sum + p.price * p.stock, 0), [products]
  );
  const lowStockProducts = useMemo(() =>
    products.filter(p => p.stock < 10).sort((a, b) => a.stock - b.stock), [products]
  );
  const lowStockCount = lowStockProducts.length;

  const totalSalesCount = sales.length;
  const totalRevenue = useMemo(() =>
    sales.reduce((sum, s) => sum + Number(s.totalAmount), 0), [sales]
  );

  const todayStr = new Date().toDateString();
  const todaySales = useMemo(() =>
    sales.filter(s => new Date(s.createdAt).toDateString() === todayStr), [sales]
  );
  const todayRevenue = useMemo(() =>
    todaySales.reduce((sum, s) => sum + Number(s.totalAmount), 0), [todaySales]
  );

  const totalExpensesCount = expenses.length;
  const totalExpensesAmount = useMemo(() =>
    expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]
  );
  const todayExpenses = useMemo(() =>
    expenses.filter(e => new Date(e.createdAt).toDateString() === todayStr), [expenses]
  );
  const todayExpensesAmount = useMemo(() =>
    todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0), [todayExpenses]
  );

  const netProfit = totalRevenue - totalExpensesAmount;
  const todayNetProfit = todayRevenue - todayExpensesAmount;

  const dailyReport = useMemo<ReportData>(() => {
    const daySales = sales.filter(s => new Date(s.createdAt).toDateString() === todayStr)
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const dayExpenses = expenses.filter(e => new Date(e.createdAt).toDateString() === todayStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { sales: daySales, expenses: dayExpenses, profit: daySales - dayExpenses };
  }, [sales, expenses, todayStr]);

  const weeklyReport = useMemo<ReportData>(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySales = sales.filter(s => new Date(s.createdAt) >= weekAgo)
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const weeklyExpenses = expenses.filter(e => new Date(e.createdAt) >= weekAgo)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { sales: weeklySales, expenses: weeklyExpenses, profit: weeklySales - weeklyExpenses };
  }, [sales, expenses]);

  const monthlyReport = useMemo<ReportData>(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlySales = sales.filter(s => new Date(s.createdAt) >= monthStart)
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const monthlyExpenses = expenses.filter(e => new Date(e.createdAt) >= monthStart)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { sales: monthlySales, expenses: monthlyExpenses, profit: monthlySales - monthlyExpenses };
  }, [sales, expenses]);

  const productSalesMap = useMemo(() => {
    const map = new Map<number, number>();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const current = map.get(item.productId) || 0;
        map.set(item.productId, current + item.qty);
      });
    });
    return map;
  }, [sales]);

  const topProducts = useMemo(() => {
    return Array.from(productSalesMap.entries())
      .map(([productId, qty]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          qty,
          name: product?.name || `Product ${productId}`
        };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [productSalesMap, products]);

  const getProductName = (id: number) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : `Product ${id}`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const chartData = (data: number[]) => ({
    labels: ['Penjualan', 'Pengeluaran', 'Profit'],
    datasets: [{
      data,
      backgroundColor: ['#4f46e5', '#ef4444', '#10b981'],
      borderRadius: 8,
    }]
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-theme-primary">Dashboard</h1>
        <p className="text-sm text-theme-secondary">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {error && (
        <Card className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produk" value={totalProducts} icon="📦" />
        <StatCard title="Nilai Stok" value={`Rp ${totalStockValue.toLocaleString()}`} icon="💰" />
        <StatCard title="Stok Rendah" value={lowStockCount} icon="⚠️" variant={lowStockCount > 0 ? 'warning' : 'default'} />
        <StatCard title="Total Penjualan" value={totalSalesCount} icon="🧾" />
        <StatCard title="Total Pendapatan" value={`Rp ${totalRevenue.toLocaleString()}`} icon="💵" variant="success" />
        <StatCard title="Pendapatan Hari Ini" value={`Rp ${todayRevenue.toLocaleString()}`} icon="📈" />
        <StatCard title="Total Pengeluaran" value={totalExpensesCount} icon="💸" variant="danger" />
        <StatCard title="Keuntungan Bersih" value={`Rp ${netProfit.toLocaleString()}`} icon={netProfit >= 0 ? '📈' : '📉'} variant={netProfit >= 0 ? 'success' : 'danger'} />
      </div>

      <Card title="Laporan">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-theme-tertiary/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-theme-secondary mb-3 text-center">Harian</h3>
            <Bar data={chartData([dailyReport.sales, dailyReport.expenses, dailyReport.profit])} options={chartOptions} />
          </div>
          <div className="bg-theme-tertiary/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-theme-secondary mb-3 text-center">Mingguan</h3>
            <Bar data={chartData([weeklyReport.sales, weeklyReport.expenses, weeklyReport.profit])} options={chartOptions} />
          </div>
          <div className="bg-theme-tertiary/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-theme-secondary mb-3 text-center">Bulanan</h3>
            <Bar data={chartData([monthlyReport.sales, monthlyReport.expenses, monthlyReport.profit])} options={chartOptions} />
          </div>
        </div>
      </Card>

      <Card title="Produk Stok Rendah">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Nama</TableHeader>
              <TableHeader>SKU</TableHeader>
              <TableHeader>Stok</TableHeader>
              <TableHeader>Harga</TableHeader>
            </TableRow>
          </TableHead>
          {lowStockProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-theme-secondary py-8">
                Tidak ada produk stok rendah.
              </TableCell>
            </TableRow>
          ) : (
            lowStockProducts.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-theme-secondary">{p.sku}</TableCell>
                <TableCell>
                  <Badge variant={p.stock < 5 ? 'danger' : 'warning'}>{p.stock}</Badge>
                </TableCell>
                <TableCell>Rp {Number(p.price).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>

      <Card title="Penjualan Terbaru">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Tanggal</TableHeader>
              <TableHeader>Item</TableHeader>
              <TableHeader>Total</TableHeader>
            </TableRow>
          </TableHead>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-theme-secondary py-8">
                Belum ada penjualan.
              </TableCell>
            </TableRow>
          ) : (
            sales.slice(0, 10).map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {s.items.map((it, idx) => (
                      <span key={idx} className="text-sm">
                        {getProductName(it.productId)} × {it.qty}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Rp {Number(s.totalAmount).toLocaleString()}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>

      <Card title="Pengeluaran Terbaru">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Keterangan</TableHeader>
              <TableHeader>Jumlah</TableHeader>
              <TableHeader>Tanggal</TableHeader>
            </TableRow>
          </TableHead>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-theme-secondary py-8">
                Belum ada pengeluaran.
              </TableCell>
            </TableRow>
          ) : (
            expenses.slice(0, 10).map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                <TableCell className="font-medium">{e.description}</TableCell>
                <TableCell>
                  <Badge variant="danger">Rp {Number(e.amount).toLocaleString()}</Badge>
                </TableCell>
                <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>

      <Card title="Produk Terlaris">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Rank</TableHeader>
              <TableHeader>Produk</TableHeader>
              <TableHeader>Total Terjual</TableHeader>
            </TableRow>
          </TableHead>
          {topProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-theme-secondary py-8">
                Belum ada data penjualan.
              </TableCell>
            </TableRow>
          ) : (
            topProducts.map((p, idx) => (
              <TableRow key={p.productId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="info">{p.qty}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
}
