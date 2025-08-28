function idEquals(a, b) {
	if (!a || !b) return false;
	return String(a) === String(b);
}
import { useChatStore } from "../../stores/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "../../stores/useUserStore";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../../lib/utils";
import { UserRound, Trash2 } from "lucide-react";
import axios from "../../lib/axios";
import instance from "../../lib/axios";
const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedConversation,
    subscribeToMessages,
    unsubscribeFromMessages,
    addMessage,
    userProfiles
  } = useChatStore();

  const authUser = useUserStore((state) => state.user);
  const socket = useUserStore((state) => state.socket);
  const connectSocket = useUserStore((state) => state.connectSocket);

  const messageEndRef = useRef(null);
  const [clientProfileCache, setClientProfileCache] = useState({});

  useEffect(() => {
    if (authUser && !socket) {
      connectSocket();
    }
  }, [authUser, socket, connectSocket]);

  // Fetch messages & subscribe to new messages when conversation changes
  useEffect(() => {
    if (!selectedConversation?._id) return;
    console.log("Loading messages for conversation ID:", selectedConversation._id);
    getMessages(selectedConversation._id);

    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedConversation?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => addMessage(msg);
    const handleMessageSent = (msg) => addMessage(msg);

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleMessageSent);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
    };
  }, [socket, addMessage]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await instance.delete(`/chat/message/${messageId}`); // <-- use "chats" here
      useChatStore.getState().deleteMessage(messageId);
    } catch (err) {
      alert("Failed to delete message");
      console.error(err);
    }
  };

  useEffect(() => {
    if (!selectedConversation) return;
    const missingClientIds = messages
      .map((msg) => {
        const sender = selectedConversation.members?.find(m => m.userId === msg.senderId);
        if (
          sender &&
          sender.role === "client" &&
          !clientProfileCache[msg.senderId]
        ) {
          return msg.senderId;
        }
        return null;
      })
      .filter(Boolean);

    missingClientIds.forEach((clientId) => {
      // Avoid duplicate requests
      if (clientProfileCache[clientId]) return;
      axios.get(`/clientprofile?id=${clientId}`).then(res => {
        if (res.data?.profilePicture?.url) {
          setClientProfileCache(prev => ({ ...prev, [clientId]: res.data.profilePicture.url }));
        }
      });
    });
  }, [messages, selectedConversation, clientProfileCache]);

  const getProfilePic = (senderId) => {
    if (idEquals(senderId, authUser._id)) {
      return authUser.profilePicture?.url || authUser.avatar || null;
    }
    const profile = userProfiles[senderId];
    if (profile) {
      return profile.profilePicture?.url || profile.avatar || null;
    }
    if (clientProfileCache[senderId]) {
      return clientProfileCache[senderId];
    }
    const sender = selectedConversation?.members?.find(m => m.userId === senderId);
    if (sender && !clientProfileCache[senderId]) {
      axios.get(`/clientprofile?id=${senderId}`).then(res => {
        if (res.data?.profilePicture?.url) {
          setClientProfileCache(prev => ({ ...prev, [senderId]: res.data.profilePicture.url }));
        } else if (res.data?.avatar) {
          setClientProfileCache(prev => ({ ...prev, [senderId]: res.data.avatar }));
        }
      });
    }
    return null;
   };

  if (isMessagesLoading || !selectedConversation) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!authUser || !selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-400">No conversation selected</p>
      </div>
    );
  }

		console.log('authUser._id:', authUser?._id, 'type:', typeof authUser?._id);
		messages.forEach((msg, idx) => {
			
      console.log(
  `msg[${idx}].senderId:`, msg.senderId,
  '| authUser._id:', authUser._id,
  '| senderId.length:', msg.senderId.length,
  '| authUser._id.length:', authUser._id.length,
  '| idEquals:', idEquals(msg.senderId, authUser._id)
);
console.log([...msg.senderId].map(c => c.charCodeAt(0)));
console.log([...authUser._id].map(c => c.charCodeAt(0)));
		});

	return (
		<div className="flex flex-col h-full w-full">
			<div className="flex-1 overflow-y-auto p-4 space-y-2 w-full">
				{messages.map((message, index) => {
					const isMe = idEquals(message.senderId, authUser._id);
					return (
						<div
							key={message._id || index}
							className={`chat ${isMe ? "chat-end" : "chat-start"}`}
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "column",
								alignItems: isMe ? "flex-end" : "flex-start",
							}}
							ref={index === messages.length - 1 ? messageEndRef : null}
						>
							<div className="flex items-end gap-2 max-w-[80vw]">
								<div className="chat-image avatar flex-shrink-0">
									<div className="size-10 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100">
										{isMe ? (
											authUser.profilePicture?.url || authUser.avatar ? (
												<img
													src={authUser.profilePicture?.url || authUser.avatar}
													alt="profile"
													className="object-cover w-full h-full"
												/>
											) : (
												<UserRound className="w-5 h-5 text-gray-500" />
											)
										) : getProfilePic(message.senderId) ? (
											<img
												src={getProfilePic(message.senderId)}
												alt="profile"
												className="object-cover w-full h-full"
											/>
										) : (
											<UserRound className="w-5 h-5 text-gray-500" />
										)}
									</div>
								</div>
								<div className="flex flex-col items-start relative">
									<div
										className={`chat-bubble flex flex-col ${isMe ? "items-end" : "items-start"}`}
									>
										{message.image && (
											<img
												src={message.image}
												alt="Attachment"
												className="sm:max-w-[200px] rounded-md mb-2"
											/>
										)}
										{message.text && (
											<p>{message.text}</p>
										)}
									</div>
								</div>
								{isMe && message._id && (
									<button
										className="ml-1 text-red-400 hover:text-red-600"
										title="Delete message"
										onClick={() => handleDeleteMessage(message._id)}
										style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
									>
										<Trash2 size={16} />
									</button>
								)}
							</div>
							<span
								className={`msg-time block mt-1 text-xs ${
									isMe ? "text-right pr-12" : "text-left pl-12"
								}`}
								style={{ color: "#bdbdbd" }}
							>
								{formatMessageTime(message.createdAt)}
							</span>
						</div>
					);
				})}
			</div>
			<div className="border-t bg-base-100">
				<MessageInput />
			</div>
		</div>
	);
};
export default ChatContainer;