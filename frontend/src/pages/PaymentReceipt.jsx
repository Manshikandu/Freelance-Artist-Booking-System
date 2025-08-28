import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { ArrowLeft } from "lucide-react";

const PaymentReceipt = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const userRole = localStorage.getItem('userRole') || 'client';
      if (userRole === 'artist') {
        navigate('/artist/bookings');
      } else {
        navigate('/my-bookings');
      }
    }
  };

  useEffect(() => {
    axios.get(`/payments/receipt/${id}`)
      .then(res => {
        if (res.data.success) setReceipt(res.data.receipt);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load receipt");
      });
  }, [id]);

  if (!receipt) return <div className="p-10 text-center">Loading...</div>;

  const {
    transactionId, amount, currency, paymentMethod,
    paymentStatus, payerEmail, paidAt, clientId, artistId, note
  } = receipt;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <button onClick={handleGoBack} className="mb-4 flex items-center text-gray-600 hover:text-black">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">Payment Receipt</h1>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Transaction ID:</strong> {transactionId}</div>
        <div><strong>Status:</strong> {paymentStatus}</div>
        <div><strong>Paid At:</strong> {new Date(paidAt).toLocaleString()}</div>
        <div><strong>Amount:</strong> {currency} {amount.toFixed(2)}</div>
        <div><strong>Payment Method:</strong> {paymentMethod}</div>
        <div><strong>Payer Email:</strong> {payerEmail}</div>
        <div><strong>Client:</strong> {clientId?.username}</div>
        <div><strong>Artist:</strong> {artistId?.username}</div>
        <div className="col-span-2"><strong>Note:</strong> {note || "—"}</div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Download / Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PaymentReceipt;
