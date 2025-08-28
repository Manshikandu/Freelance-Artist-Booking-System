

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Users,
  FileText,
  AlertCircle,BadgeCheck,ShieldAlert
} from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', icon: <LayoutDashboard />, to: '/admin' },
    { name: 'Artists', icon: <User />, to: '/admin/artists' },
    { name: 'Clients', icon: <Users />, to: '/admin/Clients' },
    { name: 'Recently Verified', icon: <BadgeCheck />, to: '/admin/recent-verified-artists' },
    { name: 'Verify Artists', icon: <ShieldAlert />, to: '/admin/verify-artists' },
    { name: 'Bookings', icon: <CalendarCheck />, to: '/admin/bookings' },
    { name: 'Contracts', icon: <FileText />, to: '/admin/contracts' },
    //  { name: 'Issues', icon: <AlertCircle />, to: '/admin/issues' }
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-60 bg-gradient-to-b from-purple-700 to-fuchsia-600 shadow-xl z-50 flex flex-col">
      <div className="px-6 py-8 flex-1 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-10 tracking-wide">KalaConnect</h1>
        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-white text-purple-800 shadow-lg'
                    : 'text-white hover:bg-blue-500 hover:bg-opacity-20 hover:scale-[1.03] hover:shadow-md'
                }`
              }
            >
              <span className="text-xl transition-transform group-hover:scale-110">
                {link.icon}
              </span>
              <span className="transition-colors group-hover:text-white">
                {link.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

