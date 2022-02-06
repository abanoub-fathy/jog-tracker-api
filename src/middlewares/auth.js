const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authUser = async (req, res, next) => {
  try {
    // recieve the token from the req
    let tokenFromReq = req.headers.authorization.replace("Bearer ", "");
    if (!tokenFromReq) throw new Error();

    // decode the tokenFromReq
    let decodedToken = jwt.decode(tokenFromReq, process.env.TOKEN_SECRET);
    if (!decodedToken) throw new Error();

    // fetch the user by its id from the token
    const user = await User.findOne({
      _id: decodedToken._id,
      "tokens.token": tokenFromReq,
    });
    if (!user) throw new Error();

    // set the requested user
    req.user = user;
    req.token = tokenFromReq;

    // call next
    next();
  } catch (e) {
    res.status(401).send({ error: "You need to sign in first!" });
  }
};

const authRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .send({ error: "You are not allowed to use this endpoint" });
    }
    next();
  };
};

module.exports = {
  authUser,
  authRole,
};
