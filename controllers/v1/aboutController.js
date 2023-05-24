const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const mailer = require("../../services/mailer.service");

async function contactMe(req, res, next) {
  consolelog("// Appel de la method contactMe de resetController //");
  try {
    const { name, email, subject , message} = req.body;
    const html = `${name} (${email}) a envoyé le message suivant : <pre>${message}</pre>`;
    const mailParams = {
        to: config.mail.privateEmails,
        subject: subject,
        html: html,
      };
    const mailResult = await mailer.send(mailParams);
    consolelog(`!! Retour du mailer :`,mailResult);
    if (mailResult.result){
        return res.status(200).json({ result: true, message: `Mail envoyé avec succès !`});
    } else {        
        return res.status(500).json({ result: false, message: `Aucun mail envoyé oops :(`});
    }
    } catch (error) {
        consolelog(`XX Erreur dans contactMe :`,error)
        res.messageRetour = "Erreur lors de l'envoi du mail. (Contactez un administrateur) !"
        next(error)
      }
}

module.exports = { contactMe };