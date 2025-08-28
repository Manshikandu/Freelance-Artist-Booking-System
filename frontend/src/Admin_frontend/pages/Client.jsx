
import { useState, useEffect } from "react";
import axios from "../../lib/axios"; // adjusted path if needed

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/Clients-detail",
          { withCredentials:true});
        setClients(res.data);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading clients...</p>;

  return (
    <div className="pl-60 pr-6 pt-6 pb-10 min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Client Directory</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden text-white">
            <thead className="bg-gray-700 text-sm">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Location</th>
                
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client._id}
                  className="bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                >
                  <td className="p-3">{client.username}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.phone || "N/A"}</td>
                  <td className="p-3">{client.location || "N/A"}</td>
                  
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-300">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientList;

