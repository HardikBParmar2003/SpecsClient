import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPOS from './pages/admin/AdminPOS';
import AdminParties from './pages/admin/AdminParties';
import AdminPartyPurchases from './pages/admin/AdminPartyPurchases';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerOrders from './pages/admin/AdminCustomerOrders';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReminders from './pages/admin/AdminReminders';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminExpenses from './pages/admin/AdminExpenses';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = CapApp.addListener('backButton', ({ canGoBack }) => {
      // If we are on the root or admin dashboard, close the app
      if (location.pathname === '/' || location.pathname === '/admin') {
        CapApp.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      handleBackButton.then(listener => listener.remove()).catch(() => {});
    };
  }, [location, navigate]);

  return (
    <Routes>
      {/* Public Routes with Standard Layout */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
      <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      
      {/* Protected Customer Routes */}
      <Route path="/cart" element={
        <ProtectedRoute>
          <Layout><CartPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes with Admin Layout */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/pos" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminPOS /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/parties" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminParties /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/parties/:id/purchases" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminPartyPurchases /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminOrders /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminCustomers /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/customers/:id/orders" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminCustomerOrders /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reminders" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminReminders /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/revenue" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminRevenue /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/expenses" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminExpenses /></AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
