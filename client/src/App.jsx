import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Mindmaps from './pages/Mindmaps';
import Contact from './pages/Contact';
import Create from './pages/Create';
import About from './pages/About';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Hero from './pages/Hero';

export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<ProtectedRoute />}>
          
          <Route
            element={
              <>
                <Navbar />
                <div className="min-h-screen">
                  <Outlet />
                </div>
                <Footer />
              </>
            }
          >
            <Route path="/hero" element={<Hero />} />
            <Route path="/create" element={<Create />} />
            <Route path="/mindmaps" element={<Mindmaps />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
