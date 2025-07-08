import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Menu, X, User, Heart, History, LogOut, Film } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu when location changes
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-neutral-900/95 shadow-md backdrop-blur-sm' : 'bg-gradient-to-b from-neutral-900 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-white">CineRecommend</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                className="pl-10 pr-4 py-2 bg-neutral-800/80 text-white rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-primary-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            </form>
            
            <div className="flex items-center space-x-2">
              <Link to="/favorites" className="p-2 text-neutral-300 hover:text-white transition-colors duration-200">
                <Heart className="h-5 w-5" />
              </Link>
              <Link to="/history" className="p-2 text-neutral-300 hover:text-white transition-colors duration-200">
                <History className="h-5 w-5" />
              </Link>
              <Link to="/profile" className="p-2 text-neutral-300 hover:text-white transition-colors duration-200">
                <User className="h-5 w-5" />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-neutral-300 hover:text-white transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-neutral-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-neutral-900 shadow-lg animate-fadeIn">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                className="pl-10 pr-4 py-2 bg-neutral-800 text-white rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            </form>
            
            <nav className="grid grid-cols-1 gap-1">
              <Link to="/favorites" className="flex items-center space-x-2 p-3 rounded-md hover:bg-neutral-800">
                <Heart className="h-5 w-5 text-neutral-300" />
                <span>Favorites</span>
              </Link>
              <Link to="/history" className="flex items-center space-x-2 p-3 rounded-md hover:bg-neutral-800">
                <History className="h-5 w-5 text-neutral-300" />
                <span>Watch History</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 p-3 rounded-md hover:bg-neutral-800">
                <User className="h-5 w-5 text-neutral-300" />
                <span>Profile</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 p-3 rounded-md hover:bg-neutral-800 text-left w-full"
              >
                <LogOut className="h-5 w-5 text-neutral-300" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;