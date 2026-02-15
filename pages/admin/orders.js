import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminOrders() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    fetchUser();
    fetchOrders();
  }, [statusFilter, paymentFilter]);

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/orders?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      if (paymentFilter) url += `&paymentStatus=${paymentFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders');
    }
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`Are you sure you want to change this order status to "${newStatus}"?`)) return;

    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert('Order status updated successfully!');
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      alert('Failed to update order status');
    }
    setActionLoading(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="text-2xl font-bold text-indigo-600">
              TestShop Admin
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-indigo-600 hover:text-indigo-800">
                Users
              </Link>
              <Link href="/admin/products" className="text-indigo-600 hover:text-indigo-800">
                Products
              </Link>
              <Link href="/admin/refunds" className="text-indigo-600 hover:text-indigo-800">
                Refunds
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            No orders found
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Customer: {order.user.firstName} {order.user.lastName} ({order.user.email})</p>
                        <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
                        <p>Total: ${order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-2">Change Status:</p>
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={actionLoading === order.id}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items:</h4>
                  <div className="space-y-3">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded flex items-center justify-center">
                            📦
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Shipping Address:</p>
                      <p className="text-gray-600">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Payment Info:</p>
                      <p className="text-gray-600">
                        {order.paymentMethod} ending in {order.cardLast4}
                      </p>
                      <p className="text-gray-600">
                        Status: {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refunds Info */}
                {order.refunds && order.refunds.length > 0 && (
                  <div className="px-6 py-4 bg-yellow-50 border-t">
                    <h4 className="font-semibold text-gray-900 mb-2">Refund Requests:</h4>
                    {order.refunds.map(refund => (
                      <div key={refund.id} className="text-sm space-y-1">
                        <p>
                          Status: <span className={`font-semibold ${
                            refund.status === 'approved' ? 'text-green-600' : 
                            refund.status === 'rejected' ? 'text-red-600' : 
                            'text-yellow-600'
                          }`}>
                            {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                          </span>
                        </p>
                        <p>Amount: ${refund.amount.toFixed(2)}</p>
                        {refund.reason && <p>Reason: {refund.reason}</p>}
                        <p>Requested: {new Date(refund.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
