import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import instance from "../../lib/axios";
import { useUserStore } from "../../stores/useUserStore";
import { useChatStore } from "../../stores/useChatStore";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
};

const ArtistChatPage = () => {
  const artist = useUserStore((state) => state.user);
  const socket = useUserStore((state) => state.socket);
  const setSocket = useUserStore((state) => state.setSocket);

  const setSelectedConversation = useChatStore((state) => state.setSelectedConversation);
  const selectedConversation = useChatStore((state) => state.selectedConversation);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artist?._id) return;

    if (!socket) {
      const newSocket = io("http://localhost:3000", {
        query: { userId: artist._id },
      });

      newSocket.on("connect", () => {
        console.log(" Socket connected:", newSocket.id);
        newSocket.emit("addUser", artist._id);
        console.log("📡 Emitted addUser:", artist._id);
      });

      setSocket(newSocket);
    } else {
      socket.emit("addUser", artist._id);
      console.log("📡 Emitted addUser:", artist._id);
    }
  }, [artist, socket, setSocket]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await instance.get(`/conversation/${artist._id}`);
        setConversations(res.data);
      } catch (err) {
        console.error(" Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    if (artist?._id) fetchConversations();
  }, [artist]);

  const clientsMap = new Map();
  conversations.forEach((convo) => {
    const client = convo.members.find((m) => m.userId !== artist._id);
    if (client && !clientsMap.has(client.userId)) {
      clientsMap.set(client.userId, {
        conversationId: convo._id,
        ...client,
      });
    }
  });
  const clients = Array.from(clientsMap.values());

  return (
    <div className="flex h-full min-h-screen
      bg-gradient-to-br from-indigo-200 via-blue-100 to-pink-100
      transition-colors duration-500"
    >
      <div className="w-64
        border-r border-indigo-200
        bg-white/70 backdrop-blur-md shadow-2xl
        flex flex-col
        transition-all duration-500"
        style={{ minWidth: "16rem", maxWidth: "16rem" }} 
      >
        <div className="flex items-center gap-2 p-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-400/80 to-blue-400/60">
          <span className="inline-block w-2 h-8 bg-pink-400 rounded-full"></span>
          <span className="font-bold text-xl text-white tracking-wide drop-shadow">Clients</span>
        </div>
        {loading ? (
          <div className="p-4 text-indigo-400">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="p-4 text-indigo-300">No clients found</div>
        ) : (
          <div className="flex-1 flex flex-col gap-2 p-2">
            {clients.map((client) => {
              const isActive =
                selectedConversation &&
                selectedConversation._id === client.conversationId;
              return (
                <div
                  key={`${client.conversationId}-${client.userId}`}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer
                    rounded-xl border border-transparent
                    transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-r from-indigo-200 via-blue-100 to-pink-100 border-indigo-400 shadow-lg scale-105"
                      : "hover:bg-indigo-100/60 hover:shadow-md"}
                  `}
                  onClick={() =>
                    setSelectedConversation({
                      _id: client.conversationId,
                      members: [
                        {
                          userId: client.userId,
                          username: client.username,
                          role: client.role,
                          profilePic: client.profilePic,
                        },
                        {
                          userId: artist._id,
                          username: artist.username,
                          role: artist.role,
                          profilePic: artist.profilePic,
                        },
                      ],
                    })
                  }
                >
                  {client.profilePic ? (
                    <img
                      src={client.profilePic}
                      alt="avatar"
                      className={`w-11 h-11 rounded-full border-2 object-cover shadow
                        ${isActive ? "border-indigo-500 ring-2 ring-pink-400" : "border-indigo-200"}
                      `}
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-300 to-pink-200 text-indigo-900 font-bold text-lg shadow
                        ${isActive ? "ring-2 ring-pink-400" : ""}
                      `}
                    >
                      {getInitials(client.username)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate text-base ${isActive ? "text-indigo-700" : "text-indigo-900"}`}>
                      {client.username || "Unnamed Client"}
                    </p>
                    <span className="text-xs text-indigo-400">{client.role}</span>
                  </div>
                  {isActive && (
                    <span className="ml-auto w-2.5 h-2.5 rounded-full bg-pink-400 shadow" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 h-full flex flex-col
        bg-white/80 backdrop-blur-lg border border-indigo-100 shadow-xl
        transition-all duration-500"
      >
        {selectedConversation ? <ChatContainer /> : <NoChatSelected />}
      </div>
    </div>
  );
};

export default ArtistChatPage;
