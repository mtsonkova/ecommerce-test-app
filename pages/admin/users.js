import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AlertModal, ConfirmModal } from '../../components/Modal';

export default function AdminUsers() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showAlert = (message, type = 'info') => setAlertModal({ isOpen: true, message, type });
  const showConfirm = (message, onConfirm) => setConfirmModal({ isOpen: true, message, onConfirm });

  useEffect(() => { fetchUser(); fetchUsers(); }, [search, roleFilter, blockedFilter]);

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/users?limit=50';
      if (search) url += `&search=${search}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (blockedFilter) url += `&isBlocked=${blockedFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users);
    } catch (err) { console.error('Failed to fetch users'); }
    setLoading(false);
  };

  const handleBlockToggle = (userId, currentlyBlocked) => {
    const action = currentlyBlocked ? 'unblock' : 'block';
    showConfirm(`Are you sure you want to ${action} this user?`, async () => {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setActionLoading(userId);
      try {
        const res = await fetch(`/api/admin/users/${userId}/block`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isBlocked: !currentlyBlocked }),
        });
        if (res.ok) {
          showAlert(`User ${action}ed successfully!`, 'success');
          fetchUsers();
        } else {
          const data = await res.json();
          showAlert(data.error || `Failed to ${action} user`, 'error');
        }
      } catch (err) {
        showAlert(`Failed to ${action} user`, 'error');
      }
      setActionLoading(null);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))} />
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} confirmText="Confirm" confirmVariant="warning" onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="text-2xl font-bold text-indigo-600">TestShop Admin</Link>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">Dashboard</Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input type="text" placeholder="Search by name or email..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={blockedFilter} onChange={(e) => setBlockedFilter(e.target.value)}>
                <option value="">All Users</option>
                <option value="false">Active</option>
                <option value="true">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">No users found</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className={u.isBlocked ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u._count.orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.isBlocked
                        ? <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Blocked</span>
                        : <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleBlockToggle(u.id, u.isBlocked)}
                          disabled={actionLoading === u.id}
                          className={`px-3 py-1 rounded-md text-white ${u.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:bg-gray-400`}
                        >
                          {actionLoading === u.id ? 'Processing...' : u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}