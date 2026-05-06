import { useEffect, useState } from 'react';
import axios from 'axios';

interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/suppliers');
        setSuppliers(res.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load suppliers');
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await axios.delete(`/api/suppliers/${id}`);
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/suppliers', { name, phone, email });
      setSuppliers([res.data, ...suppliers]);
      setName(''); setPhone(''); setEmail('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suppliers</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleCreate} className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Add Supplier</h2>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 w-full mb-2" required />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="border p-2 w-full mb-2" />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 w-full mb-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id} className="border-t">
              <td className="px-4 py-2">{s.id}</td>
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.phone}</td>
              <td className="px-4 py-2">{s.email}</td>
              <td className="px-4 py-2 space-x-2">
                <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
