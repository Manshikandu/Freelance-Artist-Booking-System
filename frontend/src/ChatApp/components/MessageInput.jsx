import {useState, useRef} from "react";
import { useChatStore } from "../../stores/useChatStore";
import { useUserStore } from "../../stores/useUserStore";
import toast from "react-hot-toast";
import { Send, Image, X } from "lucide-react";
import instance from "../../lib/axios";
const MessageInput = () =>
{
    const [text, setText] = useState("");
    const [imagePreview,setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const {sendMessage, selectedConversation} = useChatStore();
    const authUser = useUserStore((state) => state.user);
    const socket = useUserStore((state) => state.socket);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(!file.type.startsWith("image/"))
        {
            toast.error("Please Select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if(fileInputRef.current) 
        {
            fileInputRef.current.value = "";
        }
    }

   

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim() && !imagePreview) return;

  if (!selectedConversation || !authUser) {
    toast.error("Missing user or conversation");
    return;
  }

  const receiver = selectedConversation.members.find(
    (member) => String(member.userId) !== String(authUser._id)
  );

  if (!receiver) {
    toast.error("Receiver info missing");
    return;
  }

  const messagePayload = {
    conversationId: selectedConversation._id,
    senderId: authUser._id,
    senderRole: authUser.role,
    receiverId: receiver.userId,
    receiverRole: receiver.role,
    text: text.trim(),
    image: imagePreview,
  };

  try {
    socket.emit("sendMessage", {
      ...messagePayload,
      createdAt: new Date(), 
    });
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (err) {
    toast.error("Failed to send message");
    console.error(err);
  }
};



    return(
        <div className="p-2 w-full">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button 
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                            flex items-center justify-center"
                            type="button"
                            >
                            <X className="size-3" />
                            
                        </button>
                    </div>
                </div>
            )}

            <form action="" onSubmit={handleSendMessage} className="flex  items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <input type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type a message...."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                    type="button"
                    className={`hidden sm:flex btn btn-circle
                            ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Image size={20} />
                </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && !imagePreview}
                    >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};
// }
export default MessageInput;