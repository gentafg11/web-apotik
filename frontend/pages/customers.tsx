import { useEffect, useState } from 'react';
import axios from 'axios';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/customers');
        setCustomers(res.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load customers');
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await axios.delete(`/api/customers/${id}`);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/customers', { name, phone, email, address });
      setCustomers([res.data, ...customers]);
      setName(''); setPhone(''); setEmail(''); setAddress('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleCreate} className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Add Customer</h2>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 w-full mb-2" required />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="border p-2 w-full mb-2" />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 w-full mb-2" />
        <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="border p-2 w-full mb-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Address</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">{c.id}</td>
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.phone}</td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2">{c.address}</td>
              <td className="px-4 py-2 space-x-2">
                <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
