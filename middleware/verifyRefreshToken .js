const consolelog = require("../Tools/consolelog");
const jwt = require('jsonwebtoken');

const verifyRefreshToken = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    consolelog("verifyRefrestToken called refrestToken received(httponly):",refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ message: "Non autorisé.", result: "false" });
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      consolelog("verifyRefrestToken called, decoded=",decoded)
      req.user = decoded;
      next();
    } catch (err) {
        consolelog("oops une erreur dans veriyfyRefresh Token", err)
      return res.status(401).json({ message: "Non autorisé.", result: "false" });
    }
  };
  
  module.exports = verifyRefreshToken