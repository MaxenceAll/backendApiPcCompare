const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function getAllCommentsByIdCustomer(req, res) {
  consolelog("// Appel de la method getAllCommentsByIdCustomer de testController//");
  const Id_article_to_find = req.params.Id_article_to_find;
  try {
    const sql = `
    SET @sql = NULL;
    
    SELECT
        GROUP_CONCAT(DISTINCT
            CONCAT('MAX(CASE WHEN s.seller_name = ''', s.seller_name, ''' THEN hp.price END) AS \`', REPLACE(s.seller_name, ' ', '_'), '_Price\`')
        ) INTO @sql
    FROM
        seller_historique_article sha
    JOIN seller s ON s.Id_seller = sha.Id_seller
    JOIN historique_prix hp ON hp.Id_historique_prix = sha.Id_historique_prix;
    
    SET @sql = CONCAT('SELECT hp.Id_historique_prix, hp._date, ', @sql, '
                    FROM seller_historique_article sha
                    JOIN seller s ON s.Id_seller = sha.Id_seller
                    JOIN historique_prix hp ON hp.Id_historique_prix = sha.Id_historique_prix
                    WHERE sha.Id_article = ?
                    GROUP BY hp.Id_historique_prix, hp._date');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    `;
    const data = await query(sql, [Id_article_to_find]);
    consolelog("yo la data est :", data);

    res.status(200).json({ message: "just a test !" });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method getAllCommentsByIdCustomer de testController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

module.exports = {
  getAllCommentsByIdCustomer,
};
