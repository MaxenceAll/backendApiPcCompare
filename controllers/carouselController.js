const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");

async function selectAll(req, res) {
  consolelog("// Appel de la method selectAll de carouselController//");
  const sql = `SELECT * FROM carousel WHERE deletedBy = 0`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAll de carouselController //");
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `All rows of table account have been selected`,
    });
  } catch (err) {
    consolelog(`++ !!!! Erreur attrapée : (voir le retour).`);
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

module.exports = { selectAll };
