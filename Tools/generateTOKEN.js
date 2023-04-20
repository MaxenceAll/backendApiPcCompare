// Pour créer des clés API : (qui correspondent avec la chaine dans config.js)
const jwt = require("jsonwebtoken");
const config = require("./api/config");
const api_key = "!Ml_MOAUG8X)kTkbkuF6]JkyRAO/SD-K"; // Une des clés valides dans auth. key[]
const authorization = jwt.sign(api_key, config.authorization.secret);
consolelog(authorization); // affichage d'une clé valide. pour envoyer en headers
