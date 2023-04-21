const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const jwt = require("jsonwebtoken");

async function handleAuth(req, res) {
    const authCookie = req?.cookies?.accessToken;
    try {
      if (!authCookie) {
        throw new Error("Bad Auth / pas de cookie");
      }
      const data = jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET);
      if (!data) {
        throw new Error("Bad Auth / pas de data");
      }
      res.json({ data, result: true, message: `Auth OK` });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ data: null, result: false, message: 'Access token has expired' });
      } else {
        res.status(401).json({ data: null, result: false, message: error.message });
      }
    }
  }
  
  module.exports = { handleAuth };
  