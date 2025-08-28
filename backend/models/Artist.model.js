
import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const artistSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password should be at least 6 characters"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
  },
  role: {
    type: String,
    default: "artist"
  },
  category: {
    type: String,
    enum: ["dj", "musician", "mc", "dancer", "singer", "other"],
    required: true,
    lowercase: true
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
    city: {
      type: String,
      required: true,
    }
  },
  genres: [String],
  eventTypes: [String],
  languages: [String],
  specialties: [String], 

  bio: String,
  portfolioLink: [
    {
      url: String,
      type: { type: String, default: "link" },
    }
  ],
  media: [
    {
      url: String,
      type: { type: String, enum: ["image", "video"] },
    }
  ],
  videoUrl: {
    type: String,
    default: "",
  },
  profilePicture: {
    url: String,
  },
  availability: [
    {
      date: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ["available", "booked", "unavailable"],
        default: "available",
      },
    }
  ],
  wage: {
    type: Number,
    required: false,
  },

  resetToken: {
    type: String,
    default: null,
  },

  dateOfBirth: {
    type: Date,
    required: true,
  },

  citizenshipNumber: {
    type: String,
    required: true,
  },

  citizenshipImage: {
    url: {
      type: String,
      required: true,
    }
  },

  livePhoto: {
    url: {
      type: String,
      required: true,
    }
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  guardianInfo: {
    name: { type: String },            // Guardian's full name (e.g., "John Doe")
    relation: { type: String },        // Relationship to the artist (e.g., "Father", "Mother", "Legal Guardian")
    idDocument: {
      url: { type: String }            // URL to the scanned ID or any valid document of the guardian (e.g., national ID, passport)
    }
  },

  weightedRating: {
    type: Number,
    default: 0,
  },
  rawAverageRating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  }


},
{ timestamps: true });

// Virtual getter for ratePerHour
artistSchema.virtual('ratePerHour').get(function () {
  return this.wage;
});

artistSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

artistSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Artist = mongoose.model("Artist", artistSchema);
export default Artist;



