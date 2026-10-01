import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components/layout/Layout';

// Customer Pages
import { Home } from './pages/customer/Home';
import { Restaurants } from './pages/customer/Restaurants';
import { RestaurantDetails } from './pages/customer/RestaurantDetails';
import { SearchFood } from './pages/customer/SearchFood';
import { CartPage } from './pages/customer/CartPage';
import { Checkout } from './pages/customer/Checkout';
import { MyOrders } from './pages/customer/MyOrders';
import { OrderTracking } from './pages/customer/OrderTracking';
import { RewardsHub } from './pages/customer/RewardsHub';
import { InvoiceViewer } from './pages/customer/InvoiceViewer';
import { Support } from './pages/customer/Support';
import { Profile } from './pages/customer/Profile';
import { QRTableScan } from './pages/customer/QRTableScan';

// Partner / Restaurant Hub
import { ResHub } from './pages/partner/ResHub';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ManagerLogin } from './pages/auth/ManagerLogin';

// Staff & Admin Dashboards
import { WaiterDashboard } from './pages/waiter/WaiterDashboard';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <Routes>
              {/* Public & Customer Routes Wrapped in Main App Layout */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/home" element={<Layout><Home /></Layout>} />
              <Route path="/restaurants" element={<Layout><Restaurants /></Layout>} />
              <Route path="/restaurants/:id" element={<Layout><RestaurantDetails /></Layout>} />
              <Route path="/search" element={<Layout><SearchFood /></Layout>} />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />
              <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
              <Route path="/orders" element={<Layout><MyOrders /></Layout>} />
              <Route path="/orders/:id" element={<Layout><OrderTracking /></Layout>} />
              <Route path="/tracking/:id" element={<Layout><OrderTracking /></Layout>} />
              <Route path="/rewards" element={<Layout><RewardsHub /></Layout>} />
              <Route path="/rewards/:id" element={<Layout><RewardsHub /></Layout>} />
              <Route path="/invoices/:id" element={<Layout><InvoiceViewer /></Layout>} />
              <Route path="/invoices/:orderId" element={<Layout><InvoiceViewer /></Layout>} />
              <Route path="/invoice/:id" element={<Layout><InvoiceViewer /></Layout>} />
              <Route path="/invoice/:orderId" element={<Layout><InvoiceViewer /></Layout>} />
              <Route path="/support" element={<Layout><Support /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/scan/:restaurantId/:tableNumber" element={<Layout><QRTableScan /></Layout>} />

              {/* Restaurant Hub (Res Hub) for Partners & Managers */}
              <Route path="/reshub" element={<Layout><ResHub /></Layout>} />
              <Route path="/res-hub" element={<Layout><ResHub /></Layout>} />
              <Route path="/restaurant-hub" element={<Layout><ResHub /></Layout>} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />
              <Route path="/manager/login" element={<ManagerLogin />} />

              {/* Dedicated Operational Role Dashboards */}
              <Route path="/waiter" element={<WaiterDashboard />} />
              <Route path="/waiter/dashboard" element={<WaiterDashboard />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/delivery" element={<DeliveryDashboard />} />
              <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
