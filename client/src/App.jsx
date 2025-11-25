import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Suspense, lazy } from "react";

// Lazy pages
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Mindmaps = lazy(() => import("./pages/Mindmaps"));
const Contact = lazy(() => import("./pages/Contact"));
const Create = lazy(() => import("./pages/Create"));
const About = lazy(() => import("./pages/About"));
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Hero = lazy(() => import("./pages/Hero"));
const Mindmap_History = lazy(() => import("./pages/Mindmap_History"));
const History_content = lazy(() => import("./pages/History_content"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const History = lazy(() => import("./pages/History"));
const ViewMindmap = lazy(() => import("./pages/ViewMindmap"));

export default function App() {
  return (
    <Router>
      {/* 👇 WRAP ALL ROUTES IN Suspense */}
      <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
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

              {/* Non-nested pages */}
              <Route path="/mindmaps-history" element={<Mindmap_History />} />
              <Route path="/view/:id" element={<ViewMindmap />} />
              <Route path="/create-history" element={<History_content />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
