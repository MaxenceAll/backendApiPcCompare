const express = require("express");
const accesMiddleware = express.Router();
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const consolelog = require("../Tools/consolelog");

// Middleware to check if the API key in the request headers is valid
accesMiddleware.all("*", async (req, res, next) => {
    const authorization = req.headers.authorization;
    try {
      if (!authorization) {
        consolelog("!!!! No API key provided in headers!")
        throw new Error("No API key provided in headers!");
      }      
      const [bearer, token] = authorization.split(" ");
      if (bearer !== "Bearer" || !token) {
        consolelog("!!!! Invalid authorization header! reçu :",req.headers.authorization)
        throw new Error("Invalid authorization header!");
      }  
      const decodedToken = jwt.verify(token, config.authorization.secret);    
      if (!config.authorization.keys.includes(decodedToken)) {
        consolelog("!!!! Invalid API key :'( !")
        throw new Error("Invalid API key :'( !");
      }
      consolelog("¤¤ Reception d'une clé API OK OK ! ¤¤")
      next();
    } catch (error) {
      res.status(401).json({ error: ("Error: " + error.message) });
    }
  });


module.exports = accesMiddleware;
