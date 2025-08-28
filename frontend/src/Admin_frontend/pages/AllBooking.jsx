
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useNavigate } from "react-router-dom";

const AdminAllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/booking-detail");
        const bookedOnly = res.data.filter((b) => b.status === "booked");
        setBookings(bookedOnly);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookings();
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading all bookings...</p>;

  return (
    <div className="p-6 ml-64 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Booked Artists</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left dark:bg-gray-700 text-white">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Artist</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
           {bookings.map((booking) => (
    <tr
      key={booking.id}
      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
      className="dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition text-white"
    >
      <td className="p-3">{booking.clientName}</td>
      <td className="p-3">{booking.artistName}</td>
      <td className="p-3">
        {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
      </td>
      <td className="p-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-500">
          {booking.status}
        </span>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAllBookings;
