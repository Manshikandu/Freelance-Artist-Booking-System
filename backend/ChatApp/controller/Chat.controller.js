// import ChatApp from "../model/Chat.model.js"; 
// // import cloudinary from "cloudinary";


// export const getMessages = async (req, res) => {
//   try {
//     const { conversationId } = req.params;

//     const messages = await ChatApp.find(
//         { conversationId }).sort({ createdAt: 1 }
//     );

//     // Convert senderId and receiverId to strings for all messages
//     const messagesWithStringIds = messages.map(msg => ({
//       ...msg._doc,
//       senderId: msg.senderId?.toString(),
//       receiverId: msg.receiverId?.toString(),
//     }));

//     res.status(200).json(messagesWithStringIds);
//   } catch (error) {
//     console.log("Error in getMessages controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


// // export const sendMessage = async (req, res) => {
// //   try {
// //     const { conversationId, senderId, senderRole, receiverId, receiverRole, text } = req.body;

// //     // let imageUrl;
// //     // if (image) {
// //     //   const uploaded = await cloudinary.uploader.upload(image);
// //     //   imageUrl = uploaded.secure_url;
// //     // }

// //     const newMessage = new ChatApp({
// //       conversationId,
// //       senderId,
// //       senderRole,
// //       receiverId,
// //       receiverRole,
// //       text,
// //       // image: imageUrl,
// //     });

// //     await newMessage.save();

// //     const receiverSocketId = getReceiverSocketId(receiverId);
// //     console.log("Receiver socket ID:", receiverSocketId);
// //         if (receiverSocketId) {
// //             io.to(receiverSocketId).emit("newMessage", newMessage);
// //         }


// //     res.status(201).json(newMessage);
// //   } catch (error) {
// //     console.log("Error in sendMessage:", error.message);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // };

// //updated 1
// // export const sendMessage = async (req, res) => {
// //   try {
// //     const { conversationId, senderId, senderRole, receiverId, receiverRole, text } = req.body;

// //     const newMessage = new ChatApp({
// //       conversationId,
// //       senderId,
// //       senderRole,
// //       receiverId,
// //       receiverRole,
// //       text,
// //     });

// //     await newMessage.save();

// //     // ✅ send to all sockets of receiver
// //     const receiverSocketIds = getReceiverSocketIds(receiverId);
// //     console.log("Receiver socket IDs:", receiverSocketIds);

// //     receiverSocketIds.forEach((id) => {
// //       io.to(id).emit("newMessage", newMessage);
// //     });

// //     res.status(201).json(newMessage);
// //   } catch (error) {
// //     console.log("Error in sendMessage:", error.message);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // };


import ChatApp from "../model/Chat.model.js"; 
// import cloudinary from "cloudinary";


export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await ChatApp.find({ conversationId }).sort({ createdAt: 1 });
    // Convert senderId and receiverId to strings for all messages
    const messagesWithStringIds = messages.map(msg => ({
      ...msg._doc,
      senderId: msg.senderId?.toString(),
      receiverId: msg.receiverId?.toString(),
    }));
    res.status(200).json(messagesWithStringIds);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, senderRole, receiverId, receiverRole, text, image } = req.body;
    const newMessage = new ChatApp({
      conversationId,
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      text,
      image,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deleted = await ChatApp.findByIdAndDelete(messageId);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.log("Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
