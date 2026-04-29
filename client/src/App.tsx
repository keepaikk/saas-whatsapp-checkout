import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './pages/Storefront';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/business/:slug" element={<Storefront />} />
        <Route path="/" element={<Navigate to="/admin" />} />
        <Route path="*" element={<div className="p-12 text-center">Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
