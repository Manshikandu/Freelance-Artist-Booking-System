
import { create } from "zustand";
import { persist } from "zustand/middleware";
import instance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "./useUserStore";

export const useChatStore = create(
  persist(
    (set, get) => ({
      selectedConversation: null,
      messages: [],
      isMessagesLoading: false,
      userProfiles: {},
      setSelectedConversation: (conv) => set({ selectedConversation: conv }),

      getMessages: async (conversationId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await instance.get(`/chat/${conversationId}`);
          set({ messages: res.data });

          const authUser = useUserStore.getState().user;
          if (!authUser) {
            return;
          }
          const authUserId = authUser._id;
          const senderIds = [...new Set(res.data.map(m => m.senderId).filter(id => id !== authUserId))];
          get().fetchUserProfiles(senderIds);

        } catch (error) {
          toast.error("Failed to fetch messages");
          console.error(error);
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      addMessage: (message) => {
        const { messages } = get();
        const exists = messages.some((m) => m._id === message._id);
        if (!exists) set({ messages: [...messages, message] });

         const { userProfiles } = get();
          if (!userProfiles[message.senderId]) {
            get().fetchUserProfiles([message.senderId]);
          }
        
      },

      fetchUserProfiles: async (userIds) => {
        const { userProfiles } = get();
        const missingIds = userIds.filter((id) => !userProfiles[id]);

        if (missingIds.length === 0) return;

        try {
          const res = await instance.post(`/users/profiles`, { ids: missingIds });
          const newProfiles = {};
          res.data.forEach((user) => {
            newProfiles[user._id] = user;
          });
          set({ userProfiles: { ...userProfiles, ...newProfiles } });
        } catch (err) {
          console.error("Error fetching user profiles:", err);
        }
      },

      subscribeToMessages: () => {
        const socket = useUserStore.getState().socket;
        const { selectedConversation } = get();
        if (!socket || !selectedConversation) return;

        socket.on("receiveMessage", (msg) => {
          if (
            msg.conversationId?.toString() === selectedConversation._id?.toString()
          ) {
            get().addMessage(msg);
          }
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useUserStore.getState().socket;
        if (socket) socket.off("receiveMessage");
      },

      deleteMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((m) => m._id !== messageId)
        }));
      },
    }),
    {
      name: "chat-storage", 
      partialize: (state) => ({
        selectedConversation: state.selectedConversation,
      }),
    }
  )
);


