import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AlertModal, ConfirmModal } from '../components/Modal';

export default function Orders() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(null);

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showAlert = (message, type = 'info') => setAlertModal({ isOpen: true, message, type });
  const showConfirm = (message, onConfirm) => setConfirmModal({ isOpen: true, message, onConfirm });

  useEffect(() => {
    fetchUser();
    fetchOrders();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders');
    }
    setLoading(false);
  };

  const handleCancelOrder = (orderId) => {
    showConfirm('Are you sure you want to cancel this order?', async () => {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setActionLoading(orderId);
      try {
        const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
        if (res.ok) {
          showAlert('Order cancelled successfully!', 'success');
          fetchOrders();
        } else {
          const data = await res.json();
          showAlert(data.error || 'Failed to cancel order', 'error');
        }
      } catch (err) {
        showAlert('Failed to cancel order', 'error');
      }
      setActionLoading(null);
    });
  };

  const handleReturnOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason || 'Customer requested return' }),
      });
      if (res.ok) {
        showAlert('Return request submitted successfully!', 'success');
        setShowReturnModal(null);
        setReturnReason('');
        fetchOrders();
      } else {
        const data = await res.json();
        showAlert(data.error || 'Failed to submit return request', 'error');
      }
    } catch (err) {
      showAlert('Failed to submit return request', 'error');
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

  const canCancelOrder = (order) => order.status === 'pending';
  const canReturnOrder = (order) => ['processing', 'shipped', 'delivered'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        confirmText="Yes, Cancel Order"
        confirmVariant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">TestShop</Link>
            <div className="flex items-center space-x-4">
              <Link href="/products" className="text-indigo-600 hover:text-indigo-800">Products</Link>
              {user && (
                <>
                  <span className="text-gray-700">Hello, {user.firstName}</span>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">Admin</Link>
                  )}
                  <button
                    onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/'))}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to create your first order!</p>
            <Link href="/products" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Order placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Order ID: {order.id.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items:</h3>
                  <div className="space-y-3">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex items-center space-x-4 pb-3 border-b last:border-b-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded flex items-center justify-center">📦</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2"><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                    <p className="text-sm text-gray-600"><strong>Payment Method:</strong> {order.paymentMethod} ending in {order.cardLast4}</p>
                  </div>
                  {order.refunds && order.refunds.length > 0 && (
                    <div className="mt-4 pt-4 border-t bg-blue-50 -mx-6 -mb-4 px-6 py-4">
                      <h4 className="font-semibold text-sm mb-2">Refund Status:</h4>
                      {order.refunds.map(refund => (
                        <div key={refund.id} className="text-sm">
                          <p>Status: <span className={`font-semibold ${refund.status === 'approved' ? 'text-green-600' : refund.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                          </span></p>
                          <p>Amount: ${refund.amount.toFixed(2)}</p>
                          {refund.reason && <p>Reason: {refund.reason}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={actionLoading === order.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm"
                    >
                      {actionLoading === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  {canReturnOrder(order) && !order.refunds.some(r => r.status !== 'rejected') && (
                    <button
                      onClick={() => setShowReturnModal(order.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                    >
                      Request Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Request Return</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for return (optional):</label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please describe why you want to return this order..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => { setShowReturnModal(null); setReturnReason(''); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => handleReturnOrder(showReturnModal)}
                disabled={actionLoading === showReturnModal}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {actionLoading === showReturnModal ? 'Submitting...' : 'Submit Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}