import mongoose from "mongoose";

const clientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: { type: String, default: "" },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  avatar: { type: String, default: "" } ,
  email: String,     
  dob: Date,        
  address: String,
  contact: String,
  
}, { timestamps: true });

const ClientProfile = mongoose.model("ClientProfile", clientProfileSchema);

export default ClientProfile;
