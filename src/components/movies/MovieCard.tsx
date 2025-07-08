import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Plus, Star } from 'lucide-react';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const releaseYear = new Date(releaseDate).getFullYear();
  const posterUrl = posterPath 
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  return (
    <Link 
      to={`/movie/${id}`}
      className="movie-card group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] bg-neutral-800 rounded-md overflow-hidden">
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
            <div className="animate-pulse w-12 h-12 rounded-full bg-neutral-700"></div>
          </div>
        )}
        
        {/* Error fallback */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-500">
            <div className="text-center p-4">
              <span className="text-sm">{title}</span>
            </div>
          </div>
        )}
        
        {/* Movie poster */}
        <img
          src={posterUrl}
          alt={`${title} poster`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Overlay with movie info */}
        <div className="movie-card-overlay">
          <div className="flex flex-col h-full">
            <div className="flex-grow"></div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{voteAverage.toFixed(1)}</span>
              </div>
              
              <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
              {releaseYear && <p className="text-xs text-neutral-400">{releaseYear}</p>}
              
              <div className="pt-2 flex items-center space-x-2">
                <Link 
                  to={`/movie/${id}`}
                  className="p-1.5 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors"
                >
                  <Play className="h-4 w-4" />
                </Link>
                
                <button 
                  onClick={handleFavoriteClick}
                  className={`p-1.5 rounded-full transition-colors ${
                    isFavorite 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                  }`}
                >
                  <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                </button>
                
                <button className="p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-full transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;