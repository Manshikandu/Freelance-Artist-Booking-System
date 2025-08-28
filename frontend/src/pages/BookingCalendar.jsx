
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';


const BookingCalendar = () => {
  const [bookedDates, setBookedDates] = useState([]);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await axios.get('/api/calendar/booked-dates', {
          withCredentials: true, // if using cookies
        });

        const dates = res.data.bookedDates.map(item => {
          const date = new Date(item.date);
          // Normalize to remove time component for comparison
          return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
        });

        setBookedDates(dates);
      } catch (err) {
        console.error('Error fetching booked dates:', err);
      }
    };

    fetchBookedDates();
  }, []);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
      if (bookedDates.includes(d)) {
        return 'booked'; // apply custom CSS class
      }
    }
    return null;
  };

  return (
    <div>
      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={tileClassName}
      />
      <p>Selected date: {value.toDateString()}</p>
    </div>
  );
};


export default BookingCalendar;