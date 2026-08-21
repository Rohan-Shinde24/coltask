'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Shield } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.users);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/login'); // redirect if not admin
      }
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const roleData = [
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
    { name: 'Users', value: users.filter(u => u.role === 'user').length },
  ];
  
  const statusData = [
    { name: 'Active', value: users.filter(u => !u.deletedAt && (!u.banExpiresAt || new Date(u.banExpiresAt) < new Date())).length },
    { name: 'Banned', value: users.filter(u => u.banExpiresAt && new Date(u.banExpiresAt) > new Date()).length },
    { name: 'Deleted (Recycle Bin)', value: users.filter(u => u.deletedAt).length },
  ];

  const COLORS = ['#47d2b2', '#8b5cf6', '#ef4444', '#f59e0b'];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>;
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="text-primary" size={32} />
              Admin Dashboard
            </h1>
            <p className="text-base-content/70 mt-1">Manage users, roles, and platform health.</p>
          </div>
          <Link href="/workshops" className="btn btn-ghost">Back to App</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* STATS & CHARTS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-sm text-base-content/60 uppercase tracking-wider">Total Users</h2>
              <div className="text-4xl font-black">{users.length}</div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300 md:col-span-2 h-72">
            <div className="card-body">
              <h2 className="card-title text-sm">User Status Distribution</h2>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
