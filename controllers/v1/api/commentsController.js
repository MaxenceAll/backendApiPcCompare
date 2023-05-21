const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function addComment(req, res) {
  consolelog("// Appel de la method addComment de commentsController//");
  const {Id_article, Id_customer, content, note} = req.body;
  const pseudo = req.currentUser.customer.pseudo;
  try {
    const SQL_ADD_COMMENT = `
    INSERT INTO comment (Id_customer, Id_article, note , content, createdBy) 
    VALUES (?, ?, ?, ?, ?);    
    `;
    const data = await query(SQL_ADD_COMMENT, [Id_customer, Id_article, note , content, pseudo]);
    if (data?.affectedRows === 1) {
        return res.status(200).json({ data: {Id_customer, Id_article, note, content, pseudo}, result: true, message: "Ajout du commentaire avec succès !"})
    }else {
        return res.status(400).json({ data: null, result: false, message: "Commentaire non ajouté."})
    }
  } catch (err) {
    consolelog(`++ !!!! Erreur attrapée dans method addComment de commentsController: ${err}.`);
    return res.status(500).json({data: null,result: false,message: "Erreur server interne"});
  }
}

async function deleteComment(req, res) {
    consolelog("// Appel de la méthode deleteComment de commentsController //");
    const { Id_comment_to_find } = req.params;  
    try {
      const SQL_DELETE_COMMENT = `
        DELETE FROM comment WHERE Id_comment = ?;
      `;
      const data = await query(SQL_DELETE_COMMENT, [Id_comment_to_find]);
  
      if (data?.affectedRows === 1) {
        return res.status(200).json({ result: true, message: "Commentaire supprimé avec succès !" });
      } else {
        return res.status(400).json({ result: false, message: "Commentaire non trouvé ou déjà supprimé." });
      }
    } catch (err) {
      consolelog(`++ !!!! Erreur attrapée dans la méthode deleteComment de commentsController: ${err}.`);
      return res.status(500).json({ result: false, message: "Erreur serveur interne" });
    }
  }

module.exports = { addComment, deleteComment };