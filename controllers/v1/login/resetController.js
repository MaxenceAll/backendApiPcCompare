const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");
const mailer = require("../../../services/mailer.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function resetPassword(req, res, next) {
  consolelog("// Appel de la method resetPassword de resetController //");
  try {
    const { email } = req.body;
    const SQL_FIND_USER = "SELECT * FROM account WHERE email = ?";
    const [user] = await query(SQL_FIND_USER, [email]);
    // un empty array est considéré falsy:
    if (user) {
      const { id, email } = user;
      const data = { id, email };
      const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' });
      const html = `
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
        <p><button><a href="${config.FRONTEND.URL}verify?t=${token}">Vérifier mon compte</button></a></p>
        <small>
        <i>Si vous n'avez pas fait d'inscription sur notre site ou si vous avez déjà un compte, vous pouvez ignorer ce mail. N'hésitez pas à nous faire part de tout abus directement via notre rubrique APropos sur notre site.</i>
        </small>
      </main>
      <footer>
      ${process.env.APP_NAME}© Tout droits réservés.
      </footer>
      </body>
      </html>
      `;
      const mailParams = {
        to: email,
        subject: "Nouveau mot de passe demandé pour PCCompare",
        html: html,
      };
      const mailResult = await mailer.send(mailParams);
      consolelog(`!! Retour du mailer :`,mailResult);
      return res.status(200).json({ result: true, message: `Envoi d'un e-mail de récupération de mot passe à votre adresse : ${email} ; vérifiez votre boite mail ! Vous avez 10 minutes pour ré-initialiser votre mot de passe.`});
    } else {
      // Précisions en log mais retour au client neutre.
      consolelog(`XX Aucun compte avec l'email ${email} !`)
      return res.status(200).json({ result: true, message: `Envoi d'un e-mail de récupération de mot passe à votre adresse : ${email} ; vérifiez votre boite mail ! Vous avez 10 minutes pour ré-initialiser votre mot de passe.`});
    }
  } catch (error) {
    consolelog(`XX Erreur dans resetPassword : ${error}`)
    next(error)
  }
}


async function newPassword(req, res, next) {
  consolelog("// Appel de la method newPassword de resetController //");
    const { body } = req;
    try {
      if (!body.token) {
        return res.status(400).json({ message: "Pas de token dans votre url !" });
      }
      const data = jwt.verify(body.token, process.env.JWT_SECRET);
      if (!data) {
        return res.status(401).json({ message: "Token invalide ou expiré !" });
      }
      const hash = bcrypt.hashSync(body.password1, 10);
      const hashedPassword = hash.replace(config.hash.prefix, "");  
      const sql = `
        UPDATE account
        SET password = ?,
            modifiedBy = 'site',
            modifiedAt = NOW()
        WHERE email = ?
      `;  
      try {
        const result = await query(sql, [hashedPassword, data.email]);
        if (result.affectedRows >0){
          return res.status(200).json({ data: result, result: true, message: "Mot de passe changé avec succès !" });
        } else {
          return res.status(401).json({ message: "Erreur lors de la modification de mot de passe !"})
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur interne." });
      }
    } catch (error) {
      consolelog(`XX Erreur dans newPassword :`,error)
      next(error);
    }
  }
  
module.exports = { resetPassword, newPassword };
