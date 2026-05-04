import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/"                       element={<Dashboard />} />
            <Route path="/products"               element={<Products />} />
            <Route path="/products/:productId"    element={<ProductDetail />} />
            <Route path="/history"                element={<History />} />
            <Route path="/settings"               element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
