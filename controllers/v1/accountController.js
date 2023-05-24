const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const { query } = require("../../services/database.service");

async function selectAllAccount(req, res , next) {
  consolelog("// Appel de la method selectAllAccount //");
  const sql = `SELECT * FROM account`;
  try {
    consolelog("!! On vérifie l'identité du demandeur de cette methode !!");
    
    if (req.currentUser.role !== "Administrateur") {
      return res.status(403).json({data: null,result: false,message: `Vous n'avez pas l'autorisation de faire cela !`});
    }

    const data = await query(sql);
    consolelog("---> Sortie de la method selectAllAccount de database.service. //");
    res.status(200).json({data,result: true,message: `All rows of table account have been selected`});

  } catch (error) {
    consolelog(`++ !!!! Erreur attrapée dans selectAllAccount : ${error}.`);
    next(error)
  }
}

module.exports = { selectAllAccount };
