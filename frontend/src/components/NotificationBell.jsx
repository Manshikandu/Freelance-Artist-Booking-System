import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { io } from "socket.io-client";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const NotificationBell = () => {
  const user = useUserStore((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newNotification, setNewNotification] = useState(false);
  const dropdownRef = useRef(null);
  const socket = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/notifications", {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Error fetching notifications:", await res.text());
        setNotifications([]);
        return;
      }

      const data = await res.json();

      if (!data || !Array.isArray(data.notifications)) {
        console.error("Expected notifications array but got:", data);
        setNotifications([]);
        return;
      }

      setNotifications(data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setNotifications([]);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // Set up socket and fetch notifications
  useEffect(() => {
    if (!user?._id) return;

    fetchNotifications();

    socket.current = io("http://localhost:3000");
    socket.current.emit("join", user._id);

    socket.current.on("notification", (data) => {
      console.log("New Notification:", data);
      fetchNotifications();
      toast.success(data.message || "You have a new notification!", {
        duration: 3000,
        position: "top-right",
      });
      setNewNotification(true);
      setTimeout(() => setNewNotification(false), 1000);
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [user?._id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!Array.isArray(notifications)) {
    return <div>Loading notifications...</div>;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-200 transition"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Notifications"
      >
        <Bell className="text-purple-300" size={22} />
        {unreadCount > 0 && (
          <span
            className={`absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center
              transition-transform duration-300 ease-in-out
              ${newNotification ? "scale-125 animate-pulse" : ""}
            `}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-md border rounded z-50 max-h-80 flex flex-col">
          <ul className="overflow-y-auto max-h-64 flex-grow">
            {notifications.length === 0 ? (
              <li className="p-3 text-gray-500 text-sm text-center">
                No notifications
              </li>
            ) : (
              notifications.slice(0, 5).map((note) => (
                <li
                  key={note._id}
                  onClick={() => {
                    markAsRead(note._id);
                    setDropdownOpen(false);
                    if (note.type === "booking") {
                      // Navigate based on user role
                      if (user?.role === "client") {
                        navigate("/my-bookings");
                      } else if (user?.role === "artist") {
                        navigate("/artist-bookings");
                      } else {
                        navigate("/my-bookings"); // Fallback
                      }
                    } else if (note.type === "contract") {
                      if (note.contractUrl) {
                        window.open(note.contractUrl, "_blank");
                      } else {
                        // Navigate based on user role
                        if (user?.role === "client") {
                          navigate("/my-bookings");
                        } else if (user?.role === "artist") {
                          navigate("/artist-bookings");
                        } else {
                          navigate("/contracts"); // Fallback
                        }
                      }
                    } else if (note.type === "payment") {
                      // If we have a specific booking ID, navigate to booking details
                      if (note.bookingId) {
                        navigate(`/booking/${note.bookingId}`);
                      } else {
                        // Fallback to bookings page where users can see payment status
                        if (user?.role === "client") {
                          navigate("/my-bookings");
                        } else if (user?.role === "artist") {
                          navigate("/artist-bookings");
                        } else {
                          navigate("/my-bookings"); // Fallback
                        }
                      }
                    } else if (note.type === "review") {
                      if (note.artistId) {
                        navigate(`/artist/${note.artistId}`);
                      } else {
                        navigate("/reviews");
                      }
                    } else {
                      navigate("/notifications");
                    }
                  }}
                  className={`p-3 text-sm cursor-pointer hover:bg-gray-100 ${
                    !note.isRead ? "font-semibold bg-blue-50" : ""
                  }`}
                >
                  {note.message}
                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(note.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </li>
              ))
            )}
          </ul>

          <div
            onClick={() => {
              setDropdownOpen(false);
              navigate("/notifications");
            }}
            className="p-2 text-center text-purple-600 hover:bg-gray-100 cursor-pointer border-t"
          >
            View All Notifications
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
