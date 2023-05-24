const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function selectAll(req, res, next) {
  consolelog("// Appel de la method selectAll de carouselController//");
  const sql = `SELECT * FROM carousel WHERE deletedBy = 0`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAll de carouselController //");
    res.status(200).json({data,result: true,message: `All rows of table account have been selected`});
  } catch (error) {
    consolelog(`++ !!!! Erreur attrapée dans selectAll de carouselController : ${error}.`);
    next(error)
  }
}

module.exports = { selectAll };
