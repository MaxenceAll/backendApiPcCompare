const consolelog = require("../../../Tools/consolelog");
const config = require("../../../config/config");
const { query } = require("../../../services/database.service");

async function selectAll(req, res , next) {
  consolelog("// Appel de la method selectAll de allUsersDataController //");
  consolelog("!! On vérifie l'identité du demandeur de cette methode !!");
  if (req.currentUser.role !== "Administrateur") {
    return res.status(403).json({message: `Vous n'avez pas l'autorisation de faire cela !`});
  }
  const sql = `SELECT *
  FROM account
  INNER JOIN customer ON account.Id_account = customer.Id_account;
  `;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAll de allUsersDataController. //");
    res.status(200).json({data,result: true,message: `All rows of table account+customer have been selected`});
  } catch (error) {
    consolelog(`Erreur dans selectAll de allUsersDataController: ${error}`);
    next(error);
  }
}

module.exports = { selectAll };
