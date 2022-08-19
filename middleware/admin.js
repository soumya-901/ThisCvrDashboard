const { User } = require("../schemas/userSchema");

const admin = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(401)
      .send("Forbidden. Permission denied or user not found");

  if (user.role !== "admin")
    return res.status(403).json("Forbidden. Permission denied");

  next();
};

module.exports = admin;
