const consolelog = require("../Tools/consolelog");
const jwt = require("jsonwebtoken");
const { query } = require("../services/database.service");

const verifyRefreshToken = async (req, res, next) => {
  const refreshTokenCookie = req?.cookies?.refreshToken;
  consolelog("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  consolelog("// Rentrée dans le middleware verifyRefreshToken //");
  consolelog(
    "?? Vérification de la réception en cookie, on a reçu en req?.cookies?.refreshToken :",
    refreshTokenCookie
  );
  try {
    // Je test en premier si j'ai reçu un cookie 'refreshToken'
    if (!refreshTokenCookie) {
      consolelog("XX Pas de cookie refreshToken reçu.");
      consolelog("==> Sortie du middleware verifyRefreshToken avec un REFUS.");
      return res.status(401).json({
        data: null,
        result: false,
        message: "Echec d'authorisation, vous n'avez pas accès.",
      });
    }

    let decodedRefreshToken;
    try {
      // Décodage du refresh token
      decodedRefreshToken = jwt.verify(
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
          data: null,
          result: false,
          message: "Le refreshToken est expiré, il faut se re-identifier.",
        });
      }
      // Décodé mais verification KO (message d'erreur neutre) //TODO supprimer le 4 en prod
      if (!decodedRefreshToken) {
        return res.status(401).json({
          data: null,
          result: false,
          message: "Erreur lors de l'authentification 4.",
        });
      }
    } catch (error) {
      console.error(`Error in verifyRefreshToken: ${error}`);
      consolelog(`Error in verifyRefreshToken: ${error}`);
      return res
        .status(500)
        .json({ message: "Erreur interne.", result: false });
    }

    // Le jwt est vérifié, on peut continuer !

    // On va chercher en DB les dernières infos de l'utilisateur en question :
    // Verification de l'état du compte en question (en utilisant l'adresse mail)
    let account, customer, role;
    try {
      // On vérifie que le décodage contient bien un account : // TODO CHECK THIS
      if (!decodedRefreshToken.account){
        return res.status(500).json({
          result:false,
          message: `Erreur lors de la vérification du refresh token. (2)`
        })
      }
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
      // consolelog("?? Last info de account trouvé est:", account);
      // consolelog("?? Last info de customer trouvé est:", customer);
      // consolelog("?? Last info de role trouvé est:", role);
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

    // On ajoute au REQ l'utilisateur actuel.
    req.currentUser = {
      account: account.email,
      customer: customer,
      role: role.title,
    };
    consolelog(
      `?? On rajoute au REQ pour utilisation futures : ${JSON.stringify(req.currentUser)}`
    );
    

    // On passe au prochain middleware !
    next();

  } catch (error) {
    console.error(`Error in verifyRefreshToken: ${error}`);
    consolelog(`Error in verifyRefreshToken: ${error}`);
    return res.status(500).json({ message: "Erreur interne.", result: false });
  }
};

module.exports = verifyRefreshToken;
