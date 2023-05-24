const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function selectAll(req, res, next) {
  consolelog("// Appel de la method selectAll de dropdownmenuController//");
  const sql = `SELECT * FROM category`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAll de carouselController //");
    return res.status(200).json({data,result: true,message: `Voici toutes les colonnes de la table category`});
  } catch (error) {
    consolelog(`++ !!!! Erreur attrapée dans method selectAll de dropdownmenuController: ${error}.`);
    next(error);
  }
}

module.exports = { selectAll };
