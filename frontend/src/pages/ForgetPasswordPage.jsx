
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { Mail, Loader } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent! Check your email.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-400 px-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-xl p-8">
        <h2 className="text-center text-3xl font-extrabold text-purple-800 mb-6">
          Forgot Password
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Enter your registered email to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 px-4 text-white text-sm font-semibold rounded-md transition
              ${loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-600"}`}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
