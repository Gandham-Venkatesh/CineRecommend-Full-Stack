import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMovieService } from '../../services/movieService';
import { Clock, Trash2 } from 'lucide-react';

const WatchHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getWatchHistory, removeFromWatchHistory, clearWatchHistory } = useMovieService();
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getWatchHistory();
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch watch history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, []);
  
  const handleRemoveFromHistory = async (movieId: number) => {
    try {
      await removeFromWatchHistory(movieId);
      setHistory(history.filter(item => item.movieId !== movieId));
    } catch (err: any) {
      console.error('Failed to remove from history:', err);
    }
  };
  
  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your entire watch history?')) {
      try {
        await clearWatchHistory();
        setHistory([]);
      } catch (err: any) {
        console.error('Failed to clear history:', err);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="pt-16">
        <h1 className="text-3xl font-bold mb-8">Watch History</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex p-4 bg-neutral-800 rounded-md">
              <div className="bg-neutral-700 h-24 w-16 rounded"></div>
              <div className="ml-4 space-y-2 flex-grow">
                <div className="h-5 bg-neutral-700 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="pt-16">
        <h1 className="text-3xl font-bold mb-8">Watch History</h1>
        <div className="bg-error-700/20 border border-error-700 text-white p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (history.length === 0) {
    return (
      <div className="pt-16">
        <h1 className="text-3xl font-bold mb-8">Watch History</h1>
        <div className="bg-neutral-800 p-8 rounded-lg text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-neutral-600" />
          <h2 className="text-xl font-semibold mb-2">No watch history</h2>
          <p className="text-neutral-400 mb-6">
            Movies you view will appear in your watch history.
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
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="pt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Watch History</h1>
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4 text-neutral-400" />
            <span>Clear History</span>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {history.map(item => (
          <div key={item.id} className="flex bg-neutral-800 rounded-md overflow-hidden">
            <div className="w-20 h-auto bg-neutral-700 flex-shrink-0">
              {item.posterPath ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w92${item.posterPath}`} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                  No Image
                </div>
              )}
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
              <div className="flex justify-between items-start">
                <Link to={`/movie/${item.movieId}`} className="text-lg font-medium hover:text-primary-500 transition-colors">
                  {item.title}
                </Link>
                <button 
                  onClick={() => handleRemoveFromHistory(item.movieId)}
                  className="p-1 text-neutral-400 hover:text-neutral-300 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-neutral-400 mt-1">
                Viewed on {formatDate(item.viewedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchHistory;