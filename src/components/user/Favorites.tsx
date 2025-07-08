import { useState, useEffect } from 'react';
import MovieCard from '../movies/MovieCard';
import { useMovieService } from '../../services/movieService';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getFavorites, toggleFavorite } = useMovieService();
  
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFavorites();
        setFavorites(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch favorites');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, []);
  
  const handleToggleFavorite = async (movieId: number) => {
    try {
      await toggleFavorite(movieId);
      setFavorites(favorites.filter(movie => movie.movieId !== movieId));
    } catch (err: any) {
      console.error('Failed to remove from favorites:', err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="pt-16">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-neutral-800 rounded-md aspect-[2/3]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="pt-16">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        <div className="bg-error-700/20 border border-error-700 text-white p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (favorites.length === 0) {
    return (
      <div className="pt-16">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        <div className="bg-neutral-800 p-8 rounded-lg text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-neutral-600" />
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-neutral-400 mb-6">
            Movies you add to your favorites will appear here.
          </p>
          <a 
            href="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-md transition-colors"
          >
            Discover Movies
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-16">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favorites.map(movie => (
          <MovieCard
            key={movie.movieId}
            id={movie.movieId}
            title={movie.title}
            posterPath={movie.posterPath}
            releaseDate={movie.releaseDate}
            voteAverage={movie.voteAverage}
            isFavorite={true}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;