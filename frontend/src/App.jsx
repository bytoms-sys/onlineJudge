import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './pages/auth/ProtectedRoute';
import ContestList from "./pages/contest/ContestList";
import ContestDetail from "./pages/contest/ContestDetail";
import ContestForm from "./pages/admin/ContestForm";
import ContestLeaderboard from "./pages/contest/ContestLeaderboard";
import AdminProblemCreate from './pages/admin/AdminProblemCreate';
import AdminProblemEdit from './pages/admin/AdminProblemEdit';
import AdminSubmissions from './pages/admin/AdminSubmissions';

// Eager load critical pages
import Home from './pages/Home';

// Lazy load non-critical pages for better performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Placeholder pages (can be replaced with actual components later)
const Problems = lazy(() => import('./pages/problems/Problems'));
const ProblemDetail = lazy(() => import('./pages/problems/ProblemDetail')); // Add this new import
const Submissions = lazy(() => import('./pages/submissions/Submissions'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Leaderboard = lazy(() => import('./pages/leaderboard/Leaderboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// Placeholder loader component
const PageLoader = () => (
  <div className="flex justify-center items-center h-[60vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

// Error boundary fallback
const ErrorFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
    <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
    <p className="text-gray-600 mb-6">We're sorry, but there was an error loading this page.</p>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
    >
      Reload Page
    </button>
  </div>
);

// Placeholder component for routes that aren't built yet
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    <p className="text-gray-600">This feature is coming soon!</p>
  </div>
);

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Short delay for smoother transitions
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contests" element={<ContestList />} />
                <Route path="/contests/:id" element={<ContestDetail />} />
                <Route path="/contests/:id/leaderboard" element={<ContestLeaderboard />} />
                <Route path="/contests/:contestId/problems/:problemCode" element={<ProblemDetail />} />
                
                {/* Protected routes - require authentication */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/problems" element={<Problems />} />
                  <Route path="/problems/:problemCode" element={<ProblemDetail />} /> {/* Add this new route */}
                  <Route path="/submissions" element={<Submissions />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/admin/contests/create" element={<ContestForm />} />
                  //<Route path="/contests/:contestId/problems/:problemCode" element={<ProblemDetail />} />
                  <Route path="/admin/contests/edit/:id" element={<ContestForm editMode={true} />} />
                </Route>
                
                {/* Admin routes - require admin role */}
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/problems/create" element={<AdminProblemCreate />} />
                  <Route path="/admin/problems/edit/:problemCode" element={<AdminProblemEdit />} />
                  <Route path="/admin/submissions" element={<AdminSubmissions />} />
                </Route>
                
                {/* Error routes */}
                <Route path="/error" element={<ErrorFallback />} />
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;