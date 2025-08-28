
// controllers/notification.controller.js
import Notification from "../models/Notification.model.js";

// Fetch notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const { type = "all", page = 1, limit = 10 } = req.query;

    const query = {
      userId: req.user._id,
      // userType: req.user.role,
    };
    
    // Handle special filter cases
    if (type !== "all") {
      if (type === "cancellation") {
        // For cancellation filter, match both cancellation-related types
        query.type = { 
          $in: ["booking_cancellation_request", "booking_cancellation_approval"] 
        };
      } else {
        // For other filters, exact match
        query.type = type;
      }
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      notifications,
      hasMore: page * limit < total,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};


// Mark notification as read with authorization check
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    // Only allow user owning notification to mark as read
    if (
      notification.userId.toString() !== req.user._id.toString() 
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// Create a new notification
export const createNotification = async ({ userId, userType, message, type }) => {
  return await Notification.create({ userId, userType, message, type });
};

export const createNotificationAndEmit = async (data) => {
  const notification = await createNotification(data);
  if (global.io) {
    global.io.to(data.userId.toString()).emit("notification", notification);
  }
  return notification;
};
