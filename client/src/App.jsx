import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import ItemForm from './pages/ItemForm';
import ItemUpload from './pages/ItemUpload';
import Listings from './pages/Listings';
import Loader from './components/Loader';
import { Login, Register } from './pages/Auth';
import './App.css';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader/>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const [flaggedCount, setFlaggedCount] = useState(0);

  return (
    <>
      <Navbar flaggedCount={flaggedCount} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/items" element={<RequireAuth><Items /></RequireAuth>} />
        <Route path="/items/new" element={<RequireAuth><ItemUpload /></RequireAuth>} />
        <Route path="/items/blank" element={<RequireAuth><ItemForm /></RequireAuth>} />
        <Route path="/items/:id" element={<RequireAuth><ItemDetail /></RequireAuth>} />
        <Route path="/items/:id/edit" element={<RequireAuth><ItemForm /></RequireAuth>} />
        <Route
          path="/listings"
          element={
            <RequireAuth>
              <Listings onFlaggedCountChange={setFlaggedCount} />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
