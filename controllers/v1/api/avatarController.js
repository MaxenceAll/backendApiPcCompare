const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

async function uploadAvatarByIdCustomer(req, res) {
  consolelog("// Appel de la method uploadAvatarByIdCustomer de avatarController//");
  try {
    const Id_customer = req.params.Id_customer;
    const file = req.file;
    if (!Id_customer || !file) {
      consolelog("=> Sortie de la method uploadAvatarByIdCustomer de avatarController car pas d'Id ou de fichier reçu.");
      return res.status(400).json({ message: "Il manque l'id_customer ou le fichier."});
    }
    // On utilise le req qui est ajouté par le middleware multer
    const destinationDirectory = req.file.destination;
    // On sauvegarde le fichier reçu sur le server en utilisant le chemin connu via la configuration multer (destination)
    const filePath = path.join(destinationDirectory, file.filename);
    // On supprime tous les autres avatars différents du fichier qu'on vient de créer. (1 avatar pâr customer)
    fs.readdirSync(destinationDirectory).forEach((existingFile) => {
      if (existingFile !== file.filename) {
        fs.unlinkSync(path.join(destinationDirectory, existingFile));
      }
    });
    // On sauvegarde le nom du fichier dans la database, pour vérifier par la suite si on a un avatar ou pas.
    const sql = `UPDATE customer SET img_src = ? WHERE Id_customer = ?`;
    try {
      const data = await query(sql, [file.filename, Id_customer]);
    } catch (error) {
      consolelog(`Erreur lors de la sauvegarde en database du filename: ${err}.`);
      return res.status(500).json({ data: null, result: false, message: err.message});
    }
    res.status(200).json({ result: true, message: `Fichier uploadé sur le server pour le customer ${Id_customer} !`});    
  } catch (err) {
    consolelog(`++ !!!! Erreur attrapée dans method uploadAvatarByIdCustomer de avatarController: ${err}.`);
    res.status(500).json({ data: null, result: false, message: err.message});
  }
}

const downloadAvatarByIdCustomer = async (req, res) => {
  consolelog("// Appel de la méthode downloadAvatarByIdCustomer de avatarController//");
  try {
    const Id_customer = req.params.Id_customer;
    let data;
    try {
      const sql = `SELECT img_src FROM customer WHERE Id_customer = ?`;
      data = await query(sql, [Id_customer]);
    } catch (error) {
      consolelog(`Erreur lors de la tentative de retrouver le nom du fichier : ${error}.`);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Avons-nous un nom de fichier dans la datbase ?
    if (data.length === 0 || !data[0].img_src) {
      consolelog("Aucun avatar trouvé pour ce client.");
      return res.status(204).json({ data: null, result: false, message: "Aucun avatar trouvé." });
    }

    const filename = data[0].img_src;
    // On va chercher sur le server, avec la bonne url (qui contient le Id_customer) et le filename retrouvé via la query précédente
    const filePath = path.join(__dirname, "..", "..", "..", "uploads", "avatars", Id_customer, filename);

    if (fs.existsSync(filePath)) {
      consolelog(`Un avatar pour l'Id_customer ${Id_customer} a été trouvé à l'url suivante ${filePath}.`)
      // On détermine le type de fichier dont il s'agit afin de set les headers
      const contentType = mime.lookup(filePath) || "application/octet-stream";
      res.set("Content-Type", contentType);
      // On envoit le fichier !
      res.sendFile(filePath);
    } else {
      // Si on trouve pas le fichier sur le server !
      consolelog("Fichier introuvable :", filePath);
      return res.status(204).json({ data: null, result: false, message: "Avatar non trouvé." });
    }
  } catch (error) {
    consolelog(`++ !!!! Erreur attrapée dans la méthode downloadAvatarByIdCustomer de avatarController: ${error}.`);
    res.status(500).json({ data: null, result: false, message: error.message });
  }
};


const removeAvatarByIdCustomer = async (req, res) => {
  consolelog("// Appel de la méthode removeAvatarByIdCustomer de avatarController//");
  try {
    const Id_customer = req.params.Id_customer;

    try {
      const sql = `UPDATE customer SET img_src = ? WHERE Id_customer = ?`;
      await query(sql, [null, Id_customer]);
    } catch (error) {
      consolelog(`++ !!!! Erreur attrapée lors de la tentative de supprimer le lien de la database: ${error}.`);
      res.status(500).json({ data: null, result: false, message: error.message });
    }
   res.status(200).json({ data: null, result: true, message: "Avatar supprimé avec succès !" });

  } catch (error) {
    consolelog(`++ !!!! Erreur attrapée dans la méthode removeAvatarByIdCustomer de avatarController: ${error}.`);
    res.status(500).json({ data: null, result: false, message: error.message });
  }
};

module.exports = { uploadAvatarByIdCustomer, downloadAvatarByIdCustomer , removeAvatarByIdCustomer };