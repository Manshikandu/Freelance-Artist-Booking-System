
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  Loader,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import loginImage from "../assets/login.jpg";
const ClientSignUpPage = () => {
  const [step, setStep] = useState("form"); // form | otp
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const { clientSignup } = useUserStore();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (!formData.email || !formData.username || !formData.password || !formData.phone) {
      return toast.error("Please fill in all required fields");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to email");
        setStep("otp");
        setCooldown(30);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Server error");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP verified. Creating account...");
        await clientSignup(formData);
        toast.success("Signup successful ✅");
        window.location.href = "/login";
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      const res = await fetch("http://localhost:3000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        toast.success("OTP resent");
        setCooldown(30);
      } else {
        toast.error("Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-2/5 items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <img
            src={loginImage}
            alt="Signup visual"
            className="h-[28rem] w-96 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
          />
          <div className="mt-6 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Join Our Community</h3>
            <p className="text-purple-100">Connect with amazing artists and bring your events to life</p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center items-center py-6 px-8 bg-gradient-to-br from-white to-purple-50">
        <div className="w-full max-w-md">
          <motion.div
            className="w-full text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {step === "form" ? "Create Your Account" : "Verify Your Email"}
            </h2>
            <p className="mt-2 text-gray-600">
              {step === "form" 
                ? "Join thousands of satisfied clients" 
                : "We've sent a verification code to your email"
              }
            </p>
          </motion.div>

          <motion.div
            className="mt-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            >
            {step === "form" ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="block w-full pl-12 pr-4 py-2.5 bg-white/80 border-2 border-purple-200 rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="block w-full pl-12 pr-4 py-2.5 bg-white/80 border-2 border-purple-200 rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="block w-full pl-12 pr-4 py-2.5 bg-white/80 border-2 border-purple-200 rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                      </div>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="block w-full pl-12 pr-4 py-2.5 bg-white/80 border-2 border-purple-200 rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                        placeholder="Create a strong password"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" />
                      </div>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className={`block w-full pl-12 pr-4 py-2.5 bg-white/80 border-2 ${
                          formData.password === formData.confirmPassword
                            ? "border-purple-200 focus:ring-purple-500"
                            : "border-red-300 focus:ring-red-500"
                        } rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-purple-300`}
                        placeholder="Confirm your password"
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 focus:ring-4 focus:ring-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // OTP Step
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600">Check your email for the verification code</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full px-4 py-4 text-center text-2xl font-mono bg-white/80 border-2 border-purple-200 rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Verify & Create Account
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleResendOtp}
                      disabled={cooldown > 0}
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="h-4 w-4" />
                      {cooldown > 0
                        ? `Resend code in ${cooldown}s`
                        : "Resend verification code"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-semibold text-purple-600 hover:text-purple-800 transition-colors inline-flex items-center gap-1"
                >
                  Sign in here <ArrowRight className="h-4 w-4" />
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClientSignUpPage;







