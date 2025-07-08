import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { useMovieService } from '../../services/movieService';

interface MovieGridProps {
  title: string;
  endpoint: string;
  params?: Record<string, string>;
}

const MovieGrid: React.FC<MovieGridProps> = ({ title, endpoint, params = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getMovies, getFavorites, toggleFavorite } = useMovieService();
  const [movies, setMovies] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMovies(endpoint, params);
        setMovies(data.results || []);
        
        // Get user favorites
        const userFavorites = await getFavorites();
        setFavorites(userFavorites.map((fav: any) => fav.movieId));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch movies');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, [endpoint, JSON.stringify(params)]);
  
  const handleToggleFavorite = async (movieId: number) => {
    try {
      await toggleFavorite(movieId);
      
      // Update local favorites state
      if (favorites.includes(movieId)) {
        setFavorites(favorites.filter(id => id !== movieId));
      } else {
        setFavorites([...favorites, movieId]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="bg-error-700/20 border border-error-700 text-white p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (movies.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="bg-neutral-800 text-neutral-400 p-4 rounded-md">
          No movies found.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            releaseDate={movie.release_date}
            voteAverage={movie.vote_average}
            isFavorite={favorites.includes(movie.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieGrid;