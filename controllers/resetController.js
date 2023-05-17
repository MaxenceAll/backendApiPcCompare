const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const mailer = require("../services/mailer.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function resetPassword(req, res) {
  consolelog("resetPassword route taken");
  const { email } = req.body;
  const sql = "SELECT * FROM account WHERE email = ?";
  await query(sql, [email])
    .then(async (json) => {
      const user = json.length === 1 ? json.pop() : null;
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
        consolelog(mailResult);
        res.json(mailResult);
      } else {
        return res.status(401).json({ data: null, result: false, message: "Erreur lors de la demande de nouveau mot de passe !"})
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ data: null, result: false, message: "Erreur serveur interne." });
    });
}

async function newPassword(req, res) {
    consolelog("newPassword route taken");
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
          return res.status(200).json({ data: result, result: true, message: "Mot de passe changé !" });
        } else {
          return res.status(401).json({ data: null, result: false, message: "Mot de passe non changé :( !"})
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ data: null, result: false, message: "Erreur serveur interne. (code 500)" });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ data: null, result: false, message: "Token invalide ou expiré ! (code 401)" });
    }
  }
  
module.exports = { resetPassword, newPassword };
