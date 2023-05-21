const consolelog = require("../../../Tools/consolelog");
const jwt = require("jsonwebtoken");

async function handleAuth(req, res) {
  const accessTokenCookie = req?.cookies?.accessToken;
  consolelog("=====================================================");
  consolelog("// Appel de la method handleAuth de authController //");
  consolelog("?? Vérification de la réception en cookie, on a reçu en req?.cookies?.accessToken :",accessTokenCookie);
  try {
    if (!accessTokenCookie) {
      consolelog("XX Pas de cookie accessToken reçu.");
      // Http status 204 est bonne pratique d'un retour APIrest sans contenu, juste informationnel
      return res.status(204).json({data: null,result: false,message: "Pas de cookie accessToken reçu.",});
    }
    consolelog("==> Comparaison du accessTokenCookie avec la secret phrase en .env");
    jwt.verify(accessTokenCookie, process.env.ACCESS_TOKEN_SECRET, (error, data) => {
      if (error) {
        consolelog("XX Erreur dans les données reçues depuis le cookie accessToken :",error);
        if (error.name === "TokenExpiredError") {
          consolelog("!! Le accessToken est expiré !", error);
          return res.status(204).json({data: null,result: false,message: "Le accessToken est expiré !",});
        } else {
          consolelog("XX Erreur d'authentification :", error);
          return res.status(401).json({data: null,result: false,message: "Erreur d'authentification",});
        }
      } else {
        // Si token valide, la connexion est secure, on renvoit dans data le contenu du token
        return res.status(200).json({ data, result: true, message: "Auth OK" });
      }
    });
  } catch (error) {
    consolelog("XX Erreur lors de la vérification de connexion.", error);
    return res.status(500).json({data: null,message: `Erreur d'authentification`,result: false,});
  }
}

module.exports = { handleAuth };