import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import BookDetail from "./pages/BookDetail";
import BookCreate from "./pages/BookCreate";
import BookEdit from "./pages/BookEdit";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Admin from "./pages/Admin";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book/create" element={<BookCreate />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/book/:id/edit" element={<BookEdit />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="*" element={<h1>Page Not Found</h1>} /> {/* fallback */}
      </Routes>
    </BrowserRouter>
  );
}