'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';

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

export default function DashboardPage() {
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
        return { productId, qty, name: product?.name || `Product ${productId}` };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [productSalesMap, products]);

  const getProductName = (id: number) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : `Product ${id}`;
  };

  const chartData = (label: string, data: number[]) => ({
    labels: ['Sales', 'Expenses', 'Profit'],
    datasets: [{
      label,
      data,
      backgroundColor: ['#4f46e5', '#ef4444', '#10b981'],
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
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {error && (
        <Card className="border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={totalProducts} icon="📦" />
        <StatCard title="Stock Value" value={`Rp ${totalStockValue.toLocaleString()}`} icon="💰" />
        <StatCard title="Low Stock" value={lowStockCount} icon="⚠️" variant={lowStockCount > 0 ? 'warning' : 'default'} />
        <StatCard title="Total Sales" value={totalSalesCount} icon="🧾" />
        <StatCard title="Total Revenue" value={`Rp ${totalRevenue.toLocaleString()}`} icon="💵" variant="success" />
        <StatCard title="Today's Revenue" value={`Rp ${todayRevenue.toLocaleString()}`} icon="📈" />
        <StatCard title="Total Expenses" value={totalExpensesCount} icon="💸" variant="danger" />
        <StatCard title="Net Profit" value={`Rp ${netProfit.toLocaleString()}`} icon={netProfit >= 0 ? '📈' : '📉'} variant={netProfit >= 0 ? 'success' : 'danger'} />
      </div>

      <Card title="Reports" className="shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 text-center">Daily</h3>
            <Bar data={chartData('Daily', [dailyReport.sales, dailyReport.expenses, dailyReport.profit])} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 text-center">Weekly</h3>
            <Bar data={chartData('Weekly', [weeklyReport.sales, weeklyReport.expenses, weeklyReport.profit])} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 text-center">Monthly</h3>
            <Bar data={chartData('Monthly', [monthlyReport.sales, monthlyReport.expenses, monthlyReport.profit])} />
          </div>
        </div>
      </Card>

      <Card title="Low Stock Products" className="shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>SKU</TableHeader>
              <TableHeader>Stock</TableHeader>
              <TableHeader>Price</TableHeader>
            </TableRow>
          </TableHead>
          {lowStockProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                No low stock products.
              </TableCell>
            </TableRow>
          ) : (
            lowStockProducts.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>
                  <Badge variant={p.stock < 5 ? 'danger' : 'warning'}>{p.stock}</Badge>
                </TableCell>
                <TableCell>Rp {p.price.toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>

      <Card title="Recent Sales" className="shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Items</TableHeader>
              <TableHeader>Total</TableHeader>
            </TableRow>
          </TableHead>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                No sales recorded.
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

      <Card title="Recent Expenses" className="shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Date</TableHeader>
            </TableRow>
          </TableHead>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                No expenses recorded.
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

      <Card title="Top Selling Products" className="shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Rank</TableHeader>
              <TableHeader>Product</TableHeader>
              <TableHeader>Total Qty Sold</TableHeader>
            </TableRow>
          </TableHead>
          {topProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                No sales data yet.
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