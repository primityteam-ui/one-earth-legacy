import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    country: user.country,
    countryCode: user.countryCode,
    totalDonated: user.totalDonated,
    currentRank: user.currentRank,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled
  };
}

export async function getMe(req, res) {
  res.status(200).json({
    user: publicUser(req.user)
  });
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Avatar image is required."
      });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      public_id: `user_${req.user._id}_${Date.now()}`
    });

    req.user.avatar = result.secure_url;
    await req.user.save();

    return res.status(200).json({
      message: "Avatar uploaded successfully.",
      avatar: req.user.avatar,
      user: publicUser(req.user)
    });
  } catch (error) {
    return next(error);
  }
}