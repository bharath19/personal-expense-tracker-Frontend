import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/useAuth';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const ExpenseFormPage = lazy(() => import('./pages/ExpenseFormPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Suspense fallback={<div className="page-state">Loading page...</div>}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}

export default App;
