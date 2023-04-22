const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const jwt = require("jsonwebtoken");

async function handleAuth(req, res) {
  const authCookie = req?.cookies?.accessToken;
  consolelog("handle Auth route taken, there is accessToken found", authCookie);
  try {
    if (!authCookie) {
      return res.json({
        data: null,
        result: false,
        message: "No access token in cookie found",
      });
      // throw new Error("Bad Auth / pas de cookie");
    }
    const data = jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET);
    if (!data) {
      return res.status(401).json({
        data: null,
        result: false,
        message: "Error while authentification",
      });
      // throw new Error("Bad Auth / pas de data");
    } else {
      return res.json({ data, result: true, message: `Auth OK` });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        data: null,
        result: false,
        message: "Access token has expired",
      });
    } else {
      return res
        .status(401)
        .json({ data: null, result: false, message: error.message });
    }
  }
}

module.exports = { handleAuth };
