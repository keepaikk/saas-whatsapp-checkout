import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './pages/Storefront';
import AdminLayout from './pages/AdminLayout';
import AdminBusinesses from './pages/AdminBusinesses';
import AdminBusinessForm from './pages/AdminBusinessForm';
import AdminMenus from './pages/AdminMenus';
import AdminOrders from './pages/AdminOrders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/business/:slug" element={<Storefront />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="businesses" />} />
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="businesses/new" element={<AdminBusinessForm />} />
          <Route path="businesses/:id" element={<AdminBusinessForm />} />
          <Route path="businesses/:id/menus" element={<AdminMenus />} />
          <Route path="businesses/:id/orders" element={<AdminOrders />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin" />} />
        <Route path="*" element={<div className="p-12 text-center">Not found.</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
