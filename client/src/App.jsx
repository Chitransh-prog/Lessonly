import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Pages
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Hero = lazy(() => import("./pages/Hero"));
const Create = lazy(() => import("./pages/Create"));
const Mindmaps = lazy(() => import("./pages/Mindmaps"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Mindmap_History = lazy(() => import("./pages/Mindmap_History"));
const ViewMindmap = lazy(() => import("./pages/ViewMindmap"));
const History_content = lazy(() => import("./pages/History_content"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const History = lazy(() => import("./pages/History"));

// Loading Component for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-2">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      <p className="text-sm font-medium text-gray-600">Loading...</p>
    </div>
  </div>
);

// Layout Wrapper to keep code DRY
const AppLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" // Switched to light to match standard magazine theme, or use "colored"
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/hero" element={<Hero />} />
              <Route path="/create" element={<Create />} />
              <Route path="/mindmaps" element={<Mindmaps />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mindmaps-history" element={<Mindmap_History />} />
              <Route path="/view/:id" element={<ViewMindmap />} />
              <Route path="/create-history" element={<History_content />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Route>

          {/* 404 Catch-all (Optional but recommended) */}
          <Route path="*" element={<div className="flex h-screen items-center justify-center">404 - Not Found</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
}