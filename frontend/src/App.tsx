import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { LandingLayout } from './layouts/LandingLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import PublicRoute from './components/PublicRoute';
import { CognitiveTest } from './pages/Test/CognitiveTest';
import { TestResult } from './pages/Test/TestResult';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import { useAuth } from './hooks/useAuth';
import SuperAdminDashboardLayout from './layouts/super_admin/SuperAdminDashboardLayout';
import Overview from './pages/Admin/AdminOverview';
import ManageUsers from './pages/Admin/ManageUsers';
import ManagePackages from './pages/Admin/ManagePackage';
import ManageVouchers from './pages/Admin/ManageVoucher';
import { AffiliatorDashboard } from './pages/Affiliator/AffiliatorDashboard';
import CustomerDashboardLayout from './layouts/customer/CustomerLayout';
import { UserDashboard } from './pages/User/UserDashboard';
import CustomerChilds from './pages/User/CustomerChilds';
import AffiliatorDashboardLayout from './layouts/affiliator/AffiliatorDashboardLayout';
import AffiliateWithdrawPage from './pages/Affiliator/AffiliateWithdrawPage';
import AdminWithdrawManagement from './pages/Admin/ManageWithdraw';
import ThinkingStylesManagement from './pages/Admin/ManageThinkingStyle';
import ThinkingStyleDetailPage from './pages/Test/ThinkingStyleDetailPage';
import EditDetailThinkingStylePage from './pages/Admin/EditDetailThinkingStylePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: 'user' | 'affiliator' | 'super_admin';
}> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user role to their appropriate dashboard
    switch (user.role) {
      case 'super_admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'affiliator':
        return <Navigate to="/affiliator/dashboard" replace />;
      case 'user':
        return <Navigate to="/customer/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
        {/* Landing layout routes - hanya untuk user yang belum login */}
        <Route path="/" element={
          <PublicRoute>
            <LandingLayout />
          </PublicRoute>
        }>
          <Route index element={<Landing />} />
          <Route path="kontak" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
        </Route>

        {/* Auth - hanya untuk user yang belum login */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Dashboard layout untuk semua role
        <Route element={<DashboardLayout />}>
          <Route
            path="user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="affiliator/dashboard"
            element={
              <ProtectedRoute requiredRole="affiliator">
                <AffiliatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route> */}

           <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <SuperAdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Child routes untuk super admin */}
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="packages" element={<ManagePackages />} />
          <Route path="voucher" element={<ManageVouchers />} />
          <Route path="affiliator" element={<AffiliatorDashboard/>}/>
          <Route path='withdraw' element={<AdminWithdrawManagement/>} />
          <Route path='thinking-style' element={<ThinkingStylesManagement/>} />
          <Route path='thinking-style/edit/:id' element={<EditDetailThinkingStylePage/>} />
        </Route>

        <Route
          path="/customer/dashboard/*"
          element={
            <ProtectedRoute requiredRole="user">
              <CustomerDashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Child routes untuk customer */}
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<UserDashboard />} />
          <Route path="users" element={<CustomerChilds />} />
         
        {/* Test */}
        <Route path="test" element={<CognitiveTest />} />
        <Route path="test/result" element={<TestResult />} />
       
        </Route>

        <Route path='affiliator/dashboard/*' element={
          <ProtectedRoute requiredRole='affiliator'>
            <AffiliatorDashboardLayout/>
          </ProtectedRoute>
        }>
           <Route index element={<Navigate to="overview" replace />} />
           <Route path='overview' element={<AffiliatorDashboard/>}/>
           <Route path='withdraw' element={<AffiliateWithdrawPage/>} />
        </Route>

        <Route path="/thinking-style/:id" element={<ThinkingStyleDetailPage />} />

    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
