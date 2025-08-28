import ClientProfile from "../models/ClientProfile.model.js";


export const getClientProfile = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const userId = req.query.id || req.user._id;
  const profile = await ClientProfile.findOne({ userId });
  if (!profile) {
    return res.status(200).json(null);
  }
  // Always return a profilePicture.url field for frontend compatibility
  let profileObj = profile.toObject();
  if (!profileObj.profilePicture) profileObj.profilePicture = {};
  profileObj.profilePicture.url = profileObj.profilePicture.url || profileObj.avatar || "";
  res.json(profileObj);
};


export const updateClientProfile = async (req, res) => {
  const userId = req.body.id || req.user._id; // <-- allow ID from body for client-side update

  const update = req.body;
  delete update.id; // prevent accidental overwrite

  const profile = await ClientProfile.findOneAndUpdate(
    { userId },
    update,
    { new: true, upsert: true }
  );

  res.json(profile);
};
