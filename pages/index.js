import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">TestShop</h1>
            </div>
            <div className="flex items-center space-x-4">
              {loading ? (
                <span className="text-gray-500">Loading...</span>
              ) : user ? (
                <>
                  <span className="text-gray-700">Hello, {user.firstName}</span>
                  <Link href="/products" className="text-indigo-600 hover:text-indigo-800">
                    Products
                  </Link>
                  <Link href="/orders" className="text-indigo-600 hover:text-indigo-800">
                    Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' })
                        .then(() => window.location.reload());
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
                    Login
                  </Link>
                  <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welcome to TestShop
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            E-commerce Testing Platform
          </p>
          <p className="mt-2 text-lg text-gray-500">
            Perfect for practicing UI, API, Performance, and Database Testing
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🛍️ Full E-commerce Features
              </h3>
              <p className="text-gray-600">
                Product catalog, shopping cart, orders, and payments
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💳 Fake Payment System
              </h3>
              <p className="text-gray-600">
                Test with fake credit cards - no real transactions
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔧 Admin Dashboard
              </h3>
              <p className="text-gray-600">
                Manage users, products, orders, and refunds
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 REST API
              </h3>
              <p className="text-gray-600">
                All endpoints exposed for API testing
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🗄️ PostgreSQL Database
              </h3>
              <p className="text-gray-600">
                Direct database access for SQL testing
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎭 Multi-User Support
              </h3>
              <p className="text-gray-600">
                Client and admin roles with different permissions
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href={user ? "/products" : "/register"}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {user ? "Browse Products" : "Get Started"}
            </Link>
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Test Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Admin User:</h4>
                <p className="text-gray-600">Email: admin@test.com</p>
                <p className="text-gray-600">Password: admin123</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Client User:</h4>
                <p className="text-gray-600">Email: client1@test.com</p>
                <p className="text-gray-600">Password: client123</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Test Credit Cards:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✅ Success: 4532015112830366 (CVV: 123, Exp: 12/2025)</p>
                <p>❌ Declined: 4000000000000002 (CVV: 789, Exp: 03/2025)</p>
                <p>💰 Insufficient Funds: 4000000000009995 (CVV: 321, Exp: 09/2025)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            TestShop - E-commerce Testing Platform | Built for Test Automation Practice
          </p>
        </div>
      </footer>
    </div>
  );
}
