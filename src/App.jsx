import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderFormsPage from "./pages/OrderFormsPage";
import CustomOrdersPage from "./pages/CustomOrdersPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import PurchasesPage from "./pages/PurchasesPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AdminPage from "./pages/AdminPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import { CartProvider } from "./context/CartContext";
import PolicyPage from "./pages/PolicyPage";
import {
  refundPolicy,
  privacyPolicy,
  termsOfService,
  contactInfo,
} from "./data/policies";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/order-forms" element={<OrderFormsPage />} />
        <Route path="/custom-orders" element={<CustomOrdersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <PurchasesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/refund-policy"
          element={<PolicyPage data={refundPolicy} />}
        />
        <Route
          path="/privacy-policy"
          element={<PolicyPage data={privacyPolicy} />}
        />
        <Route
          path="/terms-of-service"
          element={<PolicyPage data={termsOfService} />}
        />
        <Route
          path="/contact"
          element={<PolicyPage data={contactInfo} type="contact" />}
        />
      </Routes>
    </>
  );
}
export default App;
