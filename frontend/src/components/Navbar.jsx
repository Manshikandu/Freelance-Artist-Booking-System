
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, LogIn, LogOut, User, Bell, CalendarCheck } from 'lucide-react';
import { useUserStore } from "../stores/useUserStore";
import NotificationBell from "./NotificationBell";
import { useState, useEffect } from 'react';

const Navbar = ({ forceBackground = false, backgroundColor = 'bg-[#000000]', forceProfileBackground = false }) => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    console.log('Logged out');
    navigate('/');
  };

  const [query, setQuery] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  // Scroll detection hook
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
  <header className={`fixed top-0 left-0 w-full z-50 transition-all text-white duration-300 ${forceBackground || isScrolled ? `${backgroundColor} shadow-md` : 'bg-transparent'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3">
        <nav className="flex items-center justify-between py-4">
          
          <Link to="/" className="text-2xl font-bold text-white">
            KalaConnect
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-lg">
           <button
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-purple-500 transition-colors"
            >
              Home
            </button>

            <button
              onClick={() => {
                const footer = document.getElementById('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-purple-500 transition-colors"
            >
              About
            </button>
           <button
              onClick={() => {
  navigate('/', { state: { scrollTo: 'categories' } });
}}

              className="hover:text-purple-500 transition-colors"
            >
              Category
            </button>


            {/* <Link to="/posts" className="hover:text-[#3ee6e6] transition-colors">Post</Link> */}
            {user && (
           <Link to="/posts" className="hover:text-purple-500 transition-colors">Post</Link>
           )}


            {/* Search */}
            <div className="relative ">
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search"
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 w-44 md:w-50 lg:w-80 xl:w-90 2xl:w-128 text-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={18} />
            </div>

            {/* User Actions */}
            {user ? (
              <div className="relative flex items-center gap-5">
                {/* <Link
                  to="/notifications"
                  className="relative flex items-center px-3 py-3 rounded-full text-purple-500 hover:text-black transition"
                  aria-label="Notifications"
                >
                  <Bell />
                </Link> */}
                <NotificationBell user={user} />


                {/* New Booking Button */}
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="flex items-center px-3 py-3 rounded-full text-white hover:bg-purple-600 hover:text-white transition"
                  aria-label="My Bookings"
                  title="My Bookings"
                >
                  <CalendarCheck />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className={`flex items-center px-3 py-3 rounded-full text-white transition ${
                      forceProfileBackground 
                        ? 'bg-purple hover:bg-purple-300' 
                        : 'bg-transparent hover:bg-transparent'
                    }`}
                    aria-label="User menu"
                  >
                    <User size={18} />
                  </button>
                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200">
                      <Link
                        to="/clientp"
                        onClick={() => setUserDropdown(false)}
                        className="w-full text-left px-4 py-2 text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition rounded-t-md"
                      >
                        <User size={16} /> Profile
                      </Link>
                      <hr className="border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition rounded-b-md"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/signup-select"
                  className="bg-purple-500 hover:bg-purple text-black font-medium py-1 px-4 rounded-full transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-black text-white hover:bg-gray-800 font-medium py-1 px-4 rounded-full flex items-center gap-2 transition duration-300"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-black"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-4 py-4">
            <button
              onClick={() => {
                setMenuOpen(false); // Close mobile menu
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#3ee6e6] transition-colors text-left"
            >
              Home
            </button>

            <button
              onClick={() => {
                setMenuOpen(false); // close menu first
                const footer = document.getElementById('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-[#3ee6e6] transition-colors text-left"
            >
              About
            </button>

           <button
              onClick={() => {
                setMenuOpen(false); // Close mobile menu
                const section = document.getElementById('categories');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-[#3ee6e6] transition-colors text-left"
            >
              Category
            </button>

            {/* <Link to="/post" className="hover:text-[#3ee6e6] transition-colors">Post</Link> */}
            {user && (
             <Link to="/posts" className="hover:text-[#3ee6e6] transition-colors">Post</Link>
            )}


            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search"
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full text-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={18} />
            </div>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-2 hover:bg-black rounded-md"
                >
                  <User size={18} /> Profile
                </Link>
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded-md"
                >
                  <CalendarCheck size={18} /> My Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded-md"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-purple-400 hover:bg-purple-900 text-black w-30 font-md py-2 px-4 rounded-full transition-colors text-center"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 w-30  border py-2 px-3 rounded-md transition"
                >
                  <LogIn size={18} /> Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
