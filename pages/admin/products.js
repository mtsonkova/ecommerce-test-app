import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AlertModal, ConfirmModal } from '../../components/Modal';

export default function AdminProducts() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', discount: '0' });

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showAlert = (message, type = 'info') => setAlertModal({ isOpen: true, message, type });
  const showConfirm = (message, onConfirm) => setConfirmModal({ isOpen: true, message, onConfirm });

  useEffect(() => { fetchUser(); fetchCategories(); fetchProducts(); }, [categoryFilter, search]);

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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) { console.error('Failed to fetch categories'); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/products?limit=100';
      if (categoryFilter) url += `&categoryId=${categoryFilter}`;
      if (search) url += `&search=${search}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products);
    } catch (err) { console.error('Failed to fetch products'); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock), discount: parseFloat(formData.discount) }),
      });
      if (res.ok) {
        showAlert(editingProduct ? 'Product updated!' : 'Product created!', 'success');
        setShowModal(false);
        resetForm();
        fetchProducts();
      } else {
        const data = await res.json();
        showAlert(data.error || 'Failed to save product', 'error');
      }
    } catch (err) {
      showAlert('Failed to save product', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, description: product.description || '', price: product.price.toString(), stock: product.stock.toString(), categoryId: product.categoryId, discount: product.discount.toString() });
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    showConfirm('Are you sure you want to delete this product?', async () => {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      try {
        const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
        if (res.ok) {
          showAlert('Product deleted!', 'success');
          fetchProducts();
        } else {
          const data = await res.json();
          showAlert(data.error || 'Failed to delete product', 'error');
        }
      } catch (err) {
        showAlert('Failed to delete product', 'error');
      }
    });
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', discount: '0' });
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))} />
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} confirmText="Delete" confirmVariant="danger" onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="text-2xl font-bold text-indigo-600">TestShop Admin</Link>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">Dashboard</Link>
              <Link href="/admin/categories" className="text-indigo-600 hover:text-indigo-800">Categories</Link>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-semibold">+ Add Product</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input type="text" placeholder="Search products..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">No products found</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}>{product.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.discount > 0 ? <span className="text-red-600 font-semibold">{product.discount}%</span> : <span className="text-gray-500">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" step="0.01" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input type="number" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}