


import React from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className="flex items-center gap-2 border p-2 rounded cursor-pointer w-full bg-white"
  >
    <Calendar className="w-5 h-5 text-gray-500" />
    <span>{value || "Select a date"}</span>
  </div>
));

const formatTime = (input) => {
  if (!input) return "N/A";

  if (input.includes("T")) {
    const date = new Date(input);
    if (isNaN(date)) return "Invalid Time";
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  const [hourStr, minuteStr] = input.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};


const BookedDatesCalendar = ({
  bookedSlots = [],
  selectedDate,
  onDateChange,
  inline = false,
  minDate = new Date(),
  placeholder = "Select a date",
}) => {
  const getDayClass = (date) => {
    const matches = bookedSlots.filter(
      (slot) => new Date(slot.eventDate).toDateString() === date.toDateString()
    );

    const hasBooked = matches.some((slot) => slot.status === "booked");
    const hasAccepted = matches.some((slot) => slot.status === "accepted");

    if (hasBooked) return "bg-red-300 text-white rounded-full";
    if (hasAccepted) return "bg-yellow-300 text-black rounded-full";
    return "";
  };

  const slotsForSelectedDate = bookedSlots.filter(
    (slot) =>
      new Date(slot.eventDate).toDateString() === selectedDate.toDateString() &&
      ["booked", "accepted"].includes(slot.status)
  );

  return (
    <>
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        dayClassName={getDayClass}
        minDate={minDate}
        placeholderText={placeholder}
        calendarClassName="z-50"
        {...(inline ? { inline: true } : { customInput: <CustomDateInput /> })}
      />

      {inline && (
        <div className="mt-3 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2 text-purple-700">
            Slots on {selectedDate.toDateString()}
          </h3>
          {slotsForSelectedDate.length === 0 ? (
            <p className="text-gray-500 text-xs">No booked slots for this date.</p>
          ) : (
            <ul className="list-disc list-inside text-sm">
              {slotsForSelectedDate.map((slot) => (
                <li
                  key={slot._id}
                  className={`px-2 py-1 rounded-lg my-1 ${
                    slot.status === "booked"
                      ? "bg-red-400 text-white"
                      : "bg-yellow-300 text-black"
                  }`}
                >
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)} → {slot.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

export default BookedDatesCalendar;
