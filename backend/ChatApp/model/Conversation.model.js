import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema({
    members: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            role:{
                type: String,
                enum: ["client", "artist"],
                required: true,
            },
        }
    ]
},
{timestamps: true}
);
// Optional index for faster lookup and to help avoid duplicates
conversationSchema.index({ "members.userId": 1, "members.role": 1 }),
{ unique : false}


const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;