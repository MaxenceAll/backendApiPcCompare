const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");
const mailer = require("../../../services/mailer.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function resetPassword(req, res) {
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
      const html = `Pour renouveler votre mot de passe, cliquez sur ce lien <a href="${config.FRONTEND.URL}reset?t=${token}">Nouveau mot de passe</a>`;
      const mailParams = {
        to: email,
        subject: "Nouveau mot de passe demandé pour PCCompare",
        html: html,
      };
      const mailResult = await mailer.send(mailParams);
      consolelog(`!! Retour du mailer :`,mailResult);
      res.status(200).json({data: mailResult, result: true, message: `Mail de réinitialisation de mot passe envoyé avec succès.`});
    } else {
      consolelog(`XX Aucun compte avec l'email ${email} !`)
      res.status(401).json({ data: null, result: false, message: "Erreur lors de la récupération de mot de passe." });
    }
  } catch (error) {
    consolelog(`XX Erreur dans resetPassword :`,error)
    res.status(500).json({ data: null, result: false, message: "Erreur lors de la récupération de mot de passe." });
  }
}


async function newPassword(req, res) {
  consolelog("// Appel de la method newPassword de resetController //");
    const { body } = req;
    try {
      if (!body.token) {
        return res.status(400).json({ data: null, result: false, message: "Pas de token dans votre url !" });
      }
      const data = jwt.verify(body.token, process.env.JWT_SECRET);
      if (!data) {
        return res.status(401).json({ data: null, result: false, message: "Token invalide ou expiré !" });
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
          return res.status(401).json({ data: null, result: false, message: "Erreur lors de la modification de mot de passe !"})
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ data: null, result: false, message: "Erreur serveur interne." });
      }
    } catch (error) {
      consolelog(`XX Erreur dans newPassword :`,error)
      res.status(500).json({ data: null, result: false, message: "Erreur lors de la modification de mot de passe !" });
    }
  }
  
module.exports = { resetPassword, newPassword };
