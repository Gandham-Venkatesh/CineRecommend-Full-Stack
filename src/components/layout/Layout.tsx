import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full animate-fadeIn">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;