
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import ClientSignatureForm from "../components/ClientSignatureForm";
import ArtistSignatureForm from "../components/ArtistSignatureForm";

export default function ContractPreviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);

  const [userRole, setUserRole] = useState(null);
  const [booking, setBooking] = useState(null);
  const [wage, setWage] = useState("");

  const [clientSignaturePreview, setClientSignaturePreview] = useState(null);
  const [artistSignaturePreview, setArtistSignaturePreview] = useState(null);
  const [artistSignature, setArtistSignature] = useState(null);

  const [loading, setLoading] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState({
    PayPal: false,
    cash: false,
    bankTransfer: false,
    other: false,
    otherText: "",
  });

  const [technicalReqs, setTechnicalReqs] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await axios.get(`/bookings/${bookingId}`, { withCredentials: true });
        const data = res.data.booking;

        setBooking(data);
        if (data.wage) setWage(data.wage);
        if (data.artistSignature) {
          setArtistSignature(data.artistSignature);
          setArtistSignaturePreview(data.artistSignature);
        }

        if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
        if (data.technicalReqs) setTechnicalReqs(data.technicalReqs);

        if (user && data) {
          if (user._id === data.artist._id) {
            setUserRole("artist");
          } else if (user._id === data.client._id) {
            setUserRole("client");
          } else {
            setUserRole(null);
          }
        }
      } catch (err) {
        toast.error("Failed to load booking details.");
        console.error(err);
      }
    }
    fetchBooking();
  }, [bookingId, user]);

  useEffect(() => {
    if (booking && booking.artist && booking.artist.wage && booking.startTime && booking.endTime) {
      const hourlyRate = booking.artist.wage;
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const totalHours = (end - start) / (1000 * 60 * 60);
      const calculatedWage = Math.round(hourlyRate * totalHours);
      setWage(calculatedWage);
    } else {
      setWage("");
    }
  }, [booking]);

  const togglePayment = (method) => {
    setPaymentMethods((prev) => {
      const updated = { ...prev, [method]: !prev[method] };
      if (method === "other" && !updated.other) updated.otherText = "";
      return updated;
    });
  };

  const handleOtherTextChange = (e) => {
    setPaymentMethods((prev) => ({ ...prev, otherText: e.target.value }));
  };

  const handleTechnicalReqsChange = (e) => {
    setTechnicalReqs(e.target.value);
  };

  const handleGenerate = async () => {
    if (!clientSignaturePreview) {
      toast.error("Click 'Add to Form' to attach your client signature first.");
      return;
    }

    if (booking.contractStatus === "draft" || booking.contractStatus === "signed") {
      toast.error("Contract already generated. You cannot generate again unless the previous contract was rejected.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/contracts/generate-client", {
        bookingId,
        signatureImage: clientSignaturePreview,
        paymentMethods,
        technicalReqs,
      });
      toast.success("Contract generated!");
      navigate("/my-bookings");
    } catch (err) {
      toast.error("Failed to generate contract.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistSign = async () => {
    if (!artistSignaturePreview) {
      toast.error("Click 'Add to Form' to attach your artist signature first.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/contracts/sign-artist",
        {
          bookingId,
          artistSignature: artistSignaturePreview,
        },
        { withCredentials: true }
      );
      toast.success("Artist signed the contract!");
      navigate("/artist-bookings");
      setArtistSignature(artistSignaturePreview);
    } catch (err) {
      toast.error("Failed to sign contract.");
      console.error("Sign artist error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return <p className="p-6 max-w-lg mx-auto">Loading booking...</p>;

  const contractLocked = booking.contractStatus === "signed";

  return (
    <div className="p-6 w-full max-w-4xl mx-auto text-sm">
      {/* Contract Preview Section */}
      <section className="border p-8 rounded-lg bg-white text-gray-800 shadow-md leading-relaxed">
        <h3 className="text-xl font-bold text-center underline mb-6">ARTIST BOOKING CONTRACT</h3>
        <p>
          This Agreement is made on this <u>___</u> day of <u>____________</u>, 20<u>__</u>.
        </p>

        {/* Client & Artist Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold underline">Event Contact Person:</h4>
            <p>
              <span className="font-medium">Name:</span> {booking.contactName || booking.client.username || "N/A"}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {booking.contactPhone || booking.client.phone || "N/A"}
            </p>
            <p>
              <span className="font-medium">Email:</span> {booking.contactEmail || booking.client.email || "N/A"}
            </p>
          </div>

          <div className="md:text-left">
            <h4 className="font-semibold underline">Artist/Performer:</h4>
            <p>
              <span className="font-medium">Name:</span> {booking.artist.username}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {booking.artist.phone}
            </p>
            <p>
              <span className="font-medium">Email:</span> {booking.artist.email}
            </p>
          </div>
        </div>

        {/* Event Details */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">Event Details:</h4>
          <p>Date(s): {new Date(booking.eventDate).toLocaleDateString()}</p>
          <p>
            Time: {new Date(booking.startTime).toLocaleTimeString()} – {new Date(booking.endTime).toLocaleTimeString()}
          </p>
          <p>Location: {booking.location}</p>
          <p>Event Type: {booking.eventType}</p>
          <p>Event Details: {booking.eventDetails || "N/A"}</p>
        </div>

        {/* Payment */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">Payment:</h4>
          Rs. {wage !== "" && wage !== null ? wage : "Calculating..."}
        </div>

        {/* Payment Terms */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">Payment Terms:</h4>
          <p>Payment will be made by (check one or more):</p>
          <div className="flex flex-col space-y-1 mt-2 max-w-xs">
            {["PayPal", "cash", "bankTransfer", "other"].map((method) => (
              <label key={method} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={paymentMethods[method]}
                  onChange={() => togglePayment(method)}
                  disabled={contractLocked || userRole !== "client"}
                />
                <span className="capitalize w-32 inline-block">
                  {method === "bankTransfer"
                    ? "Bank Transfer"
                    : method === "other"
                    ? "Other:"
                    : method.charAt(0).toUpperCase() + method.slice(1)}
                </span>
                {method === "other" && paymentMethods.other && (
                  <input
                    type="text"
                    placeholder="Specify other payment method"
                    className="ml-2 border px-2 py-1 rounded w-48"
                    value={paymentMethods.otherText}
                    onChange={handleOtherTextChange}
                    disabled={contractLocked}
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Advance Payment */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">Advance Payment & Remaining Balance:</h4>
          <p>
            The Client agrees to pay a non-refundable advance payment of 50% of the total wage (Rs.{" "}
            {Math.floor(wage / 2) || "_____"}) to confirm the booking, shall be paid on the day of the event prior
            to performance.
          </p>
        </div>

        {/* Additional Requirements */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">6. Additional Requirements:</h4>
          <textarea
            className="w-full border rounded p-2"
            placeholder="Specify any additional requirements here..."
            rows={4}
            value={technicalReqs}
            onChange={handleTechnicalReqsChange}
            disabled={contractLocked || userRole !== "client"}
          />
        </div>

        {/* Cancellation & Refund Policy */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">Cancellation & Refund Policy:</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>If the Client cancels more than 7 days before the event, the advance payment is forfeited;</li>
            <li>If the Client cancels within 7 days of the event, the full wage is due.</li>
            <li>If the Artist cancels, the full advance will be refunded within 5 business days.</li>
          </ul>
        </div>

        {/* Liability */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">Liability:</h4>
          <p>
            Client agrees to provide a safe environment for the Artist. The Client assumes all responsibility for any
            injury or damage occurring at the event, except where caused by the Artist’s negligence.
          </p>
        </div>

        {/* Miscellaneous */}
        <div className="mt-4">
          <h4 className="font-semibold underline mb-2">Miscellaneous:</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>This Agreement is the entire understanding between the parties</li>
            <li>Any amendments must be in writing and signed by both parties.</li>
          </ul>
        </div>

        {/* Signatures Preview */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          {/* Client Signature Preview */}
          <div>
            <h4 className="font-semibold underline mb-2">Client Signature:</h4>
            {clientSignaturePreview ? (
              <img src={clientSignaturePreview} alt="Client Signature" className="border w-full h-20 object-contain bg-white" />
            ) : booking.clientSignature ? (
              <img src={booking.clientSignature} alt="Client Signature" className="border w-full h-20 object-contain bg-white" />
            ) : (
              <p className="text-gray-500 italic">Signature will appear here once added.</p>
            )}
          </div>

          {/* Artist Signature Preview */}
          <div>
            <h4 className="font-semibold underline mb-2">Artist Signature:</h4>
            {artistSignature ? (
              <img src={artistSignature} alt="Artist Signature" className="border w-full h-20 object-contain bg-white" />
            ) : artistSignaturePreview ? (
              <img src={artistSignaturePreview} alt="Artist Signature Preview" className="border w-full h-20 object-contain bg-white" />
            ) : (
              <p className="text-gray-500 italic">Waiting for artist to sign.</p>
            )}
          </div>
        </div>
      </section>

      {/* CLIENT Signature Canvas */}
      {userRole === "client" && !contractLocked && (
        <ClientSignatureForm
          clientSignaturePreview={clientSignaturePreview}
          setClientSignaturePreview={setClientSignaturePreview}
          loading={loading}
          onGenerate={handleGenerate}
          contractLocked={contractLocked}
          userRole={userRole}
        />
      )}

      {/* ARTIST Signature Canvas */}
      {userRole === "artist" && !artistSignature && (
        <ArtistSignatureForm
          artistSignaturePreview={artistSignaturePreview}
          setArtistSignaturePreview={setArtistSignaturePreview}
          loading={loading}
          onArtistSign={handleArtistSign}
          contractLocked={contractLocked}
          userRole={userRole}
        />
      )}

      {/* Contract Link */}
      {/* {contractUrl && (
        <a
          href={`http://localhost:3000${contractUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 mt-8 block text-center"
        >
          View Contract PDF
        </a>
      )} */}


      {/* Show message if contract was rejected */}
      {booking.contractStatus === "rejected" && (
        <p className="text-red-600 text-center mt-6">
          Previous contract was rejected. You can edit and regenerate the contract.
        </p>
      )}
    </div>
  );
}
