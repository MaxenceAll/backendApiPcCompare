const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const jwt = require("jsonwebtoken");

async function handleAuth(req, res) {
  const accessTokenCookie = req?.cookies?.accessToken;
  consolelog("=====================================================");
  consolelog("// Appel de la method handleAuth de authController //");
  consolelog(
    "?? Vérification de la réception en cookie, on a reçu en req?.cookies?.accessToken :",
    accessTokenCookie
  );
  try {
    // Je test en premier si j'ai reçu un cookie 'accessToken'
    if (!accessTokenCookie) {
      consolelog("XX Pas de cookie accessToken reçu.");
      // Http status 204 est bonne pratique d'un retour APIrest sans contenu, juste informationnel
      return res.status(204).json({
        data: null,
        result: false,
        message: "Pas de cookie accessToken reçu.",
      });
    }

    // J'ai un accessToken, vérifions sa validitée :
    const data = jwt.verify(accessTokenCookie, process.env.ACCESS_TOKEN_SECRET);
    consolelog(
      "==> Comparaison du accessTokenCookie avec la secret phrase en .env :",
      data
    );
    // S'il n'est pas valide :
    if (!data) {
      consolelog("XX Erreur dans les data retrouvées en cookie.");
      return res.status(401).json({
        data: null,
        result: false,
        message: "Erreur d'authentification 1",
      });
    } else {
      // S'il est valide:
      return res.status(200).json({ data, result: true, message: `Auth OK` });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      consolelog(
        "!! Le accessToken est expiré !",
        error
      );
      return res.status(401).json({
        data: null,
        result: false,
        message: "Le accessToken est expiré !",
      });
    } else {
      consolelog(
        "XX Erreur lors de la recherche des données de l'utilisateur:",
        error
      );
      return res.status(500).json({
        data: null,
        message: `Erreur d'authentification 2`,
        result: false,
      });
    }
  }
}

module.exports = { handleAuth };
