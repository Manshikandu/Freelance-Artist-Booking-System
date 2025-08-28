
import { useRef } from "react";
import { UploadCloud, Calendar, FileText, ImagePlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";

import {
  Tag,
  MapPin,
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
import { getCoordinates } from "../components/utlis/geolocation";
import signupImage from "../assets/home.jpg"; 

const ArtistSignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(1); 
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const [livePhotoBlob, setLivePhotoBlob] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    location: "",
    category: "",
    dateOfBirth: "",
    citizenshipNumber: "",
    citizenshipImage: null,
    livePhoto: null,
    guardianName: "",
    guardianRelation: "",
    guardianIdDocument: null,
  });


  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.username || !formData.email || !formData.phone || !formData.password) {
        return toast.error("Please fill in all required fields");
      }
      
      if (!/^\d{10}$/.test(formData.phone)) {
        return toast.error("Phone number must be exactly 10 digits");
      }
      
      setCurrentStep(2);
    }
    else if (currentStep === 2) {
      if (!formData.category || !formData.location || !livePhotoBlob) {
        return toast.error("Please fill in all required fields and capture live photo");
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Create your account";
      case 2: return "Artist Information";
      case 3: return "Citizenship & Verification";
      case 4: return "Email Verification";
      default: return "Sign up";
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!formData.dateOfBirth || !formData.citizenshipNumber || !formData.citizenshipImage) {
      return toast.error("Please fill in all citizenship information");
    }

    if (isUnderage() && (!formData.guardianName || !formData.guardianRelation || !formData.guardianIdDocument)) {
      return toast.error("Guardian information is required for users under 18");
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to email");
        setCurrentStep(4);
        setCooldown(30);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
  if (!otp) return toast.error("Enter OTP");

  // Validate step 3 fields (citizenship info)
  if (!formData.dateOfBirth || !formData.citizenshipNumber || !formData.citizenshipImage) {
    return toast.error("Please complete all citizenship information");
  }

  // Validate guardian info if underage
  if (isUnderage() && (!formData.guardianName || !formData.guardianRelation || !formData.guardianIdDocument)) {
    return toast.error("Guardian information is required for users under 18");
  }

  setLoading(true);
  try {
    const verifyRes = await fetch("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, otp }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      toast.error(verifyData.message || "Invalid OTP");
      return;
    }

    toast.success("OTP verified. Submitting KYC...");

    const coordinates = await getCoordinates(formData.location);
    const payload = new FormData();

    // Append all basic fields
    payload.append("username", formData.username);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("password", formData.password);
    payload.append("category", formData.category);
    payload.append("city", formData.location);
    payload.append("dateOfBirth", formData.dateOfBirth);
    payload.append("citizenshipNumber", formData.citizenshipNumber);
    payload.append("citizenshipImage", formData.citizenshipImage);
    
    if (livePhotoBlob) payload.append("livePhoto", livePhotoBlob);
    else return toast.error("Live photo is required. Please capture one.");
    
    // Location coordinates
    payload.append("lat", coordinates[1]);
    payload.append("lon", coordinates[0]);

    if (isUnderage()) {
      payload.append("guardianInfo[name]", formData.guardianName);
      payload.append("guardianInfo[relation]", formData.guardianRelation);
      if (formData.guardianIdDocument) {
        payload.append("guardianInfo[idDocument]", formData.guardianIdDocument);
      }
    }

    const res = await fetch("http://localhost:3000/api/auth/artistSignup", {
      method: "POST",
      body: payload,
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Signup complete. Awaiting verification.");
      window.location.href = "/login";
    } else {
      toast.error(data.message || "Signup failed");
    }
  } catch (err) {
    toast.error("Server error during signup");
  } finally {
    setLoading(false);
  }
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

  const isUnderage = () => {
  if (!formData.dateOfBirth) return false;
  const dob = new Date(formData.dateOfBirth);
  const age = new Date().getFullYear() - dob.getFullYear();
  return age < 18;
};

const captureLivePhoto = () => {
  const screenshot = webcamRef.current.getScreenshot();
  fetch(screenshot)
    .then(res => res.blob())
    .then(blob => setLivePhotoBlob(new File([blob], "live_photo.jpg", { type: blob.type })));
};

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${signupImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-black/60"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.h1 
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Join Our Artist Community
          </motion.h1>
          <motion.p 
            className="text-xl opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Showcase your talent and connect with clients who need your services.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                  }`}></div>}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              {getStepTitle()}
            </h2>

            <div className="bg-white rounded-lg shadow-lg p-8">
              {currentStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Step 1: Basic Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => {
                          // Only allow digits and limit to 10 characters
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: value });
                        }}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                          formData.phone && !/^\d{10}$/.test(formData.phone) 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300'
                        }`}
                        placeholder="9841234567 (exactly 10 digits)"
                        maxLength="10"
                      />
                    </div>
                    {formData.phone && !/^\d{10}$/.test(formData.phone) && (
                      <p className="mt-1 text-sm text-red-600">
                        Phone number must be exactly 10 digits
                      </p>
                    )}
                    {formData.phone && /^\d{10}$/.test(formData.phone) && (
                      <p className="mt-1 text-sm text-green-600">✅ Valid phone number</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Create a strong password"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Step 2: Artist Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Musician, Dancer, Artist"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <select
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="" disabled>Select a location</option>
                        <option value="Lalitpur">Lalitpur</option>
                        <option value="Kathmandu">Kathmandu</option>
                        <option value="Bhaktapur">Bhaktapur</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Live Photo Capture
                    </label>
                    <div className="border border-gray-300 rounded-md p-4">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={250}
                        height={200}
                        videoConstraints={{ facingMode: "user" }}
                        className="rounded-md border w-full"
                      />
                      <button
                        type="button"
                        onClick={captureLivePhoto}
                        className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition duration-150"
                      >
                        <ImagePlus className="inline h-4 w-4 mr-1" />
                        Capture Photo
                      </button>
                      {livePhotoBlob && (
                        <p className="text-green-600 text-sm mt-2">✅ Live photo captured</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handlePrevStep}
                      className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150"
                    >
                      Next Step
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Step 3: Citizenship & Verification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Citizenship Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.citizenshipNumber}
                      onChange={(e) => setFormData({ ...formData, citizenshipNumber: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter citizenship number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Citizenship Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setFormData({ ...formData, citizenshipImage: e.target.files[0] })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                    {formData.citizenshipImage && (
                      <p className="text-green-600 text-sm mt-2">✅ Citizenship image uploaded</p>
                    )}
                  </div>

                  {isUnderage() && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t pt-6 space-y-4"
                    >
                      <h3 className="text-lg font-medium text-gray-900">Guardian Information (Required for under 18)</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Guardian Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.guardianName}
                          onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Guardian's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Guardian Relation
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.guardianRelation}
                          onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g., Father, Mother, Guardian"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Guardian ID Document
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => setFormData({ ...formData, guardianIdDocument: e.target.files[0] })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                        {formData.guardianIdDocument && (
                          <p className="text-green-600 text-sm mt-2">✅ Guardian document uploaded</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={handlePrevStep}
                      className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </button>
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Send OTP & Continue
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Step 3: OTP Verification */}
                  <div className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-purple-600 mb-4" />
                    <p className="text-gray-600 mb-6">
                      We've sent a verification code to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-center text-lg tracking-widest"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                    />
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Verify & Complete Signup
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResendOtp}
                    disabled={cooldown > 0}
                    className="w-full text-sm text-purple-600 hover:text-purple-500 flex justify-center items-center gap-1 disabled:opacity-50 transition duration-150"
                  >
                    <Clock className="h-4 w-4" />
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full text-sm text-gray-600 hover:text-gray-500 flex justify-center items-center gap-1 transition duration-150"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to citizenship info
                  </button>
                </motion.div>
              )}

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition duration-150">
                    Login here
                    <ArrowRight className="inline h-4 w-4 ml-1" />
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArtistSignUpPage;









