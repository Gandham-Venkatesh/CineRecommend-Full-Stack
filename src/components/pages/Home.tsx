import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCarousel from '../movies/MovieCarousel';
import MovieGrid from '../movies/MovieGrid';
import { Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const { user } = useAuth();
  
  const [showFilters, setShowFilters] = useState(false);
  const [yearRange, setYearRange] = useState<[number, number]>([1980, 2025]);
  const [languages, setLanguages] = useState<string[]>(['en', 'te', 'ta', 'hi', 'ml']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  
  const languageNames: Record<string, string> = {
    en: 'English',
    te: 'Telugu',
    ta: 'Tamil',
    hi: 'Hindi',
    ml: 'Malayalam'
  };
  
  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      if (selectedLanguages.length > 1) { // Prevent removing all languages
        setSelectedLanguages(selectedLanguages.filter(lang => lang !== code));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };
  
  if (searchQuery) {
    return (
      <div className="space-y-8 mt-16">
        <h1 className="text-3xl font-bold">Search Results: "{searchQuery}"</h1>
        <MovieGrid 
          title="" 
          endpoint="search/movie" 
          params={{ 
            query: searchQuery,
            language: 'en-US',
            include_adult: 'false',
            "primary_release_date.gte": `${yearRange[0]}-01-01`,
            "primary_release_date.lte": `${yearRange[1]}-12-31`,
            with_original_language: selectedLanguages.join('|')
          }} 
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-8 mt-16">
      {/* Hero Carousel */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 h-96 bg-gradient-to-r from-neutral-900 to-neutral-800 mb-8 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover your next favorite movie</h1>
            <p className="text-xl text-neutral-300 mb-8">
              Personalized recommendations based on your taste
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-md transition-colors text-lg">
              Explore Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-8">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-neutral-300 hover:text-white transition-colors mb-4"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
        
        {showFilters && (
          <div className="bg-neutral-800 p-4 rounded-lg space-y-4 animate-fadeIn">
            <div>
              <h3 className="font-medium mb-2">Year Range</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="text-sm text-neutral-400">From</label>
                  <select 
                    value={yearRange[0]}
                    onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                    className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm w-24"
                  >
                    {Array.from({ length: 46 }, (_, i) => 1980 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400">To</label>
                  <select 
                    value={yearRange[1]}
                    onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                    className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm w-24"
                  >
                    {Array.from({ length: 46 }, (_, i) => 1980 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedLanguages.includes(lang)
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Personalized Recommendations */}
      <MovieCarousel 
        title="Recommended for You" 
        endpoint="recommendations" 
        params={{ 
          language: 'en-US',
          with_original_language: selectedLanguages.join('|'),
          "primary_release_date.gte": `${yearRange[0]}-01-01`,
          "primary_release_date.lte": `${yearRange[1]}-12-31`
        }} 
      />
      
      {/* Trending Movies */}
      <MovieCarousel 
        title="Trending Now" 
        endpoint="trending/movie/day" 
        params={{ 
          language: 'en-US',
          with_original_language: selectedLanguages.join('|')
        }} 
      />
      
      {/* Top Rated */}
      <MovieCarousel 
        title="Top Rated" 
        endpoint="movie/top_rated" 
        params={{ 
          language: 'en-US',
          with_original_language: selectedLanguages.join('|'),
          "primary_release_date.gte": `${yearRange[0]}-01-01`,
          "primary_release_date.lte": `${yearRange[1]}-12-31`
        }} 
      />
      
      {/* New Releases */}
      <MovieCarousel 
        title="New Releases" 
        endpoint="movie/now_playing" 
        params={{ 
          language: 'en-US',
          with_original_language: selectedLanguages.join('|')
        }} 
      />
      
      {/* By Genre: Action */}
      <MovieCarousel 
        title="Action Movies" 
        endpoint="discover/movie" 
        params={{ 
          with_genres: '28',
          language: 'en-US',
          with_original_language: selectedLanguages.join('|'),
          "primary_release_date.gte": `${yearRange[0]}-01-01`,
          "primary_release_date.lte": `${yearRange[1]}-12-31`
        }} 
      />
      
      {/* By Genre: Comedy */}
      <MovieCarousel 
        title="Comedy Movies" 
        endpoint="discover/movie" 
        params={{ 
          with_genres: '35',
          language: 'en-US',
          with_original_language: selectedLanguages.join('|'),
          "primary_release_date.gte": `${yearRange[0]}-01-01`,
          "primary_release_date.lte": `${yearRange[1]}-12-31`
        }} 
      />
    </div>
  );
};

export default Home;