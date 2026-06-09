export async function getMe(req, res) {
  res.status(200).json({
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      displayName: req.user.displayName,
      avatar: req.user.avatar,
      country: req.user.country,
      countryCode: req.user.countryCode,
      totalDonated: req.user.totalDonated,
      currentRank: req.user.currentRank,
      role: req.user.role,
      twoFactorEnabled: req.user.twoFactorEnabled
    }
  });
}