import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    pendingRefunds: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchStats();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') {
          router.push('/');
        } else {
          setUser(data.user);
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes, refundsRes] = await Promise.all([
        fetch('/api/admin/users?limit=1'),
        fetch('/api/admin/products?limit=1'),
        fetch('/api/admin/orders?limit=1'),
        fetch('/api/admin/refunds?status=pending&limit=1'),
      ]);

      const [usersData, productsData, ordersData, refundsData] = await Promise.all([
        usersRes.json(),
        productsRes.json(),
        ordersRes.json(),
        refundsRes.json(),
      ]);

      setStats({
        users: usersData.pagination?.total || 0,
        products: productsData.pagination?.total || 0,
        orders: ordersData.pagination?.total || 0,
        pendingRefunds: refundsData.pagination?.total || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats');
    }
    setLoading(false);
  };

  const dashboardCards = [
    {
      title: 'Users',
      value: stats.users,
      icon: '👥',
      link: '/admin/users',
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Products',
      value: stats.products,
      icon: '📦',
      link: '/admin/products',
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'Orders',
      value: stats.orders,
      icon: '🛒',
      link: '/admin/orders',
      color: 'from-purple-400 to-purple-600',
    },
    {
      title: 'Pending Refunds',
      value: stats.pendingRefunds,
      icon: '💰',
      link: '/admin/refunds',
      color: 'from-orange-400 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              TestShop Admin
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/products" className="text-indigo-600 hover:text-indigo-800">
                Shop
              </Link>
              {user && (
                <>
                  <span className="text-gray-700">Hello, {user.firstName}</span>
                  <button
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' })
                        .then(() => router.push('/'));
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">Loading dashboard...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardCards.map((card, idx) => (
                <Link
                  key={idx}
                  href={card.link}
                  className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`bg-gradient-to-br ${card.color} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">{card.title}</p>
                        <p className="text-3xl font-bold mt-2">{card.value}</p>
                      </div>
                      <div className="text-5xl opacity-75">{card.icon}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/admin/products"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                >
                  <span className="text-3xl mr-3">➕</span>
                  <div>
                    <p className="font-semibold">Add Product</p>
                    <p className="text-sm text-gray-600">Create new product</p>
                  </div>
                </Link>
                <Link
                  href="/admin/categories"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                >
                  <span className="text-3xl mr-3">🏷️</span>
                  <div>
                    <p className="font-semibold">Manage Categories</p>
                    <p className="text-sm text-gray-600">Add or edit categories</p>
                  </div>
                </Link>
                <Link
                  href="/admin/refunds"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                >
                  <span className="text-3xl mr-3">✅</span>
                  <div>
                    <p className="font-semibold">Process Refunds</p>
                    <p className="text-sm text-gray-600">Review refund requests</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">User Management</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/admin/users" className="text-indigo-600 hover:text-indigo-800">
                      → View All Users
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/users?isBlocked=true" className="text-indigo-600 hover:text-indigo-800">
                      → Blocked Users
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Order Management</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/admin/orders?status=pending" className="text-indigo-600 hover:text-indigo-800">
                      → Pending Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800">
                      → All Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/refunds" className="text-indigo-600 hover:text-indigo-800">
                      → Refund Requests
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Product Management</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/admin/products" className="text-indigo-600 hover:text-indigo-800">
                      → All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/categories" className="text-indigo-600 hover:text-indigo-800">
                      → Categories
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">System Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Total Users: {stats.users}</p>
                  <p>• Total Products: {stats.products}</p>
                  <p>• Total Orders: {stats.orders}</p>
                  <p>• Pending Refunds: {stats.pendingRefunds}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
