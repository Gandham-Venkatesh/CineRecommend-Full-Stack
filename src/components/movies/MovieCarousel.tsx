import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { useMovieService } from '../../services/movieService';

interface MovieCarouselProps {
  title: string;
  endpoint: string;
  params?: Record<string, string>;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ title, endpoint, params = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getMovies, getFavorites, toggleFavorite } = useMovieService();
  const [movies, setMovies] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
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
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 animate-pulse">
              <div className="bg-neutral-800 rounded-md aspect-[2/3]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4 py-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="bg-error-700/20 border border-error-700 text-white p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (movies.length === 0) {
    return (
      <div className="space-y-4 py-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="bg-neutral-800 text-neutral-400 p-4 rounded-md">
          No movies found.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex space-x-2">
          <button 
            onClick={scrollLeft}
            className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={scrollRight}
            className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef} 
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
      >
        {movies.map(movie => (
          <div key={movie.id} className="flex-shrink-0 w-40">
            <MovieCard
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              releaseDate={movie.release_date}
              voteAverage={movie.vote_average}
              isFavorite={favorites.includes(movie.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieCarousel;