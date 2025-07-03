import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Brain, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent } from '../../components/ui/Card';

interface UserData {
  id: number;
  email: string;
  fullname: string;
  username: string;
  role: { id: number; name: string };
}

export const SuperAdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tests' | 'commissions'>('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'super_admin') {
        navigate('/');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neuroscan-token');
      const res = await axios.get<UserData[]>('https://mahirku-production.up.railway.app/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm">Total Tests</p>
              <p className="text-2xl font-bold">12</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm">Total Commissions</p>
              <p className="text-2xl font-bold">Rp 320.000</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm">Pending Commissions</p>
              <p className="text-2xl font-bold">Rp 70.000</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'users') {
  return (
    <div className="overflow-x-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
      {users.length === 0 ? (
        <p className="text-gray-600 p-4">No users found.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u, index) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {u.fullname || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-700">{u.role.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


    if (activeTab === 'tests') {
      return (
        <Card>
          <CardContent className="p-6 text-center text-gray-600">
            Belum ada data tes tersedia untuk demo.
          </CardContent>
        </Card>
      );
    }

    if (activeTab === 'commissions') {
      return (
        <Card>
          <CardContent className="p-6 text-center text-gray-600">
            Belum ada data komisi tersedia untuk demo.
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600">Manage all users, affiliators, and system data</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'tests', label: 'Tests', icon: Brain },
              { id: 'commissions', label: 'Commissions', icon: DollarSign },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};
