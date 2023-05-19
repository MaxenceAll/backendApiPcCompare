const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");
const path = require("path");
const fs = require("fs");
const mime = require('mime-types');

async function uploadAvatarByIdCustomer(req, res) {
  consolelog(
    "// Appel de la method uploadAvatarByIdCustomer de avatarController//"
  );
  try {
    const customerId = req.params.Id_customer;
    const file = req.file;

    if (!customerId || !file) {
      return res.status(400).json({
        message: "Invalid request. Customer ID or file not provided.",
      });
    }

    // Access the destination directory from multer setup
    const destinationDirectory = req.file.destination;
    const filePath = path.join(destinationDirectory, file.filename);

    // Delete existing files in the destination directory, except the newly uploaded file
    fs.readdirSync(destinationDirectory).forEach((existingFile) => {
      if (existingFile !== file.filename) {
        fs.unlinkSync(path.join(destinationDirectory, existingFile));
      }
    });

    // Save the file path or a reference to it in the database
    // await saveFilePathToDatabase(customerId, filePath);
    const sql = `
    UPDATE customer
    SET img_src = ?
    WHERE Id_customer = ?
    `;
    try {
      const data = await query(sql, [file.filename, customerId]);
    } catch (error) {
      consolelog(
        `Erreur lors de la sauvegarde en database du filename: ${err}.`
      );
      return res.status(500).json({
        data: null,
        result: false,
        message: err.message,
      });
    }

    res
      .status(200)
      .json({ result: true, message: "Fichier uploadé sur le server !" });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method uploadAvatarByIdCustomer de avatarController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

async function downloadAvatarByIdCustomer(req, res) {
  consolelog("// Appel de la method downloadAvatarByIdCustomer de avatarController//");
  try {

    const customerId = req.params.Id_customer;
    let data;
    try {
        const sql = `
        SELECT img_src
        FROM customer 
        WHERE Id_customer = ?
        `
        data = await query(sql, [customerId]);
        consolelog("yo la data trouvée est :",data)    
    } catch (error) {
        consolelog(`Erreur lors de la tentative de retrouver le nom du fichier : ${error}.`);
        return res.status(500).json({ message: 'Internal server error.' });
    }  

    const filename = data[0].img_src; // Extract the filename from data
    consolelog("yo le filename est :", filename)
    // Construct the file path based on the customer ID
    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars', customerId, filename);
    consolelog("yo donc le filepath est :",filePath)
  
    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Determine the file's MIME type
        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        // Set the Content-Type header
        res.set('Content-Type', contentType);
        // Send the file as a response
        res.sendFile(filePath);
      } else {
        // Return a default avatar or an error message
        res.status(404).json({ message: 'Avatar not found.' });
      }

  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method downloadAvatarByIdCustomer de avatarController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

module.exports = { uploadAvatarByIdCustomer, downloadAvatarByIdCustomer };
