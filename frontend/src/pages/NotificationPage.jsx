

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const NotificationsPage = () => {
  const user = useUserStore((state) => state.user);

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/notifications?type=${filter}&page=${page}&limit=${limit}`,
        {
           credentials: "include", 
        }
      );
      const data = await res.json();
      if (page === 1) setNotifications(data.notifications);
      else setNotifications((prev) => [...prev, ...data.notifications]);

      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [filter, page, limit]);

  const markAllAsRead = async () => {
    for (let n of notifications.filter((n) => !n.isRead)) {
      await fetch(`http://localhost:3000/api/notifications/${n._id}/read`, {
        method: "PUT",
        credentials: "include", 
      });
    }
    fetchNotifications();
  };

  const goToDetails = (note) => {
    if (note.type === "booking") navigate("/my-bookings");
    else if (note.type === "contract") {
      // Navigate based on user role
      if (user?.role === "client") {
        navigate("/my-bookings");
      } else if (user?.role === "artist") {
        navigate("/artist-booking");
      } else {
        navigate("/contracts"); // Fallback
      }
    }
    else if (note.type === "payment") {
      // navigate to booking details
      if (note.bookingId) {
        navigate(`/booking/${note.bookingId}`);
      } else {
        // Fallback to bookings page 
        navigate("/my-bookings");
      }
    }
    else if (note.type === "review") {
      // Navigate to reviews or artist profile if artistId is available
      if (note.artistId) {
        navigate(`/artist/${note.artistId}`);
      } else {
        navigate("/my-bookings"); // Fallback to bookings where reviews might be visible
      }
    }
    else if (note.type === "booking_cancellation_request" || note.type === "booking_cancellation_approval") {
      if (note.bookingId) {
        navigate(`/booking/${note.bookingId}`);
      } else {
        navigate("/my-bookings");
      }
    }
  };

  useEffect(() => {
    setPage(1); // reset on filter change
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 flex items-center text-purple-600 hover:text-black transition-colors bg-purple-200 p-2 rounded font-semibold"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={markAllAsRead}
        >
          Mark All as Read
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        {["all", "booking", "contract", "payment", "review", "cancellation"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-full capitalize ${
              filter === type
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <div className="text-gray-500 text-center mt-20">No notifications.</div>
      ) : (
        <ul className="divide-y">
          {notifications.map((note) => (
            <li
              key={note._id}
              onClick={() => goToDetails(note)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                !note.isRead ? "bg-blue-50 font-semibold" : ""
              }`}
            >
              <div>{note.message}</div>
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
