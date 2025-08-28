import Conversation from "../model/Conversation.model.js";
import Artist from "../../models/Artist.model.js";
import Client from "../../models/user.model.js";
import ClientProfile from "../../models/ClientProfile.model.js"; // <-- Add this import
import Message from "../model/Chat.model.js"
export const createOrGetConversation = async (req, res) => {
  try {
    console.log(" createOrGetConversation:", req.body);
    const { senderId, senderRole, receiverId, receiverRole } = req.body;

    let conversation = await Conversation.findOne({
      // members: {
        // $all: [
        //   { userId: senderId, role: senderRole },
        //   { userId: receiverId, role: receiverRole },
        // ],
      $and: [
    { members: { $elemMatch: { userId: senderId,   role: senderRole   } } },
    { members: { $elemMatch: { userId: receiverId, role: receiverRole } } },
  ],

      })

  //       $and: [
  //       { members: { $elemMatch: { userId: senderId, role: senderRole } } },
  //       { members: { $elemMatch: { userId: receiverId, role: receiverRole } } }
  // ],
    // });

    if (!conversation) {
      conversation = new Conversation({
        members: [
          { userId: senderId, role: senderRole },
          { userId: receiverId, role: receiverRole },
        ],
      });

      await conversation.save();
    }

    const populatedMembers = await Promise.all(
      conversation.members.map(async (m) => {
        const model = m.role === "client" ? Client : Artist;
        const user = await model.findById(m.userId);

        // Fetch client profile if role is client
        let profilePic = "";
        if (m.role === "client") {
          const clientProfile = await ClientProfile.findOne({ userId: m.userId });
          profilePic = clientProfile?.profilePicture?.url || user?.profilePicture?.url || "";
        } else {
          profilePic = user?.profilePicture?.url || "";
        }

        return {
          userId: m.userId,
          role: m.role,
          username: user?.username || "Unknown",
          profilePic,
        };
      })
    );

    res.status(200).json({
      _id: conversation._id,
      members: populatedMembers,
      createdAt: conversation.createdAt,
    });

    // res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in createOrGetConversation controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({
      "members.userId": userId,
    });

    const filteredConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const messageCount = await Message.countDocuments({ conversationId: conversation._id });
        return messageCount > 0 ? conversation : null;
      })
    );

    const validConversations = filteredConversations.filter(Boolean);

    const populatedConversations = await Promise.all(
      validConversations.map(async (conversation) => {
        const populatedMembers = await Promise.all(
          conversation.members.map(async (m) => {
            const model = m.role === "client" ? Client : Artist;
            const user = await model.findById(m.userId);

            // Fetch client profile if role is client
            let profilePic = "";
            if (m.role === "client") {
              const clientProfile = await ClientProfile.findOne({ userId: m.userId });
              profilePic = clientProfile?.profilePicture?.url || user?.profilePicture?.url || "";
            } else {
              profilePic = user?.profilePicture?.url || "";
            }

            return {
              userId: m.userId,
              role: m.role,
              username: user?.username || "Unknown",
              profilePic,
            };
          })
        );

        return {
          _id: conversation._id,
          members: populatedMembers,
          createdAt: conversation.createdAt,
        };
      })
    );

    res.status(200).json(populatedConversations);


    // res.status(200).json(conversations);
  } catch (error) {
    console.log("Error in getUserConversations:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
