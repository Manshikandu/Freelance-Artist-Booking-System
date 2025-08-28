
import React, { useState, useEffect } from "react";
import { uploadMedia } from "../../components/utlis/UploadMedia";
import { useUserStore } from "../../stores/useUserStore";
import { Toaster, toast } from "react-hot-toast";

const Input = ({ label, value, onChange, type = "text", ...props }) => (
  <div className="mb-4">
    <label className="block mb-1 font-semibold text-sm text-gray-700">{label}</label>
    <input
      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      value={value}
      type={type}
      onChange={onChange}
      {...props}
    />
  </div>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Spinner = () => (
  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin inline-block" />
);

const ClientProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    contact: "",
    avatar: "",
    email: "",
    dob: "",
    address: "",
  });

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/clientprofile/get-profile?id=${user._id}`, { cache: "no-store" });
        const data = await res.json();

        if (data && data._id) {
          setProfile(data);
          setFormData({
            name: data.name || "",
            location: data.location || "",
            bio: data.bio || "",
            contact: data.contact || "",
            avatar: data.avatar || "",
            email: data.email || "",
            dob: data.dob ? data.dob.split("T")[0] : "",
            address: data.address || "",
          });
        } else {
          setFormData((prev) => ({ ...prev, name: user?.name || user?.username || "" }));
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Failed to fetch client profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user?._id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, avatar: url }));
      const res = await fetch("/api/clientprofile/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url, id: user._id }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        toast.success("Profile picture updated!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/clientprofile/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: user._id }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updated = await res.json();
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        location: profile.location || "",
        bio: profile.bio || "",
        contact: profile.contact || "",
        avatar: profile.avatar || "",
        email: profile.email || "",
        dob: profile.dob ? profile.dob.split("T")[0] : "",
        address: profile.address || "",
      });
    }
    setIsEditing(false);
    toast("Changes discarded", { icon: "↩️" });
  };

  if (loading) return <div className="p-8 text-center text-purple-700">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-2xl rounded-2xl relative">
      <Toaster position="top-center" />
      <h1 className="text-4xl font-bold mb-10 text-center text-purple-800">Client Profile</h1>

      {/* Top-right Edit Button */}
      {!isEditing && (
        <Button
          className="absolute top-6 right-6"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
      )}

      {/* Profile Card */}
      <div className="bg-purple-50 p-6 rounded-xl shadow-md mb-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-32 h-32">
            <img
              src={formData.avatar || "/placeholder-avatar.png"}
              alt="avatar"
              className="w-full h-full rounded-full object-cover border-4 border-purple-300 shadow"
            />
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full">
                    <Spinner />
                  </div>
                )}
              </>
            )}
          </div>
          <h2 className="text-xl font-semibold mt-4 text-purple-800">{formData.name || "Unnamed Client"}</h2>
          <p className="text-gray-600">{formData.email || "No email provided"}</p>
        </div>

        {isEditing ? (
          <>
            <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
          </>
        ) : (
          <p className="text-sm text-gray-700"><strong>Bio:</strong> {profile?.bio || <em className="text-gray-400">Not provided</em>}</p>
        )}
      </div>

      {/* Personal Info Card */}
      <div className="bg-purple-50 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Personal Information</h3>
        {isEditing ? (
          <>
            <Input label="Date of Birth" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
            <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <Input label="Contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
          </>
        ) : (
          <div className="space-y-2 text-gray-700">
            <p><strong>Date of Birth:</strong> {profile?.dob ? new Date(profile.dob).toISOString().split("T")[0] : <em className="text-gray-400">Not provided</em>}</p>
            <p><strong>Location:</strong> {profile?.location || <em className="text-gray-400">Not provided</em>}</p>
            <p><strong>Address:</strong> {profile?.address || <em className="text-gray-400">Not provided</em>}</p>
            <p><strong>Contact:</strong> {profile?.contact || <em className="text-gray-400">Not provided</em>}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-center mt-10 gap-6">
          <Button onClick={handleSave}>Save</Button>
          <Button className="bg-gray-400 hover:bg-gray-500" onClick={handleCancel}>Cancel</Button>
        </div>
      )}
    </div>
  );
};

export default ClientProfilePage;

