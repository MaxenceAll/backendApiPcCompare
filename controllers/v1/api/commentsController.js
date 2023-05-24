const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function addComment(req, res , next) {
  consolelog("// Appel de la method addComment de commentsController//");
  const {Id_article, Id_customer, content, note} = req.body;
  const pseudo = req.currentUser.customer.pseudo;

  const role = req.currentUser?.role
  if (role==="Banni"){
      return res.status(401).json({ isBanned: true, message: `Vous n'avez pas le droit d'ajouter des commentaires !`})
  }

  try {
    const SQL_ADD_COMMENT = `
    INSERT INTO comment (Id_customer, Id_article, note , content, createdBy) 
    VALUES (?, ?, ?, ?, ?);    
    `;
    const data = await query(SQL_ADD_COMMENT, [Id_customer, Id_article, note , content, pseudo]);
    if (data?.affectedRows === 1) {
        return res.status(200).json({ data: {Id_customer, Id_article, note, content, pseudo}, result: true, message: "Ajout du commentaire avec succès !"})
    }else {
        return res.status(400).json({ data: null, message: "Commentaire non ajouté."})
    }
  } catch (error) {
    consolelog(`++ !!!! Erreur attrapée dans method addComment de commentsController: ${error}.`);
    next(error);
  }
}

async function deleteComment(req, res, next) {
    consolelog("// Appel de la méthode deleteComment de commentsController //");
    const { Id_comment_to_find } = req.params;
    
    const role = req.currentUser?.role
    if (role==="Banni"){
      return res.status(401).json({ isBanned: true, message: `Vous n'avez pas le droit de supprimer vos commentaires !`})
    }

    try {
      const SQL_DELETE_COMMENT = `
      DELETE FROM comment WHERE Id_comment = ?;
      `;
      const data = await query(SQL_DELETE_COMMENT, [Id_comment_to_find]);  
      if (data?.affectedRows === 1) {
      return res.status(200).json({ result: true, message: "Commentaire supprimé avec succès !" });
      } else {
      return res.status(400).json({ message: "Commentaire non trouvé ou déjà supprimé." });
      }
    } catch (error) {
      consolelog(`++ !!!! Erreur attrapée dans la méthode deleteComment de commentsController: ${error}.`);
      next(error);
    }
}

async function modifyComment(req, res, next) {
    consolelog("// Appel de la méthode modifyComment de commentsController //");
    const { Id_comment_to_find } = req.params;
    const { content, note } = req.body;
    const  pseudo = req.currentUser?.customer.pseudo;

    const role = req.currentUser?.role
    if (role==="Banni"){
        return res.status(401).json({ isBanned: true, message: `Vous n'avez pas le droit de modifier vos commentaires !`})
    }
  
    try {
      const SQL_MODIFY_COMMENT = `
        UPDATE comment
        SET content = ?, note = ? , modifiedAt = NOW() , modifiedBy = ?
        WHERE Id_comment = ?;
      `;
      const data = await query(SQL_MODIFY_COMMENT, [content, note,pseudo, Id_comment_to_find]);
  
      if (data?.affectedRows === 1) {
        return res.status(200).json({ result: true, message: "Commentaire modifié avec succès !" });
      } else {
        return res.status(400).json({ message: "Commentaire non trouvé ou déjà modifié." });
      }
    } catch (err) {
      consolelog(`++ !!!! Erreur attrapée dans la méthode modifyComment de commentsController: ${err}.`);
      next(error);
    }
}
async function getAllCommentsByIdCustomer(req, res, next) {
    consolelog("// Appel de la méthode getAllCommentsByIdCustomer de commentsController //");
    const { Id_customer_to_find } = req.params;
    try {
        const SQL_GET_ALL = `
        SELECT c.*, a.*, cat.*
        FROM comment c
        JOIN article a ON c.Id_article = a.Id_article
        JOIN model m ON a.Id_model = m.Id_model
        JOIN category cat ON m.Id_category = cat.Id_category
        WHERE c.Id_customer = ?
        `
        const data = await query(SQL_GET_ALL, [Id_customer_to_find]);
        if (data?.length > 0) {
            return res.status(200).json({ data: data,result: true, message: `Voici tous les commentaires de ${Id_customer_to_find}`})
        }
        return res.status(204).json({ message: "Aucun commentaire trouvé pour cet utilisateur." });   
    } catch (error) {
      consolelog(`++ !!!! Erreur attrapée dans la méthode getAllCommentsByIdCustomer de commentsController: ${error}.`);
      next(error);
    }
}



module.exports = { addComment, deleteComment , modifyComment, getAllCommentsByIdCustomer };