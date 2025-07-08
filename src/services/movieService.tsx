import { createContext, useContext } from 'react';
import axios from 'axios';

interface MovieServiceContextType {
  getMovies: (endpoint: string, params?: Record<string, string>) => Promise<any>;
  getMovieDetails: (movieId: number) => Promise<any>;
  getMovieVideos: (movieId: number) => Promise<any>;
  getMovieProviders: (movieId: number) => Promise<any>;
  getFavorites: () => Promise<any[]>;
  toggleFavorite: (movieId: number) => Promise<void>;
  getWatchHistory: () => Promise<any[]>;
  addToWatchHistory: (movieId: number) => Promise<void>;
  removeFromWatchHistory: (movieId: number) => Promise<void>;
  clearWatchHistory: () => Promise<void>;
}

const MovieServiceContext = createContext<MovieServiceContextType | undefined>(undefined);

export const useMovieService = () => {
  const context = useContext(MovieServiceContext);
  if (context === undefined) {
    throw new Error('useMovieService must be used within a MovieServiceProvider');
  }
  return context;
};

export const MovieServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const API_BASE_URL = 'http://localhost:5000/api';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`
    };
  };

  // Get movies from TMDB API via backend proxy
  const getMovies = async (endpoint: string, params: Record<string, string> = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/${endpoint}`, {
        headers: getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      return { results: [] }; // Return empty results on error
    }
  };

  // Get detailed movie information
  const getMovieDetails = async (movieId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/${movieId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  };

  // Get movie videos (trailers, etc.)
  const getMovieVideos = async (movieId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/${movieId}/videos`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie videos:', error);
      return { results: [] }; // Return empty results on error
    }
  };

  // Get movie providers (where to watch)
  const getMovieProviders = async (movieId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/${movieId}/watch/providers`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie providers:', error);
      return { results: {} }; // Return empty results on error
    }
  };

  // Get user's favorite movies
  const getFavorites = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/favorites`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return []; // Return empty array on error
    }
  };

  // Toggle a movie as favorite/not favorite
  const toggleFavorite = async (movieId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/user/favorites/toggle`, 
        { movieId },
        { headers: getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  // Get user's watch history
  const getWatchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/history`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching watch history:', error);
      return []; // Return empty array on error
    }
  };

  // Add a movie to watch history
  const addToWatchHistory = async (movieId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/user/history/add`, 
        { movieId },
        { headers: getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error adding to watch history:', error);
      throw error;
    }
  };

  // Remove a movie from watch history
  const removeFromWatchHistory = async (movieId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/user/history/${movieId}`, {
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Error removing from watch history:', error);
      throw error;
    }
  };

  // Clear entire watch history
  const clearWatchHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/user/history`, {
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Error clearing watch history:', error);
      throw error;
    }
  };

  const value = {
    getMovies,
    getMovieDetails,
    getMovieVideos,
    getMovieProviders,
    getFavorites,
    toggleFavorite,
    getWatchHistory,
    addToWatchHistory,
    removeFromWatchHistory,
    clearWatchHistory
  };

  return (
    <MovieServiceContext.Provider value={value}>
      {children}
    </MovieServiceContext.Provider>
  );
};