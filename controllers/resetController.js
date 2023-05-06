const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const mailer = require("../services/mailer.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function resetPassword(req, res) {
  consolelog("resetPassword route taken");
  const { email } = req.body;

  // process.env.JWT_SECRET
  // trouver l'account en fonction du mail reçu
  // faire un jwt avec les données du compte
  // préparer un mail avec le token dans l'URL
  // envoyer le mail
  // voir ce que renvoi mailer service pour l'utiliser en front.
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
        // TODO fix this, needs a res.json .res.status
        throw new Error(
          "Error while gettin new pw"
        );
      }
    })
    .catch((error) => {
      res.json({ data: null, result: false, message: error.message });
    });
}

async function newPassword(req, res) {
    consolelog("newPassword route taken");
    const { body } = req;
    consolelog("voici le body de la requete :",body);
    try {
      if (!body.token) {
        return res.status(400).json({ data: null, result: false, message: "No token provided in the request" });
      }
      const data = jwt.verify(body.token, process.env.JWT_SECRET);
      if (!data) {
        return res.status(401).json({ data: null, result: false, message: "Invalid or expired token provided" });
      }
      consolelog("yo theres data, here it is:",data)
      const hash = bcrypt.hashSync(body.password1, 10);
      const hashedPassword = hash.replace(config.hash.prefix, "");
  
      const sql = `
        UPDATE account
        SET password = ?,
            modifiedBy = 'site',
            modifiedAt = NOW()
        WHERE Id_account = ?
      `;
      const params = [hashedPassword, data.Id_account];
  
      try {
        const result = await query(sql, params);
        consolelog("yo voici le résult de la query:",result);
        consolelog(`Modification du mot de passe de : ${data.email}`);
        res.json({ data: result, result: true, message: "Password updated successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ data: null, result: false, message: "Internal server error" });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ data: null, result: false, message: "Invalid or expired token provided" });
    }
  }
  
module.exports = { resetPassword, newPassword };
