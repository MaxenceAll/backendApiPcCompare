const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function isFavorited(req, res) {
  consolelog("// Appel de la method isFavorited de favoriteController//");
  const Id_article_to_find = req.params.Id_article_to_find;
  const Id_customer_to_find = req.params.Id_customer_to_find;
  try {
    const sql = `
        SELECT *
        FROM customer_article
        WHERE Id_customer = ?
        AND Id_article = ?;
      `;
    const data = await query(sql, [Id_customer_to_find, Id_article_to_find]);
    consolelog("---> Sortie de la method isFavorited de favoriteController //");
    res.status(data.length > 0 ? 200 : 204).json(data.length > 0);
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method isFavorited de favoriteController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}
async function getAllFavoriteByIdCustomer(req, res) {
  consolelog(
    "// Appel de la method getAllFavoriteByIdCustomer de favoriteController//"
  );
  const Id_customer_to_find = req.params.Id_customer_to_find;
  try {
    const sql = `
      SELECT ca.*, a.*, c.*
      FROM customer_article ca
      JOIN article a ON ca.Id_article = a.Id_article
      JOIN model m ON a.Id_model = m.Id_model
      JOIN category c ON m.Id_category = c.Id_category
      WHERE ca.Id_customer = ?;
          
      `;
    const data = await query(sql, [Id_customer_to_find]);
    consolelog(
      "---> Sortie de la method getAllFavoriteByIdCustomer de favoriteController //"
    );
    if (!data.length > 0) {
      return res.status(200).json({
        data: null,
        result: false,
        message: `Vous n'avez pas de favoris !`,
      });
    }
    res.status(200).json({
      data,
      result: true,
      message: `Voici tous vos favoris !`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method getAllFavoriteByIdCustomer de favoriteController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

async function removeFavoriteByIdCustomer(req, res) {
  consolelog(
    "// Appel de la method removeFavoriteByIdCustomer de favoriteController//"
  );
  const Id_customer_to_find = req.params.Id_customer_to_find;
  const Id_article_to_find = req.body.Id_article_to_find;
  const currentUser = req.currentUser;
    //TODO ajouter une sécurite verif que l'id trouvé correspônd azu req.currentUser
  try {
    const sql = `
    DELETE FROM customer_article
    WHERE Id_customer = ?
    AND Id_article = ?;
    `;
    const data = await query(sql, [Id_customer_to_find, Id_article_to_find]);
    consolelog(
      "---> Sortie de la method removeFavoriteByIdCustomer de favoriteController //"
    );
    if (data?.affectedRows === 1) {
      res.status(200).json({
        data,
        result: true,
        message: `Suppression de l'article ${Id_article_to_find} des favoris de l'utilisateur : ${Id_customer_to_find}`,
      });
    } else {
      res.status(400).json({
        data,
        result: false,
        message: `Erreur lors de la suppression de l'article ${Id_article_to_find} des favoris de l'utilisateur : ${Id_customer_to_find}.`,
      });
    }
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method removeFavoriteByIdCustomer de favoriteController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

async function addFavoriteByIdCustomer(req, res) {
  consolelog(
    "// Appel de la method addFavoriteByIdCustomer de favoriteController//"
  );
  const Id_customer_to_find = req.params.Id_customer_to_find;
  const Id_article_to_find = req.body.Id_article_to_find;
  const currentUser = req.currentUser;
    //TODO ajouter une sécurite verif que l'id trouvé correspônd azu req.currentUser
  try {
    const sql = `
    INSERT INTO customer_article (Id_customer, Id_article) 
    VALUES (?, ?);
    `;
    const data = await query(sql, [Id_customer_to_find, Id_article_to_find]);
    consolelog(
      "---> Sortie de la method addFavoriteByIdCustomer de favoriteController //"
    );
    if (data?.affectedRows === 1) {
      res.status(200).json({
        data,
        result: true,
        message: `Ajout de l'article ${Id_article_to_find} des favoris pour l'utilisateur : ${Id_customer_to_find}`,
      });
    } else {
      res.status(400).json({
        data,
        result: false,
        message: `Erreur lors de l'ajout de l'article ${Id_article_to_find} des favoris de l'utilisateur : ${Id_customer_to_find}.`,
      });
    }
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method addFavoriteByIdCustomer de favoriteController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

module.exports = {
  isFavorited,
  getAllFavoriteByIdCustomer,
  removeFavoriteByIdCustomer,
  addFavoriteByIdCustomer,
};
