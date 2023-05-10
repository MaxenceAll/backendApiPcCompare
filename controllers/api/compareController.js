const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const { query } = require("../../services/database.service");

async function selectAllgpu(req, res) {
  consolelog("// Appel de la method selectAllgpu de compareController//");
  //   const sql = `SELECT *
  //   FROM article
  //   JOIN model ON article.Id_model = model.Id_model
  //   JOIN category ON model.Id_category = category.Id_category
  //   LEFT JOIN gpu ON article.Id_article = gpu.Id_article
  //   WHERE category.code = 'gpu';`;
  const sql = `
  SELECT a.*, m.*, c.*, g.*, h.price AS latest_price
  FROM article a
  JOIN model m ON a.Id_model = m.Id_model
  JOIN category c ON m.Id_category = c.Id_category
  LEFT JOIN gpu g ON a.Id_article = g.Id_article
  LEFT JOIN (
    SELECT s.Id_article, MAX(s.Id_historique_prix) AS max_historique_prix
    FROM seller_historique_article s
    GROUP BY s.Id_article
  ) latest_seller_historique_article ON a.Id_article = latest_seller_historique_article.Id_article
  LEFT JOIN historique_prix h ON latest_seller_historique_article.max_historique_prix = h.Id_historique_prix
  WHERE c.code = 'gpu';  
`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAllgpu de compareController //");
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici toutes les infos pour les cg`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method selectAllgpu de compareController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}
async function selectOneArticle(req, res) {
  consolelog("// Appel de la method selectOneArticle de compareController//");
  const Id_article_to_find = req.params.Id_article_to_find;
  const sql = `
  SELECT *
FROM article
JOIN model ON article.Id_model = model.Id_model
JOIN category ON model.Id_category = category.Id_category
JOIN gpu ON article.Id_article = gpu.Id_article
WHERE article.Id_article = ?;
`;
  try {
    const data = await query(sql, [Id_article_to_find]);
    consolelog(
      "---> Sortie de la method selectOneArticle de compareController //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici toutes les infos pour le produit ${Id_article_to_find}`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method selectOneArticle de compareController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

async function shaForOneArticle(req, res) {
  consolelog("// Appel de la method shaForOneArticle de compareController//");
  const Id_article_to_find = req.params.Id_article_to_find;
  const sql = `
  SELECT *
  FROM seller_historique_article
  WHERE seller_historique_article.Id_article = ?;
`;
  try {
    const data = await query(sql, [Id_article_to_find]);
    consolelog(
      "---> Sortie de la method shaForOneArticle de compareController //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici la table de correspondance pour le produit ${Id_article_to_find}`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method shaForOneArticle de compareController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}
async function sellerForOneArticle(req, res) {
  consolelog(
    "// Appel de la method sellerForOneArticle de compareController//"
  );
  const Id_article_to_find = req.params.Id_article_to_find;
  const sql = `
  SELECT DISTINCT seller.Id_seller, seller.seller_name, seller.img_src_seller, seller.img_alt_seller
  FROM seller
  JOIN (
     SELECT DISTINCT Id_seller
     FROM seller_historique_article
     WHERE Id_article = ?
  ) AS sha ON seller.Id_seller = sha.Id_seller;  
`;
  try {
    const data = await query(sql, [Id_article_to_find]);
    consolelog(
      "---> Sortie de la method sellerForOneArticle de compareController //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici tous les vendeurs pour le produit ${Id_article_to_find}`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method sellerForOneArticle de compareController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}
async function historiqueForOneArticle(req, res) {
  consolelog(
    "// Appel de la method historiqueForOneArticle de compareController//"
  );
  const Id_article_to_find = req.params.Id_article_to_find;
  const sql = `
  SELECT historique_prix.Id_historique_prix, historique_prix.price, historique_prix._date
FROM seller_historique_article
JOIN historique_prix ON historique_prix.Id_historique_prix = seller_historique_article.Id_historique_prix
WHERE seller_historique_article.Id_article = ?;
`;
  try {
    const data = await query(sql, [Id_article_to_find]);
    consolelog(
      "---> Sortie de la method historiqueForOneArticle de compareController //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici tous les prix pour le produit ${Id_article_to_find}`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method historiqueForOneArticle de compareController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}
async function selectHistoriqueByIdArticleAndIdSeller(req, res) {
  const articleId = req.params.Id_article;
  const sellerId = req.params.Id_seller;
  consolelog(
    "// Appel de la method selectHistoriqueByIdArticleAndIdSeller de compareController//"
  );
  const sql = `
  SELECT hp.price, hp._date
  FROM seller_historique_article sha
  JOIN seller s ON sha.Id_seller = s.Id_seller
  JOIN historique_prix hp ON sha.Id_historique_prix = hp.Id_historique_prix
  WHERE s.Id_seller = ?
  AND sha.Id_article = ?;
`;
  try {
    const data = await query(sql, [sellerId, articleId]);
    consolelog(
      "---> Sortie de la method selectHistoriqueByIdArticleAndIdSeller de compareController //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici tous les prix pour le produit ${articleId} et le vendeur ${sellerId}`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method selectHistoriqueByIdArticleAndIdSeller de compareController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

async function selectCommentsByIdArticle(req, res) {
  const articleId = req.params.Id_article;
  consolelog(
    "// Appel de la method selectCommentsByIdArticle de compareController//"
  );
  const sql = `
  SELECT * FROM comment WHERE Id_article = ?
`;
  try {
    const data = await query(sql, [articleId]);
    consolelog(
      "---> Sortie de la method selectCommentsByIdArticle de compareController //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici tous les commentaires pour le produit ${articleId}.`,
    });
  } catch (err) {
    consolelog(
      `++ !!!! Erreur attrapée dans method selectCommentsByIdArticle de compareController: ${err}.`
    );
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}



module.exports = {
  selectAllgpu,

  selectOneArticle,

  shaForOneArticle,
  sellerForOneArticle,
  historiqueForOneArticle,


  selectHistoriqueByIdArticleAndIdSeller,


  selectCommentsByIdArticle,
};
