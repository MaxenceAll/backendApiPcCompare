const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const { query } = require("../../services/database.service");

async function selectAllgpu(req, res) {
  consolelog("// Appel de la method selectAllgpu de compareController//");
  const sql = `SELECT *
  FROM article
  JOIN model ON article.Id_model = model.Id_model
  JOIN category ON model.Id_category = category.Id_category
  LEFT JOIN gpu ON article.Id_article = gpu.Id_article
  WHERE category.code = 'gpu';`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAll de carouselController //");
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

module.exports = { selectAllgpu };
