const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const { query } = require("../../services/database.service");

async function selectAll(req, res) {
  consolelog("// Appel de la method selectAll de dropdownmenuController//");
  const sql = `SELECT * FROM category`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAll de carouselController //");
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `Voici toutes les colonnes de la table category`,
    });
  } catch (err) {
    consolelog(`++ !!!! Erreur attrapée dans method selectAll de dropdownmenuController: ${err}.`);
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

module.exports = { selectAll };
