const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const { query } = require("../../services/database.service");

async function selectAllAccount(req, res) {
  consolelog("// Appel de la method selectAllAccount //");
  const sql = `SELECT * FROM account`;
  try {
    const data = await query(sql);
    consolelog("---> Sortie de la method selectAllAccount de database.service. //");
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

// const Db = require("../models/dataBase");
// const Customer = require("../models/customer");

// Db.synchronize();
// async function selectAll(req, res) {
//   try {
//     const customer = await Customer.findOne({
//       where: { Id_customer: 1 },
//       include: [Db.getModel("Account")],
//     });
//     console.log("==============================")
//     console.log(customer.Account);
//     console.log("==============================")
//     res.send("Success!");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Something went wrong!");
//   }
// }

module.exports = { selectAllAccount };
