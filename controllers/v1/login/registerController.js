const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");
const mailer = require("../../../services/mailer.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function sendVerifMail(req, res) {
  consolelog("+++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  consolelog("// Appel de la method sendVerifMail de registerController //");
  consolelog("=> avec les données suivantes : ", req.body);
  try {
    const { email, password, pseudo, firstname, lastname } = req.body;    
    const hash = bcrypt.hashSync(password, 10);
    const hashedPassword = hash.replace(config.hash.prefix, "");
    const payload = { email, hashedPassword, pseudo, firstname, lastname };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // On prépare les params pour l'utilisation de notre mailer service.
    const emailOptions = {
      to: email,
      subject: "Vérifiez votre compte PCCompare",
      html: `Cliquez ici pour valider votre compte : <a href="${config.FRONTEND.URL}verify?t=${jwtToken}">Verifier Email</a>`,
    };
    try {
      const retourMailer = await mailer.send(emailOptions);
      if (retourMailer.result){
        consolelog(`Verification email sent to ${email}`);
        consolelog("le retourMailer est = à:", retourMailer);
        res.status(200).json({
          result: true,
          message: `Un e-mail à été envoyé à ${email}, rendez-vous sur votre boite mail dans l'heure pour activer votre compte.`,
        });
      }else{
        res.status(500).json({ data: null, message: `XX Erreur lors de l'envoi du mail de vérification.`});
      }
    } catch (error) {
      consolelog(`XX Erreur lors de l'envoi du mail de vérification à ${email}: ${error}`);
      res.status(500).json({ data: null, message: "XX Erreur lors de l'envoi du mail de vérification." });
    }
  } catch (error) {
    consolelog(`XX Erreur dans sendVerifMail: ${error}`);
    return res.status(500).json({ data: null,message: "Erreur interne.", result: false });
  }
}

async function verifySentMail(req, res) {
  consolelog("+++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  consolelog("// Appel de la method verifySentMail de registerController //");
  try {
    const token = req.url.split("?")[1];
    consolelog("?? on a reçu comme TOKEN :", token);  
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); 
    const { email, hashedPassword, pseudo, firstname, lastname } = decodedToken;
    const password = hashedPassword;
    if (!email || !password || !pseudo || !firstname || !lastname) {
      consolelog("XX Il manque des données dans le token reçu !");
      return res.status(400).json({ message: "Problème de data dans le token reçu." });
    }
    try {
      const SQL_ADD_ACCOUNT =
      `INSERT INTO account (email, password, createdBy)
      VALUES (?, ?, ?)
      `;
      const result = await query(SQL_ADD_ACCOUNT, [email, password, "site"]);
      const insertId = result.insertId;
      consolelog(`!! Ajout de l'account avec succès !`);

      const SQL_ADD_CUSTOMER =
      `INSERT INTO customer (pseudo, firstname, lastname, Id_role, Id_account, createdBy)
      VALUES (?, ?, ?, ?, ? , ? )
      `;
      await query(SQL_ADD_CUSTOMER, [pseudo, firstname, lastname, "1", insertId, "site"]);
      consolelog(`!! Ajout du customer avec succès !`);
      res.status(200).json({result: true,message: `Création du compte de ${pseudo} effectué avec succès !`});
    } catch (error) {
        consolelog(`XX Erreur lors de la requête pour ajouter utilisateur: ${error}`);
        res.status(500).json({ data: null,message: "Erreur lors de l'ajout d'utilisateur.",error: error.message,});
    }
  } catch (error) {
    consolelog(`XX Erreur dans verifySentMail: ${error}`);
    res.status(500).json({ data: null, result: false, message: "Erreur interne."});
  }
}

async function verifyPseudoAvailable(req, res) {
  consolelog("// Appel de la function verifyPseudoAvailable");
  try {
    const pseudoToTest = req.body.pseudo;
    consolelog("--> Test de la disponibilité du pseudo: ", pseudoToTest);
    const sql = `SELECT * FROM customer WHERE pseudo = ?`;
    const response = await query(sql, [pseudoToTest]);
    if (response.length > 0) {
      consolelog(`++ Le pseudo ${pseudoToTest} n'est pas disponible.`);
      res.status(200).json({ result: false, message: `Ce pseudo (${pseudoToTest}) n'est pas disponible.`});
    } else {
      consolelog(`XX Le pseudo est disponible.`);
      res.status(200).json({ result: true, message: `Ce pseudo (${pseudoToTest}) est disponible.`});
    }
  } catch (error) {
    consolelog(`XX Erreur dans verifyPseudoAvailable: ${error}`);
    return res.status(500).json({ data: null,message: "Erreur interne.", result: false });
  }
}

module.exports = { sendVerifMail, verifySentMail, verifyPseudoAvailable };