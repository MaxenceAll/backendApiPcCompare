const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const nodemailer = require("nodemailer");
const mailer = {};

mailer.send = async (params) => {
  consolelog("// Tentative d'envoi de mail : //");
  try {
    const transporter = nodemailer.createTransport(config.mail);
    const info = await transporter.sendMail(params);
    const result = info.accepted.length > 0;
    consolelog("§§ MAIL : ",result ? "Envoyé" : "non envoyé.")
    return {
      data: info,
      result,
      message: result ? "email sent" : "email not sent",
    };
  } catch (error) {
    consolelog("!!!! Erreur lors de l'envoi du mail, (voir retour requete).")
    return { data: error, result: false, message: "No mail sent :(!" };
  }
};

module.exports = mailer;
