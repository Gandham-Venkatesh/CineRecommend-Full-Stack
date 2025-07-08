import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CineRecommend</h3>
            <p className="text-neutral-400 text-sm">
              Discover movies tailored to your taste with our advanced recommendation engine.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  Watch History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <p className="text-neutral-400 text-sm mb-4">
              CineRecommend uses hybrid filtering technology to recommend movies based on your preferences and viewing history.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/gandham-venkatesh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} CineRecommend. All rights reserved.
          </p>
          <p className="text-neutral-500 text-xs mt-1">
            Powered by TMDB API. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;