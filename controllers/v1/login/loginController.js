const consolelog = require("../../../Tools/consolelog");
const durationToMilliseconds = require("../../../Tools/durationToMilliseconds");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function handleLogin(req, res, next) {
  try {
    consolelog("+++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    consolelog("// Appel de la method handleLogin de loginController //");
    // On déconstruit req.body
    const { email, password } = req.body;
    // On test si j'ai réçu des données
    if (!email || !password) {
      consolelog("XX Sortie de method handleLogin car pas de email || password.");
      return res.status(400).json({message: "Il faut saisir un email ET un mot de passe.",result: false,});
    }
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
      const [allData] = await query(SQL_allData, [email]);
      // Si je n'ai pas de retour de la requete alors je n'ai aucun compte avec ce email (mettre un message de retour neutre)
      if (!allData) {
        consolelog("XX Aucune donnée trouvée pour l'email:", email);
        return res.status(401).json({
          message: "Erreur lors de l'authentification.",
          result: false,
        });
      }
      // Remplissage des objets pour utilisations futures.
      account = {
        email: allData.email,
        password: allData.password,
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
        img_src: allData.img_src,
      };
      role = {
        title: allData.title,
      };
      consolelog("?? L'account trouvé est:", account);
      consolelog("?? Le customer trouvé est:", customer);
      consolelog("?? Le role trouvé est:", role);
    } catch (error) {
      consolelog("XX Erreur lors de la recherche des données de l'utilisateur:",error);
      return res.status(500).json({
        message: "Erreur lors de la recherche des données de l'utilisateur",
        result: false,
      });
    }
    // Nous avons trouvé toutes les données et tout est stocké, on peut donc comparer le password avec celui en DB.
    // (comme je supprime le prefix (nombre de salt/rounds), je dois le rajouter manuellement (stocké dans config))
    try {
      const isPasswordMatching = await bcrypt.compare(
        password,
        config.hash.prefix + account.password
      );
      consolelog("!! Comparons le mots de passe reçu le résultat est :", isPasswordMatching );
      if (!isPasswordMatching) {
        // Ici le message de retour de l'api est public donc le msg d'erreur est neutre mais le consolelog est précis.
        consolelog("XX Erreur lors de la comparaison des mots de passe, ils ne correspondent pas !");
        return res.status(401).json({
          message: "Erreur lors de l'authentification.",
          result: false,
        });
      }
    } catch (error) {
      // Ici le message de retour de l'api est public donc le msg d'erreur est neutre mais le consolelog est précis.
      consolelog("XX Erreur lors de la comparaison des mots de passe: ", error);
      return res.status(500).json({
        message: "Erreur lors de l'authentification.",
        result: false,
      });
    }
    // Si je suis ici c'est que le log sera ok, donc : mise à jour de la last_connection
    try {
      consolelog("?? Tentative de mise à jour de la last_connection")
      const SQL_update_last_connection = `
      UPDATE customer
      SET last_connection = NOW()
      WHERE Id_customer = ?;
      `;
      await query(SQL_update_last_connection, [customer.Id_customer]);
    } catch (error) {
      consolelog(`XX Erreur lors de la mise à jour de la last_connection : ${error}`);
      res.messageRetour = "Erreur lors de la mise à jour de la last_connection.";
      next(error);
    }
    consolelog("--> last_connection mis à jour avec succès.")
    // on prépare un objet avec toutes les données (sauf les sensibles (hashedpassword))
    const data = {
      account: account.email,
      customer: customer,
      role: role.title,
    };
    consolelog("!! L'objet préparé pour le retour au Front est le suivant :",data);
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
      consolelog(`?? Pour information, un accessToken a été créé pour ${process.env.ACCESS_TOKEN_MAXAGE} :`,accessToken);
      consolelog(`?? Pour information, un refreshToken a été créé pour ${process.env.REFRESH_TOKEN_MAXAGE} :`,refreshToken);
    } catch (error) {
      consolelog(`XX Erreur lors de la création des JsonWebToken: ${error}`);
      res.messageRetour = `Erreur lors de la création des JsonWebToken.`;
      next(error)
    }
    consolelog("==> Login avec succes ! Envoi du refreshToken en cookie, envoi des données + envoi du accessToken.");
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
      message: "Authentification avec succes.",
      accessToken,
    });
  } catch (error) {
    consolelog(`Error in handleLogin: ${error}`);
    next(error)
  }
}

async function handleLogout(req, res, next) {
  consolelog("-------------------------------------------------------");
  consolelog("// Appel de la method handleLogout de loginController //");
  try {
    // Vérifie la présence d'une connexion (un refreshToken)
    const refreshTokenCookie = req.cookies.refreshToken;
    if (!refreshTokenCookie) {
      consolelog("XX Sortie de la method handleLogout car pas de refresh Token.");
      return res.status(404).json({
        message: "Il n'y a pas de refreshToken donc pas de déconnection possible.",
        result: false,
      });
    }
    try {
      // Décodage du refresh token
      const decodedRefreshToken = jwt.verify(refreshTokenCookie,process.env.REFRESH_TOKEN_SECRET);
      consolelog("?? Décodage du refreshToken avec les informations suivantes :",decodedRefreshToken);
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
          message: "Erreur lors de l'authentification.",
        });
      }
    } catch (error) {
      consolelog(`Error in handleLogout: ${error}`);
      next(error);
    }
    // Tout est ok, on renvoi un nouveau refreshToken vide pour annuler le précédent
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
      sameSite: "None",
      secure: true,
    });
    return res.status(200).json({
      result: true,
      message: "Déconnection avec succes.",
    });
  } catch (error) {
    consolelog(`Error in handleLogout: ${error}`);
    next(error);
  }
}

module.exports = { handleLogin, handleLogout };