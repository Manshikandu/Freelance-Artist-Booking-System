import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Bell } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { CheckCircle, XCircle } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";


const ArtistNavbar = ({ forceBackground = false, backgroundColor = "bg-black", forceProfileBackground = false }) => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isArtistHome = location.pathname === '/artisthome';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCategoryScroll = () => {
    const section = document.getElementById('categories');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/artisthome', { state: { scrollTo: 'categories' } });
    }
  };

  const shouldShowBackground = forceBackground || !isArtistHome || isScrolled;
  const navbarBg = shouldShowBackground ? backgroundColor : 'bg-transparent';
  const textColor = shouldShowBackground ? 'text-white' : 'text-white';
  const logoColor = shouldShowBackground ? 'text-white' : 'text-white';
  const profileBg = forceProfileBackground || shouldShowBackground ? 'bg-white text-black' : 'bg-white text-black';



  return (
     <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navbarBg} ${shouldShowBackground ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-4">
          <Link to="/" className={`text-2xl font-bold ${logoColor}`}>KalaConnect</Link>

          <div className="hidden md:flex items-center justify-center gap-8 text-lg font-medium">
            <button onClick={() => navigate('/artisthome')} className={`${textColor} hover:text-purple-300 transition`}>Home</button>
            <button onClick={() => navigate('/artistdash')} className={`${textColor} hover:text-purple-300 transition`}>Dashboard</button>
            <button onClick={() => navigate('/artist-bookings')} className={`${textColor} hover:text-purple-300 transition`}>Bookings</button>
            <button onClick={() => navigate('/profile')} className={`${textColor} hover:text-purple-300 transition`}>Profile</button>
            <button onClick={() => navigate('/post')} className={`${textColor} hover:text-purple-300 transition`}>Posts</button>
            <button onClick={handleCategoryScroll} className={`${textColor} hover:text-purple-300 transition`}>Category</button>
             <button onClick={() => navigate('/ArtistChat')} className={ `${textColor} hover:text-purple-300 transition`}>Chat</button>

            <div className="relative flex items-center gap-5">
              
              <NotificationBell user={user} />
            </div>

            

          <div className="relative flex items-center gap-2">
  <button
    onClick={() => setUserDropdown(!userDropdown)}
    className={`${profileBg} px-3 py-2 rounded-full hover:bg-gray-100 transition flex items-center`}
    aria-label="User menu"
  >
    <User size={18} />
    {user?.isVerified ? (
      <CheckCircle className="text-green-400 ml-2" size={16} title="Verified" />
    ) : (
      <XCircle className="text-red-400 ml-2" size={16} title="Not Verified" />
    )}
  </button>
  {userDropdown && (
    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
      <hr className="border-gray-200" />
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-black"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  )}
</div>

          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden ${textColor}`}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`md:hidden flex flex-col items-start gap-4 py-4 text-base font-medium ${textColor}`}>
            <button onClick={() => { setMenuOpen(false); navigate('/artisthome'); }}>Home</button>
            <button onClick={() => { setMenuOpen(false); navigate('/artistdash'); }}>Dashboard</button>
            <button onClick={() => { setMenuOpen(false); navigate('/artist-bookings'); }}>Bookings</button>
            <button onClick={() => { setMenuOpen(false); navigate('/profile'); }}>Profile</button>
            <button onClick={() => { setMenuOpen(false); navigate('/post'); }}>Posts</button>
            <button onClick={() => { setMenuOpen(false); handleCategoryScroll(); }}>Category</button>
            <button onClick={() => { setMenuOpen(false); navigate('/ArtistChat')}} >Chat</button>
            <Link to="/notifications" onClick={() => setMenuOpen(false)} className={textColor}>Notifications</Link>
            <button onClick={handleLogout} className={textColor}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default ArtistNavbar;
