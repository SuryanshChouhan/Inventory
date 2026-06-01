import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<ProductsPage />} />
          <Route path="/products" element={<Navigate to="/inventory" replace />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
