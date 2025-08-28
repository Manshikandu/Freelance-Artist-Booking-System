import { useEffect, useState } from "react";
import axios from "../../lib/axios";

const AdminSignedContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/signed-contracts");
        
        setContracts(res.data);
      } catch (err) {
        console.error("Failed to fetch contracts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading signed contracts...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Signed Contracts</h2>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-white">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Artist</th>
              <th className="p-3">Event Date</th>
              <th className="p-3">Client Signed</th>
              <th className="p-3">Artist Signed</th>
              <th className="p-3">Wage</th>
              <th className="p-3">Contract</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="text-white">
                <td className="p-3">{contract.clientUsername}</td>
                <td className="p-3">{contract.artistUsername}</td>
                <td className="p-3">{new Date(contract.eventDate).toLocaleDateString()}</td>
                <td className="p-3">{contract.clientSignedAt ? new Date(contract.clientSignedAt).toLocaleDateString() : "N/A"}</td>
                <td className="p-3">{contract.artistSignedAt ? new Date(contract.artistSignedAt).toLocaleDateString() : "N/A"}</td>
                <td className="p-3">₹{contract.wage || "N/A"}</td>
                <td className="p-3">
                  {contract.contractUrl ? (
                    // <a href={contract.contractUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                    //   View
                    // </a>
                    <a
                        href={`http://localhost:3000${contract.contractUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        >
                        View Signed Contract
                        </a>

                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-400">
                  No signed contracts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSignedContracts;
