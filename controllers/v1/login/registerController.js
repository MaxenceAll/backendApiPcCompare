const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");
const mailer = require("../../../services/mailer.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

async function sendVerifMail(req, res) {
  consolelog("// Appel de la method sendVerifMail de registerController //");
  consolelog("=> avec les données suivantes : ", req.body);
  try {
    const { email, password, pseudo, firstname, lastname } = req.body;
    if (!email || !password || !pseudo || !firstname || !lastname) {
      consolelog("XX Il manque des données !");
      return res.status(400).json({ message: "Il manque des données. (Contactez un administrateur)", error: error.message});
    }
    try {
      var hash = bcrypt.hashSync(password, 10);
      var hashedPassword = hash.replace(config.hash.prefix, "");
      var payload = { email, hashedPassword, pseudo, firstname, lastname };
      var jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });      
    } catch (error) {
      consolelog("XX Erreur lors du cryptage du mot de passe.");
      return res.status(500).json({message: "Erreur lors du cryptage du mot de passe. (Contactez un administrateur)", error: error.message});
    }
    // On prépare les params pour l'utilisation de notre mailer service.
    const emailOptions = {
      to: email,
      subject: "Vérifiez votre compte PCCompare",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Vérification de votre compte ${process.env.APP_NAME}</title>
          <style>
            body{
                padding: 5%;
                background-color: #46465C;
                color: white;
            }
            @media (prefers-color-scheme: dark) {
                body {
                background-color: #46465C;
                color: white;
                }
            @media (prefers-color-scheme: light) {
                body {
                background-color: white;
                color: black;
                }
        
          </style>
        </head>
        <body>
        <header>
        <h1>${process.env.APP_NAME} !</h1>
        </header>
        <main>
          <h2>Vérification de votre compte ${process.env.APP_NAME}</h2>
          <p>Merci de votre inscription sur ${process.env.APP_NAME}.</p>
          <p>Pour valider votre compte vous devez cliquer sur le bouton suivant :</p>
          <p><button><a href="${config.FRONTEND.URL}verify?t=${jwtToken}">Vérifier mon compte</button></a></p>
          <small>
          <i>Si vous n'avez pas fait d'inscription sur notre site ou si vous avez déjà un compte, vous pouvez ignorer ce mail. N'hésitez pas à nous faire part de tout abus directement via notre rubrique APropos sur notre site.</i>
          </small>
        </main>
        <footer>
        ${process.env.APP_NAME}© Tout droits réservés.
        </footer>
        </body>
        </html>
      `,
    };
    try {
      const retourMailer = await mailer.send(emailOptions);
      if (retourMailer.result) {
        consolelog("?? le retourMailer est = à:", retourMailer);
        res.status(200).json({result: true,message: `Un e-mail à été envoyé à ${email}, rendez-vous sur votre boite mail dans l'heure pour activer votre compte.`});
      } else {
        res.status(500).json({message: `Erreur lors de l'envoi du mail de vérification. (Contactez un administrateur)`, error: error.message});
      }
    } catch (error) {
      consolelog(`XX Erreur lors de l'envoi du mail de vérification à ${email}: ${error}`);
      res.status(500).json({message: "Erreur lors de l'envoi du mail de vérification. (Contactez un administrateur)", error: error.message});
    }
  } catch (error) {
    consolelog(`XX Erreur dans sendVerifMail: ${error}`);
    return res.status(500).json({ message: "Erreur interne. (Contactez un administrateur)", error: error.message});
  }
}

async function verifySentMail(req, res) {
  consolelog("// Appel de la method verifySentMail de registerController //");
  try {
    const token = req.url.split("?")[1];
    consolelog("?? On a reçu comme TOKEN :", token);
    try {
      var decodedToken = jwt.verify(token, process.env.JWT_SECRET);      
    } catch (error) {
      consolelog("XX Erreur lors de la vérification du JWT.");
      return res.status(401).json({message: "Délai de vérification dépassé ou erreur de la vérification des données. (Re-essayez un peu plus tard)", error: error.message});
    }
    const { email, hashedPassword, pseudo, firstname, lastname } = decodedToken;
    const password = hashedPassword;
    if (!email || !password || !pseudo || !firstname || !lastname) {
      consolelog("XX Il manque des données dans le token reçu !");
      return res.status(400).json({ message: "Problème de donnée dans le token reçu. (Contactez un administrateur)", error: error.message});
    }
    try {
      // On tente d'ajouter en database les données dans account
      const SQL_ADD_ACCOUNT = `INSERT INTO account (email, password, createdBy) VALUES (?, ?, ?)`;
      const result = await query(SQL_ADD_ACCOUNT, [email, password, "site"]);
      var insertId = result?.insertId;
      if (result){
        consolelog(`!! Ajout de l'account avec succès !`);
      } else {
        consolelog(`XX Refus d'ajout de l'account !`);
        return res.status(406).json({result: false, message: `Erreur lors de la création du compte.`})
      }
    } catch (error) {
      consolelog(`XX Erreur lors de l'ajout dans la table account.`);
      return res.status(500).json({message: "Erreur lors de la création de votre compte. (Contactez un administrateur)", error: error.message});
    }
    try {
      // On tente d'ajouter en database les données dans customer
      const SQL_ADD_CUSTOMER = `INSERT INTO customer (pseudo, firstname, lastname, Id_role, Id_account, createdBy) VALUES (?, ?, ?, ?, ? , ? )`;
      const response = await query(SQL_ADD_CUSTOMER, [pseudo,firstname,lastname,"1",insertId,"site",]);
      if (response){
        consolelog(`!! Ajout du customer avec succès !`);        
        return res.status(200).json({result: true, message: `Création du compte de votre compte effectué avec succès !`});
      } else {
        consolelog(`XX Refus d'ajout du customer !`);
        return res.status(406).json({result: false, message: `Erreur lors de la création du compte.`})
      }
    } catch (error) {
      consolelog(`XX Erreur lors de l'ajout dans la table customer.`);
      return res.status(500).json({message: "Erreur lors de la création de votre compte. (Contactez un administrateur)", error: error.message});
    }
  } catch (error) {
    consolelog(`XX Erreur dans verifySentMail: ${error}`);
    return res.status(500).json({message: "Erreur interne. (Contactez un administrateur)", error: error.message});
  }
}

async function verifyPseudoAvailable(req, res) {
  consolelog("// Appel de la function verifyPseudoAvailable de registerController //");
  try {
    const pseudoToTest = req.body.pseudo;
    consolelog("--> Test de la disponibilité du pseudo: ", pseudoToTest);
    const sql = `SELECT * FROM customer WHERE pseudo = ?`;
    const response = await query(sql, [pseudoToTest]);
    if (response.length > 0) {
      consolelog(`!! Le pseudo ${pseudoToTest} n'est pas disponible.`);
      return res.status(200).json({ result: false, message: `Ce pseudo (${pseudoToTest}) n'est pas disponible.`});
    } else {
      consolelog(`!! Le pseudo ${pseudoToTest} est disponible.`);
      return res.status(200).json({ result: true, message: `Ce pseudo (${pseudoToTest}) est disponible.`});
    }
  } catch (error) {
    consolelog(`XX Erreur dans verifyPseudoAvailable: ${error}`);
    return res.status(500).json({message: "Erreur interne. (Contactez un administrateur)", error: error.message});
  }
}

module.exports = { sendVerifMail, verifySentMail, verifyPseudoAvailable };