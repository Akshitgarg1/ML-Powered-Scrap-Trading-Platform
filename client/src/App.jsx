import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import PricePredictionPage from "./pages/PricePredictor";
import ImageSearchPage from './pages/ImageSearchPage';
import BrowseProducts from './pages/BrowseProducts';
import SellProduct from './pages/SellProduct';
import ProductDetails from "./pages/ProductDetails";
import LogoVerifierPage from "./pages/LogoVerifier";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseProducts />} />
          <Route path="/sell" element={<SellProduct />} />
          <Route path="/price-predictor" element={<PricePredictionPage />} />
          <Route path="/image-search" element={<ImageSearchPage />} />
          <Route path="/logo-verifier" element={<LogoVerifierPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;