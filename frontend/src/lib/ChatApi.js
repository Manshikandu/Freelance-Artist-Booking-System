import instance from "./axios";

export const createOrGetConversation = async (senderId, senderRole, receiverId, receiverRole) => {
    const res = await instance.post("/conversation", {
        senderId,
        senderRole,
        receiverId,
        receiverRole
    });
    return res.data;
}


