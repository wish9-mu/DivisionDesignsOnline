import { Routes, Route } from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import OrderFormsPage from './pages/OrderFormsPage'
import CustomOrdersPage from './pages/CustomOrdersPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/order-forms" element={<OrderFormsPage />} />
        <Route path="/custom-orders" element={<CustomOrdersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Routes>
    </>
  )
}

export default App
