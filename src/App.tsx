import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MovieServiceProvider } from './services/movieService';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/pages/Home';
import MovieDetails from './components/movies/MovieDetails';
import Profile from './components/user/Profile';
import Favorites from './components/user/Favorites';
import WatchHistory from './components/user/WatchHistory';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="animate-pulse text-primary-600 text-3xl font-bold">
          CineRecommend
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <MovieServiceProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="movie/:id" element={<MovieDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="history" element={<WatchHistory />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MovieServiceProvider>
    </AuthProvider>
  );
};

export default App;