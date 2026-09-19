import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";

import MainLayout from "./layouts/MainLayout";
import HostLayout from "./layouts/HostLayout";
import AdminLayout from "./layouts/AdminLayout";

import ProtectedRoute from "./routes/ProtectedRoute";
import HostRoute from "./routes/HostRoute";
import AdminRoute from "./routes/AdminRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import BecomeHost from "./pages/BecomeHost";
import BookingPage from "./pages/BookingPage";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import HostDashboard from "./pages/host/HostDashboard";
import HostProperties from "./pages/host/HostProperties";
import AddProperty from "./pages/host/AddProperty";
import EditProperty from "./pages/host/EditProperty";
import HostBookings from "./pages/host/HostBookings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminBookings from "./pages/admin/AdminBookings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/become-host" element={<BecomeHost />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/checkout/:propertyId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              <Route path="/host" element={<HostRoute><HostLayout /></HostRoute>}>
                <Route path="dashboard" element={<HostDashboard />} />
                <Route path="properties" element={<HostProperties />} />
                <Route path="properties/new" element={<AddProperty />} />
                <Route path="properties/:id/edit" element={<EditProperty />} />
                <Route path="bookings" element={<HostBookings />} />
              </Route>

              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="bookings" element={<AdminBookings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
