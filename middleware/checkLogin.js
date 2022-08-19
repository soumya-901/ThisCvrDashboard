const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token || token === "null")
    return res.status(401).send("Access denied, no token provided");

  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = decoded;
    next();
  } catch (ex) {
    console.log(ex);
    res.status(400).send("Access denied, Invalid Token");
  }
};

module.exports = auth;
