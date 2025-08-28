import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../lib/axios';
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/api";

export const useUserStore = create(
  persist(
    (set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    selectedConversation: null,
    socket: null,
    setSelectedConversation: (conv) => set({ selectedConversation: conv }),

       setUser: (user) => set({ user }),

      clientSignup: async ({ username, email, phone, password }) => {
        set({ loading: true });

        if (!username || !email || !phone || !password) {
          set({ loading: false });
          throw new Error("All fields are required");
        }

        try {
          const res = await axios.post("/auth/clientSignup", {
            username,
            email,
            phone,
            password,
          });

          // set({ user: res.data, loading: false });
          set({ user: res.data.user, loading: false });
          return res.data;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || "Signup failed");
        }
      },

      artistSignup: async ({ username, email, phone, password, category, location }) => {
        set({ loading: true });

        if (!username || !email || !phone || !password || !category || !location) {
          set({ loading: false });
          throw new Error("All fields are required");
        }

        try {
          const res = await axios.post("/auth/artistSignup", {
            username,
            email,
            phone,
            password,
            category,
            location,
          });

          // set({ user: res.data, loading: false });
          set({ user: res.data.user, loading: false });
          return res.data;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || "Signup failed");
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await axios.post("/auth/login", { email, password },{withCredentials:true});
          set({ user: res.data.user, loading: false });
          return res.data.user;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || "Login failed");
        }
      },

      logout: async () => {
        try {
          await axios.post("/auth/logout");
          set({ user: null });
        } catch (error) {
          throw new Error(error.response?.data?.message || "Logout failed");
        }
      },

      // checkAuth: async () => {
      //   set({ checkingAuth: true });
      //   try {
      //     const res = await axios.get("/auth/profile");
      //     set({ user: res.data, checkingAuth: false });
      //   } catch (error) {
      //     set({ checkingAuth: false, user: null });
      //   }
      // },

      connectSocket: () => {
        const { user, socket } = get();
        if (!user || socket) return;
        const socketInstance = io(BASE_URL, {
          query: { userId: user._id },
        });
        socketInstance.on("connect", () => {
          console.log(" Socket connected", socketInstance.id);
        });
        set({ socket: socketInstance });
        socketInstance.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
        console.log(" Socket connected for user:", user._id);
      },
      setSocket: (socketInstance) => set({ socket: socketInstance }),
    }),
    {
      name: "user-store", // localStorage key
      partialize: (state) => ({
        user: state.user,
        selectedConversation: state.selectedConversation,
      }),
    }
  )
);

