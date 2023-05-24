const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function selectAll(req, res , next) {
  consolelog("// Appel de la method selectAll de allRoleDataController //");
  consolelog("!! On vérifie l'identité du demandeur de cette methode !!");
  if (req.currentUser.role !== "Administrateur") {
    return res.status(403).json({message: `Vous n'avez pas l'autorisation de faire cela !`});
  }
  const sql = `SELECT * FROM role`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAll de allRoleDataController. //");
    res.status(200).json({data,result: true,message: `All rows of table account+customer have been selected`});
  } catch (error) {
    consolelog(`Erreur dans selectAll de allRoleDataController: ${error}`);
    next(error)
  }
}

module.exports = { selectAll };
