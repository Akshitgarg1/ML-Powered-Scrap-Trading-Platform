import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import LiveActivity from "./components/common/LiveActivity";
import Footer from "./components/common/Footer";
import BackToTop from "./components/common/BackToTop";
import "./config/firebase";


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-slate-950">
            <Navbar />
            <LiveActivity />
            <div className="animate-fade-in flex-grow">
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
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
            <Footer />
            <BackToTop />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;