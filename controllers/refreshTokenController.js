const jwt = require("jsonwebtoken");
const consolelog = require("../Tools/consolelog");
const { query } = require("../services/database.service");
const config = require("../config/config");
const bcrypt = require("bcrypt");
const durationToMilliseconds = require("../Tools/durationToMilliseconds");

async function handleRefreshToken(req, res) {
  const refreshTokenCookie = req?.cookies?.refreshToken;
  consolelog("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  consolelog(
    "// Appel de la method handleRefreshToken de refreshTokenController //"
  );
  consolelog(
    "?? Vérification de la réception en cookie, on a reçu en req?.cookies?.refreshToken :",
    refreshTokenCookie
  );
  try {
    // Je test en premier si j'ai reçu un cookie 'refreshToken'
    if (!refreshTokenCookie) {
      consolelog("XX Pas de cookie refreshToken reçu.");
      // Http status 204 est bonne pratique d'un retour APIrest sans contenu, juste informationnel
      return res.status(204).json({
        data: null,
        result: false,
        message: "Pas de cookie refreshToken reçu.",
      });
    }

    // Décodage du refresh token
    const decodedRefreshToken = jwt.verify(
      refreshTokenCookie,
      process.env.REFRESH_TOKEN_SECRET
    );
    consolelog(
      "?? Décodage du refreshToken avec les informations suivantes :",
      decodedRefreshToken
    );
    // Décodé mais expiré :
    if (decodedRefreshToken.exp < Date.now() / 1000) {
      return res.status(401).json({
        result: false,
        message: "Le refreshToken est expiré, il faut se re-identifier.",
      });
    }
    // Décodé mais verification KO (message d'erreur neutre)
    if (!decodedRefreshToken) {
      return res.status(401).json({
        data: null,
        result: false,
        message: "Erreur lors de l'authentification 4.",
      });
    }

    // Le jwt est vérifié, on peut continuer !

    // Verification de l'état du compte en question (en utilisant l'adresse mail)
    let account, customer, role;
    try {
      // Query pour aller chercher toutes les données utilisateur (account/customer/role) en fonction du mail reçu:
      const SQL_allData = `        
      SELECT account.email, account.password, customer.*, role.*
      FROM account
      JOIN customer ON account.Id_account = customer.Id_account
      JOIN role ON customer.Id_role = role.Id_role
      WHERE account.email = ?
      `;
      const [allData] = await query(SQL_allData, [decodedRefreshToken.account]);
      // Si je n'ai pas de retour de la requete alors je n'ai aucun compte avec ce email (mettre un message de retour neutre)
      if (!allData) {
        consolelog(
          "XX Aucune donnée trouvée pour l'email:",
          decodedRefreshToken.account
        );
        return res.status(401).json({
          message: "Erreur lors de l'authentification 3.",
          result: false,
        });
      }
      // Remplissage des objets pour utilisations futures.
      account = {
        email: allData.email,
        // Noter qu'on envoit que le mail, pas le hashedpassword
      };
      customer = {
        Id_account: allData.Id_account,
        Id_customer: allData.Id_customer,
        Id_role: allData.Id_role,
        pseudo: allData.pseudo,
        firstname: allData.firstname,
        lastname: allData.lastname,
        last_connection: allData.last_connection,
        createdBy: allData.createdBy,
        createdAt: allData.createdAt,
        modifiedBy: allData.modifiedBy,
        modifiedAt: allData.modifiedAt,
        deletedBy: allData.deletedBy,
        deletedAt: allData.deletedAt,
      };
      role = {
        title: allData.title,
      };
      consolelog("?? Last info de account trouvé est:", account);
      consolelog("?? Last info de customer trouvé est:", customer);
      consolelog("?? Last info de role trouvé est:", role);
    } catch (error) {
      consolelog(
        "XX Erreur lors de la recherche des données de l'utilisateur:",
        error
      );
      return res.status(500).json({
        message: "Erreur lors de la recherche des données de l'utilisateur",
        result: false,
      });
    }

    // on prépare un objet avec toutes les données (sauf les sensibles (hashedpassword))
    const data = {
      account: account.email,
      customer: customer,
      role: role.title,
    };
    consolelog(
      "!! L'objet préparé pour le retour au Front est le suivant :",
      data
    );

    let accessToken;
    let refreshToken;
    try {
      // On crée un JWT avec la clé secrete dans .env
      accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_MAXAGE,
      });
      // On crée un JWT de refresh  avec la clé secrete dans .env
      refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_MAXAGE,
      });
      consolelog(
        `?? Pour information, un accessToken a été créé pour ${process.env.ACCESS_TOKEN_MAXAGE} (Depuis la route refreshToken !) :`,
        accessToken
      );
      consolelog(
        `?? Pour information, un refreshToken a été créé pour ${process.env.REFRESH_TOKEN_MAXAGE} (Depuis la route refreshToken !):`,
        refreshToken
      );
    } catch (error) {
      consolelog("XX Erreur lors de la création des JsonWebToken:", error);
      res.status(500).json({
        message: "Erreur lors de la création des JsonWebToken.",
        result: false,
      });
    }

    consolelog(
      "==> Tout est ok, On peut renvoyer le nouveau refreshToken et le nouveau accessToken actualisé avec les dernières données."
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      // Petite method custom pour convertir la valeur dans .env en millisecond (nécessaire ici)
      maxAge: durationToMilliseconds(process.env.REFRESH_TOKEN_MAXAGE),
    });
    return res.status(200).json({
      data,
      result: true,
      message: "Authentification avec refreshToken avec succes.",
      accessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      consolelog("!! Le refreshToken est expiré !", error);
      // TODO voir si un 401 est adapté ici.
      return res.status(401).json({
        data: null,
        result: false,
        message: "Le refreshToken est expiré, il faut se re-identifier !",
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
module.exports = { handleRefreshToken };
