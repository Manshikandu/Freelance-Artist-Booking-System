import Interaction from "../models/Interaction.model.js";

export const logInteraction = async (req, res) => {
  const { jobPostId, action } = req.body;
  if (!["viewed", "applied", "skipped"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  await Interaction.create({
    artistId: req.user._id,
    jobPostId,
    action
  });

  res.status(201).json({ message: "Interaction logged" });
};

export const getInteractionStats = async (req, res) => {
  const stats = await Interaction.aggregate([
    { $match: { artistId: req.user._id } },
    { $group: { _id: "$action", count: { $sum: 1 } } }
  ]);

  res.json(stats);
};
