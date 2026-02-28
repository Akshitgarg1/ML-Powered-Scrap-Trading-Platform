import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import PricePredictionPage from "./pages/PricePredictor";
import ImageSearchPage from './pages/ImageSearchPage';
import BrowseProducts from './pages/BrowseProducts';
import SellProduct from './pages/SellProduct';
import ProductDetails from "./pages/ProductDetails";
import TransactionDashboard from "./pages/TransactionDashboard";
import Wishlist from "./pages/Wishlist";
import LogoVerifierPage from "./pages/LogoVerifier";
import LiveActivity from "./components/common/LiveActivity";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950">
          <Navbar />
          <LiveActivity />
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowseProducts />} />
              <Route path="/sell" element={<SellProduct />} />
              <Route path="/price-predictor" element={<PricePredictionPage />} />
              <Route path="/image-search" element={<ImageSearchPage />} />
              <Route path="/logo-verifier" element={<LogoVerifierPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/escrow/:escrowId" element={<TransactionDashboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;