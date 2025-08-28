// Admin Dashboard Component
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaUsers, FaUserTie, FaChartLine, FaClipboardList } from "react-icons/fa";
import { motion } from "framer-motion";

const StatCard = ({  label, value, color, onClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className={`bg-gradient-to-br ${color} text-white shadow-lg rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-transform duration-300 hover:scale-105`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium uppercase tracking-wide">{label}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      className="mt-5 bg-white text-gray-800 text-xs font-semibold py-1.5 px-4 rounded-full shadow hover:bg-gray-100"
    >
      View {label}
    </button>
  </motion.div>
);

const AdminDashboard = () => {
  const [clientsCount, setClientsCount] = useState(0);
  const [artistsCount, setArtistsCount] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const bookingsPerPage = 5;
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [recentVerified, setRecentVerified] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, verifiedRes, verifyRes] = await Promise.all([
          axios.get("/admin/dashboard-data"),
          axios.get("/admin/recent-verified-artists"),
          axios.get("/admin/unverified-artists"),
        ]);

        setClientsCount(dashboardRes.data.clientCount);
        setArtistsCount(dashboardRes.data.artistCount);
        setBookings(dashboardRes.data.latestBookings);
        setRecentVerified(verifiedRes.data);
        setUnverifiedCount(verifyRes.data.length);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch admin data", error.message);
      }
    };
    fetchData();
  }, []);

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status.toLowerCase() === filterStatus);

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const statusChartData = ["accepted", "rejected", "booked", "pending"].map((status) => ({
    name: status,
    count: bookings.filter((b) => b.status === status).length,
  }));

  const trendData = bookings
    .map((b) => ({ date: b.date, count: 1 }))
    .reduce((acc, curr) => {
      const found = acc.find((i) => i.date === curr.date);
      if (found) found.count += 1;
      else acc.push(curr);
      return acc;
    }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const themeClasses = darkMode
    ? "bg-gray-900 text-white"
    : "bg-gradient-to-tr from-purple-100 via-white to-purple-50 text-gray-900";

  if (loading) return <p className="p-6 text-lg">Loading dashboard...</p>;

  return (
    <div className={`ml-64 px-8 py-6 min-h-screen ${themeClasses}`}>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold">Admin Dashboard</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
        >
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Clients" value={clientsCount} color="from-purple-600 to-purple-800" onClick={() => navigate("/admin/clients")} />
        <StatCard label="Artists" value={artistsCount} color="from-pink-600 to-pink-800" onClick={() => navigate("/admin/artists")} />
        <StatCard label="Bookings" value={bookings.length} color="from-yellow-400 to-yellow-600" onClick={() => navigate("/admin/bookings")} />
        <StatCard label="Contracts" value={bookings.length} color="from-green-500 to-green-700" onClick={() => navigate("/admin/contracts")} />
      </div>

     

      {/* Verification Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-purple-300 mb-4">Recently Verified Artists</h2>
          {recentVerified.length === 0 ? (
            <p className="text-gray-500">No recent verified artists.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentVerified.map((artist) => (
                <div key={artist._id} className="bg-gradient-to-br from-green-500 to-green-700 text-white p-4 rounded-xl shadow-md flex items-center gap-4">
                  <img
                    src={artist.profilePicture?.url || "/default-avatar.png"}
                    alt={artist.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h4 className="text-md font-bold">{artist.username}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-red-500">Pending Verifications</h2>
            <button
              onClick={() => navigate("/admin/verify-artists")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm shadow"
            >
              Manage
            </button>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-xl text-center shadow-md">
            <p className="text-4xl font-bold">{unverifiedCount}</p>
            <p className="mt-2 text-sm">Artists waiting for verification</p>
          </div>
        </motion.div>
      </div>

      
         {/* Charts */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 text-white"
        >
          <h2 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <FaChartLine /> Booking Trends
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
              <XAxis dataKey="date" stroke="#fff" />
              <YAxis allowDecimals={false} stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>


      <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 text-white"
        >
          <h2 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <FaClipboardList /> Booking Status Overview
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis allowDecimals={false} stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff" }} />
              <Bar dataKey="count" fill="#ffffff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

       {/* Recent Bookings */}
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <h2 className="text-xl font-semibold text-purple-300">Recent Bookings</h2>
          <select
            className="border border-gray-300 p-2 rounded-md text-sm text-purple-400"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {["all", "accepted", "rejected", "booked", "pending"].map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {currentBookings.length === 0 ? (
          <p className="text-white text-center py-4">No bookings found.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-white dark:bg-gray-700 dark:text-white text-left">
                  <tr>
                    <th className="p-3">Client</th>
                    <th className="p-3">Artist</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition text-white"
                    >
                      <td className="p-3">{booking.clientName}</td>
                      <td className="p-3">{booking.artistName}</td>
                      <td className="p-3">{booking.date}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white
                            ${booking.status === "accepted"
                              ? "bg-green-500"
                              : booking.status === "rejected"
                              ? "bg-red-500"
                              : booking.status === "booked"
                              ? "bg-blue-500"
                              : "bg-yellow-500"}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;




