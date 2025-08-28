


import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "../components/ui/Button";
import { BookCard, BookCardContent } from "../components/ui/BookCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import BookedDatesCalendar from "../components/BookedDatesCalendar";
import MapPicker from "../components/MapPicker";
import { toast } from "react-hot-toast";


const steps = ["Set date", "Set Location", "Details", "Event Details", "Done"];

function combineDateAndTime(date, time) {
  const combined = new Date(date);
  combined.setHours(time.getHours());
  combined.setMinutes(time.getMinutes());
  combined.setSeconds(time.getSeconds());
  combined.setMilliseconds(time.getMilliseconds());
  return combined;
}


const ArtistBookingForm = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 30 * 60 * 1000), 
    location: "",
    coordinates: null,
    eventType: "",
    eventDetails: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]); 

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const artistId = params.get("artistId");
    if (artistId) {
      setSelectedArtistId(artistId);
      fetchBookedSlots(artistId);
    }
  }, [location.search]);

  const fetchBookedSlots = async (artistId) => {
    try {
     const res = await fetch(`http://localhost:3000/api/bookings/artist/${artistId}/booked-slots`, {
  credentials: "include",
});

      const data = await res.json();
      if (res.ok && data.bookedSlots) {
        setBookedSlots(data.bookedSlots);
      }
    } catch (error) {
      console.error("Failed to fetch booked slots:", error);
    }
  };

  const slotsForSelectedDate = bookedSlots.filter((slot) => {
    const slotDate = new Date(slot.eventDate);
    const selDate = formData.date;
    return (
      slotDate.getFullYear() === selDate.getFullYear() &&
      slotDate.getMonth() === selDate.getMonth() &&
      slotDate.getDate() === selDate.getDate()
    );
  });

  const isTimeOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  const handleStartTimeChange = (newStartTime) => {
    if (!newStartTime) return;
      const newStart = combineDateAndTime(formData.date, newStartTime).getTime();
      const end = combineDateAndTime(formData.date, formData.endTime).getTime();



    const BUFFER_MS = 30 * 60 * 1000;

    const conflict = slotsForSelectedDate.some((slot) => {
      const bookedStart = new Date(slot.startTime).getTime() - BUFFER_MS;
      const bookedEnd = new Date(slot.endTime).getTime() + BUFFER_MS;
      return isTimeOverlap(newStart, end, bookedStart, bookedEnd);
    });

    if (conflict) {
      toast.error("Selected time conflicts with an existing booking. Please choose another time.");
      return;
    }

    setFormData((prev) => ({ ...prev, startTime: newStartTime }));
  };

  const handleEndTimeChange = (newEndTime) => {
    if (!newEndTime) return;
    const start = combineDateAndTime(formData.date, formData.startTime).getTime();
    const newEnd = combineDateAndTime(formData.date, newEndTime).getTime();


    if (newEnd <= start) {
      toast.error("End time must be after start time.");
      return;
    }

    const conflict = slotsForSelectedDate.some((slot) => {
      const bookedStart = new Date(slot.startTime).getTime();
      const bookedEnd = new Date(slot.endTime).getTime();
      return isTimeOverlap(start, newEnd, bookedStart, bookedEnd);
    });

    if (conflict) {
      toast.error("Selected time conflicts with an existing booking. Please choose another time.");
      return;
    }

    setFormData((prev) => ({ ...prev, endTime: newEndTime }));
  };

  const handleMapChange = async (coords) => {
  setFormData((prev) => ({ ...prev, coordinates: coords }));

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
    );

    const data = await response.json();

    if (data && data.display_name) {
      setFormData((prev) => ({
        ...prev,
        location: data.display_name,
      }));
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!formData.date) {
        toast.error("Please select a date.");
        return false;
      }

     
      const start = combineDateAndTime(formData.date, formData.startTime).getTime();
      const end = combineDateAndTime(formData.date, formData.endTime).getTime();

      if (start >= end) {
        toast.error("Start time must be before end time.");
        return false;
      }

      const conflict = slotsForSelectedDate.some((slot) => {
        const bookedStart = new Date(slot.startTime).getTime();
        const bookedEnd = new Date(slot.endTime).getTime();
        return isTimeOverlap(start, end, bookedStart, bookedEnd);
      });

      if (conflict) {
        toast.error("Selected time conflicts with an existing booking. Please choose another time.");
        return false;
      }
    }

    if (step === 1) {
      if (!formData.location?.trim()) {
        toast.error("Please set a location before proceeding.");
        return false;
      }
      if (!formData.coordinates) {
        toast.error("Please select a location on the map.");
        return false;
      }
    }

     if (step === 2) {
      if (!formData.eventType) {
        toast.error("Please enter the event type.");
        return false;
      }
    }

    if (step === 3) {
      if (!formData.name || !formData.email) {
        toast.error("Please enter your name and email.");
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address.");
        return false;
      }

      const phoneDigitsOnly = formData.phone.replace(/\D/g, "");
      if (phoneDigitsOnly.length !== 10) {
        toast.error("Phone number must have exactly 10 digits.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) setStep(step + 1);
    else submitForm();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const submitForm = async () => {
    if (!selectedArtistId) {
      toast.error("Artist ID is missing from URL. Please open this page from an artist profile.");
      return;
    }
    try {
      const startDateTime = combineDateAndTime(formData.date, formData.startTime);
      const endDateTime = combineDateAndTime(formData.date, formData.endTime);

      const bookingData = {
        artistId: selectedArtistId,
        eventDate: formData.date.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: formData.location,
        coordinates: formData.coordinates,
        contactName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        eventType: formData.eventType,
        eventDetails: formData.eventDetails,
        notes: formData.notes,
      };

      const response = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Booking request created!");
        setFormData({
          date: new Date(),
          startTime: new Date(),
          endTime: new Date(new Date().getTime() + 30 * 60 * 1000),
          location: "",
          coordinates: null,
          eventType: "",
          eventDetails: "",
          name: "",
          email: "",
          phone: "",
          notes: "",
        });
        navigate(`/artist/${selectedArtistId}`);
      } else {
        toast.error(result.message || "Failed to create booking.");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("An error occurred while submitting your booking.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-40 py-8 bg-gray-50">
      {/* back btn */}
        <button
      onClick={() => {
        if (selectedArtistId) {
          navigate(`/artist/${selectedArtistId}`);
        } else {
          navigate(-1); 
        }
      }}
      className="absolute top-4 left-4 flex items-center gap-2 bg-purple-100 text-purple-600  hover:bg-purple-200 shadow-md rounded-md px-3 py-1.5 font-medium transition duration-300 ease-in-out cursor-pointer select-none" title="Back to artist page"

    >
      <ArrowLeft size={24} />
      <span className="hidden sm:inline">Back</span>
    </button>

      <BookCard className="max-w-md mx-auto p-6 flex flex-col justify-between min-h-[620px]">
        <h2 className="text-2xl font-bold mb-6 text-center">Book an Artist</h2>

        {/* Step Progress Indicator */}
        <div className="relative mb-8">
          <div className="flex justify-between items-center relative z-10">
            {steps.map((label, index) => (
              <div key={index} className="flex-1 flex flex-col items-center relative">
                {index !== 0 && (
                  <div
                    className={`absolute top-2 left-0 h-0.5 ${
                      step >= index ? "bg-purple-800" : "bg-gray-300"
                    }`}
                    style={{ width: "50%" }}
                  ></div>
                )}
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-2 right-0 h-0.5 ${
                      step > index ? "bg-purple-700" : "bg-gray-300"
                    }`}
                    style={{ width: "50%" }}
                  ></div>
                )}
                <div
                  className={`w-4 h-4 rounded-full border-2 z-10 transition-colors duration-300 ${
                    step === index
                      ? "border-purple-700 bg-purple-700"
                      : step > index
                      ? "bg-purple-700 border-purple-700"
                      : "border-gray-300 bg-white"
                  }`}
                ></div>
                <span className="text-xs mt-2 text-center w-20 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <BookCardContent>
          
          {step === 0 && (
            <div className="flex gap-4 mb-6">
              <div className="flex-[2]">
                <label htmlFor="date" className="block mb-2">Date</label>
                <BookedDatesCalendar
                  bookedSlots={bookedSlots}
                  selectedDate={formData.date}
                  onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  minDate={new Date()}
                />
              
                {(() => {
                  const slotsForSelectedDate = bookedSlots.filter(
                    (slot) =>
                      new Date(slot.eventDate).toDateString() ===
                      formData.date.toDateString()
                  );

                  return slotsForSelectedDate.length > 0 ? (
                    <div className="mt-2 p-2 border rounded bg-gray-100 text-sm">
                      <div className="font-medium mb-1">
                        Slots for {formData.date.toDateString()}:
                      </div>
                      <ul className="space-y-1">
                        {slotsForSelectedDate.map((slot, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                slot.status === "booked"
                                  ? "bg-red-500"
                                  : "bg-yellow-400"
                              }`}
                            ></span>
                            {new Date(slot.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}{" "}
                            -{" "}
                            {new Date(slot.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}{" "}
                            ({slot.status})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* start time */}
              <div className="flex-1">
                <label htmlFor="startTime" className="block mb-2">
                  Start Time
                </label>
                <DatePicker
                  id="startTime"
                  selected={formData.startTime}
                  onChange={handleStartTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Start"
                  dateFormat="h:mm aa"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex-1">
                <label htmlFor="endTime" className="block mb-2">
                  End Time
                </label>
                <DatePicker
                  id="endTime"
                  selected={formData.endTime}
                  onChange={handleEndTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="End"
                  dateFormat="h:mm aa"
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          )}

          {/* Step 1 - Location & Map */}
          {step === 1 && (
            <div className="space-y-2">
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Event Location (auto-filled from map)"
              />
             <MapPicker
                value={formData.coordinates}
                onChange={handleMapChange}
              />

            </div>
          )}

        

          {/* Step 3 - Event Type and Details */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label htmlFor="eventType" className="block mb-2">
                  Event Type
                </label>
                <input
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label htmlFor="eventDetails" className="block mb-2">
                  Event Details
                </label>
                <input
                  id="eventDetails"
                  name="eventDetails"
                  value={formData.eventDetails}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          )}

           {/* Step 2 - Contact Info & Notes */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-2">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  placeholder="Enter your name"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="email" className="block mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    placeholder="Your email"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="phone" className="block mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4 - Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <strong>Date & Time:</strong>{" "}
                {formData.date ? formData.date.toLocaleDateString("en-US") : "-"} |{" "}
                {formData.startTime && formData.endTime
                  ? `${formData.startTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })} - ${formData.endTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}`
                  : "-"}
              </div>

              <div>
                <strong>Location:</strong> {formData.location || "-"}
              </div>

              <div>
                <strong>Contact Name:</strong> {formData.name || "-"}
              </div>
              <div>
                <strong>Email:</strong> {formData.email || "-"}
              </div>
              <div>
                <strong>Phone:</strong> {formData.phone || "-"}
              </div>

              <div>
                <strong>Event Type:</strong> {formData.eventType || "-"}
              </div>
              <div>
                <strong>Notes:</strong> {formData.notes || "-"}
              </div>
            </div>
          )}
        </BookCardContent>

        <div className="flex justify-between mt-6">
          <Button onClick={handleBack} disabled={step === 0} variant="secondary">
            Back
          </Button>
          <Button onClick={handleNext}>{step === steps.length - 1 ? "Submit" : "Next"}</Button>
        </div>
      </BookCard>

      {/* Illustration on the Right */}
      <div className="hidden md:flex justify-center items-center md:ml-10">
        <img
          src="/src/assets/book.png"
          alt="Artist Booking"
          className="w-[300px] lg:w-[400px] object-contain"
        />
      </div>
    </div>
  );
};

export default ArtistBookingForm;
