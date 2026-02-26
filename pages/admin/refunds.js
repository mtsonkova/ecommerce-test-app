import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AlertModal, ConfirmModal } from '../../components/Modal';

export default function AdminRefunds() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null, confirmText: 'Confirm', confirmVariant: 'primary' });

  const showAlert = (message, type = 'info') => setAlertModal({ isOpen: true, message, type });
  const showConfirm = (message, onConfirm, confirmText = 'Confirm', confirmVariant = 'primary') =>
    setConfirmModal({ isOpen: true, message, onConfirm, confirmText, confirmVariant });

  useEffect(() => { fetchUser(); fetchRefunds(); }, [statusFilter]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') router.push('/');
        else setUser(data.user);
      } else router.push('/login');
    } catch (err) { router.push('/login'); }
  };

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/refunds?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setRefunds(data.refunds);
    } catch (err) { console.error('Failed to fetch refunds'); }
    setLoading(false);
  };

  const handleProcessRefund = (refundId, action) => {
    const actionText = action === 'approved' ? 'approve' : 'reject';
    const variant = action === 'approved' ? 'primary' : 'danger';
    showConfirm(
      `Are you sure you want to ${actionText} this refund request?`,
      async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setActionLoading(refundId);
        try {
          const res = await fetch(`/api/admin/refunds/${refundId}/process`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action }),
          });
          if (res.ok) {
            showAlert(`Refund ${action} successfully!`, 'success');
            fetchRefunds();
          } else {
            const data = await res.json();
            showAlert(data.error || `Failed to ${actionText} refund`, 'error');
          }
        } catch (err) {
          showAlert(`Failed to ${actionText} refund`, 'error');
        }
        setActionLoading(null);
      },
      actionText.charAt(0).toUpperCase() + actionText.slice(1),
      variant
    );
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))} />
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} confirmText={confirmModal.confirmText} confirmVariant={confirmModal.confirmVariant} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="text-2xl font-bold text-indigo-600">TestShop Admin</Link>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">Dashboard</Link>
              <Link href="/admin/users" className="text-indigo-600 hover:text-indigo-800">Users</Link>
              <Link href="/admin/products" className="text-indigo-600 hover:text-indigo-800">Products</Link>
              <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800">Orders</Link>
              {user && (
                <>
                  <span className="text-gray-700">Hello, {user.firstName}</span>
                  <button onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/'))} className="text-red-600 hover:text-red-800">Logout</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Management</h1>
          <p className="text-gray-600">Review and process customer refund requests</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Refund Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading refunds...</div>
        ) : refunds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No refund requests</h2>
            <p className="text-gray-500">{statusFilter === 'pending' ? 'All refund requests have been processed!' : `No ${statusFilter} refund requests found`}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {refunds.map(refund => (
              <div key={refund.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Refund Request #{refund.id.slice(0, 8)}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>{refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Customer: {refund.order.user.firstName} {refund.order.user.lastName} ({refund.order.user.email})</p>
                        <p>Requested: {new Date(refund.createdAt).toLocaleString()}</p>
                        <p className="font-semibold text-gray-900">Refund Amount: ${refund.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    {refund.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleProcessRefund(refund.id, 'approved')} disabled={actionLoading === refund.id} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm">
                          {actionLoading === refund.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button onClick={() => handleProcessRefund(refund.id, 'rejected')} disabled={actionLoading === refund.id} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {refund.reason && (
                  <div className="px-6 py-4 bg-blue-50 border-b">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Reason for Return:</p>
                    <p className="text-sm text-gray-600">{refund.reason}</p>
                  </div>
                )}

                <div className="px-6 py-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Details:</h4>
                  <div className="text-sm text-gray-600 space-y-2 mb-4">
                    <p>Order ID: {refund.order.id.slice(0, 8)}...</p>
                    <p>Order Date: {new Date(refund.order.createdAt).toLocaleString()}</p>
                    <p>Order Status: <span className="font-medium">{refund.order.status}</span></p>
                    <p>Payment Status: <span className="font-medium">{refund.order.paymentStatus}</span></p>
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm">Order Items:</h5>
                  <div className="space-y-3">
                    {refund.order.orderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded flex items-center justify-center text-2xl">📦</div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Shipping Address:</p>
                  <p className="text-sm text-gray-600">{refund.order.shippingAddress}</p>
                </div>

                {refund.status !== 'pending' && (
                  <div className={`px-6 py-3 border-t ${refund.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm">
                      {refund.status === 'approved' ? '✅ Refund approved and processed. Customer will receive funds within 3-5 business days.' : '❌ Refund request has been rejected.'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Processed: {new Date(refund.updatedAt).toLocaleString()}</p>
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