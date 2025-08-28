import { X } from "lucide-react";


import { useUserStore } from "../../stores/useUserStore";
import { useChatStore } from "../../stores/useChatStore";
import { useState } from "react";
import { useEffect } from "react";
import axios from "../../lib/axios"
const ChatHeader = () => {
  const { selectedConversation, setSelectedConversation } = useChatStore();
  const { onlineUsers } = useUserStore();
  const authUser = useUserStore((state) => state.user);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    const otherMember = selectedConversation?.members?.find(
      (m)=> m.userId !== authUser._id 
    );

    const fetchUserInfo = async () => {
      if (!otherMember) return;
      try {
        let res;
        if (otherMember.role === "client") {
          res = await axios.get(`/clientprofile?id=${otherMember.userId}`);
          setOtherUser({
            ...otherMember,
            profilePicture: res.data?.profilePicture,
            username: res.data?.username || otherMember.username,
          });
        } else {
          res = await axios.get(`/users/${otherMember.userId}`);
          setOtherUser(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    };

    fetchUserInfo();
  }, [selectedConversation]);
  // });



  if (!otherUser) return null;
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={otherUser?.profilePicture?.url || otherUser?.profilePic || "/avatar.png"} alt={otherUser?.username || "User"} />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedConversation.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers?.includes(selectedConversation._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button onClick={() => setSelectedConversation(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;