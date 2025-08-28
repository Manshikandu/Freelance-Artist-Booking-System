import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        senderRole: {
            type: String,
            enum: ["client","artist"],
            required: true,
        },
        receiverId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        receiverRole: {
            type: String,
            enum: ["client","artist"],
            required: true,
        },
        text: {
            type: String,
        },
        image:
        {
            type: String,
        },
    },
    {
        timestamps:true
    }
);

const ChatApp = mongoose.model("ChatApp", chatSchema);
export default ChatApp;