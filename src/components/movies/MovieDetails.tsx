import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart, Clock, Star, Calendar, Globe, X } from 'lucide-react';
import YouTube from 'react-youtube';
import { useMovieService } from '../../services/movieService';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0');
  const navigate = useNavigate();
  const { getMovieDetails, getMovieVideos, getMovieProviders, toggleFavorite, addToWatchHistory, getFavorites } = useMovieService();
  
  const [movie, setMovie] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [providers, setProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) {
        navigate('/');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Track view in watch history
        await addToWatchHistory(movieId);
        
        // Get movie details
        const movieData = await getMovieDetails(movieId);
        setMovie(movieData);
        
        // Get movie videos (trailers)
        const videosData = await getMovieVideos(movieId);
        setVideos(videosData.results || []);
        
        // Get movie providers (where to watch)
        const providersData = await getMovieProviders(movieId);
        setProviders(providersData.results?.US || null);
        
        // Check if movie is in favorites
        const favorites = await getFavorites();
        setIsFavorite(favorites.some((fav: any) => fav.movieId === movieId));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch movie details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, [movieId]);
  
  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(movieId);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };
  
  const handleWatchTrailer = () => {
    setShowTrailer(true);
  };
  
  const trailer = videos.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  ) || videos.find(video => video.site === 'YouTube');
  
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (isLoading) {
    return (
      <div className="pt-16 animate-pulse space-y-8">
        <div className="h-96 bg-neutral-800 rounded-lg"></div>
        <div className="space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
          <div className="h-32 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !movie) {
    return (
      <div className="pt-16">
        <div className="bg-error-700/20 border border-error-700 text-white p-4 rounded-md">
          {error || 'Movie not found'}
        </div>
      </div>
    );
  }
  
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
  
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';
  
  return (
    <div className="pt-16 animate-fadeIn">
      {/* Backdrop Image */}
      {backdropUrl && (
        <div className="relative h-96 -mx-4 sm:-mx-6 lg:-mx-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-neutral-900/30"></div>
          <img 
            src={backdropUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="relative z-10 -mt-48">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Movie Poster */}
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={posterUrl} 
                  alt={movie.title} 
                  className="w-full h-auto"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {trailer && (
                  <button 
                    onClick={handleWatchTrailer}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    <span>Watch Trailer</span>
                  </button>
                )}
                
                <button 
                  onClick={handleToggleFavorite}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                    isFavorite 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                  }`}
                >
                  <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                  <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
              </div>
              
              {/* Where to Watch */}
              {providers && (providers.flatrate || providers.rent || providers.buy) && (
                <div className="mt-8 bg-neutral-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Where to Watch</h3>
                  
                  {providers.flatrate && (
                    <div className="mb-4">
                      <h4 className="text-sm text-neutral-400 mb-2">Stream</h4>
                      <div className="flex flex-wrap gap-2">
                        {providers.flatrate.map((provider: any) => (
                          <div key={provider.provider_id} className="w-12 h-12 rounded-lg overflow-hidden" title={provider.provider_name}>
                            <img 
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                              alt={provider.provider_name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {providers.rent && (
                    <div className="mb-4">
                      <h4 className="text-sm text-neutral-400 mb-2">Rent</h4>
                      <div className="flex flex-wrap gap-2">
                        {providers.rent.map((provider: any) => (
                          <div key={provider.provider_id} className="w-12 h-12 rounded-lg overflow-hidden" title={provider.provider_name}>
                            <img 
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                              alt={provider.provider_name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {providers.buy && (
                    <div>
                      <h4 className="text-sm text-neutral-400 mb-2">Buy</h4>
                      <div className="flex flex-wrap gap-2">
                        {providers.buy.map((provider: any) => (
                          <div key={provider.provider_id} className="w-12 h-12 rounded-lg overflow-hidden" title={provider.provider_name}>
                            <img 
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                              alt={provider.provider_name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Movie Details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-lg text-neutral-400 italic mb-4">"{movie.tagline}"</p>
              )}
              
              {/* Movie Info */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                {movie.release_date && (
                  <div className="flex items-center space-x-1 text-neutral-300">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
                
                {movie.runtime > 0 && (
                  <div className="flex items-center space-x-1 text-neutral-300">
                    <Clock className="h-4 w-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                
                {movie.vote_average > 0 && (
                  <div className="flex items-center space-x-1 text-neutral-300">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
                
                {movie.original_language && (
                  <div className="flex items-center space-x-1 text-neutral-300">
                    <Globe className="h-4 w-4" />
                    <span>{movie.original_language.toUpperCase()}</span>
                  </div>
                )}
              </div>
              
              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre: any) => (
                      <span 
                        key={genre.id}
                        className="px-3 py-1 bg-neutral-800 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Overview */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                <p className="text-neutral-300 leading-relaxed">{movie.overview}</p>
              </div>
              
              {/* Cast */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.credits?.cast?.slice(0, 8).map((person: any) => (
                    <div key={person.id} className="bg-neutral-800 rounded-lg overflow-hidden">
                      {person.profile_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                          alt={person.name} 
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-neutral-700 flex items-center justify-center">
                          <User className="h-16 w-16 text-neutral-600" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-medium truncate">{person.name}</p>
                        <p className="text-sm text-neutral-400 truncate">{person.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Production Companies */}
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Production</h3>
                  <div className="flex flex-wrap gap-4">
                    {movie.production_companies.map((company: any) => (
                      <div key={company.id} className="flex items-center space-x-2">
                        {company.logo_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w92${company.logo_path}`} 
                            alt={company.name} 
                            className="h-8 object-contain bg-white p-1 rounded"
                          />
                        ) : (
                          <span className="text-neutral-400">{company.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-primary-500"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="aspect-video">
              <YouTube
                videoId={trailer.key}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;