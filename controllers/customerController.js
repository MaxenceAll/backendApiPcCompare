const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");

async function selectAllCustomer(req, res) {
  consolelog("// Appel de la method selectAllCustomer //");
  const sql = `SELECT * FROM customer WHERE deletedBy IS NULL`;
  try {
    const data = await query(sql);
    consolelog(
      "---> Sortie de la method selectAllCustomer de customerController. //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `All rows of table customer have been selected`,
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

async function selectOneCustomer(req, res) {
  consolelog("// Appel de la method selectOneCustomer //");
  const { Id_customer } = req.params;
  const sql = 'SELECT * FROM customer WHERE deletedBy IS NULL AND Id_customer = ?';
  try {
    const [customer] = await query(sql, [Id_customer]);  
    consolelog(
      "---> Sortie de la method selectOneCustomer de customerController. //"
    );
    const sql2 = 'SELECT * FROM account WHERE deletedBy IS NULL AND Id_account = ?';
    const [account] = await query(sql2, [customer.Id_account]);
    // TODO: ne pas renvoyer le hashedpassword
      const data = { ...customer, ...account }
      // consolelog("Yo le data=",data)

    res.status(200).json({
      data,
      result: true,
      message: `All rows of table customer with id: ${Id_customer} have been selected and all rows of table account with id: ${customer.Id_account}`,
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

async function modifyCustomer(req, res) {
  consolelog("modifyCustomer.put called with this req.body", req.body);
  const { Id_customer } = req.params;
  consolelog("modifyCustomer, with Id_customer = ", Id_customer);
  const { body } = req;
  for (const key in body) {
    // if (key == "is_deleted") delete body[key];

    if (typeof body[key] == "string") {
      body[key] = body[key].replace(/'/g, "\\'");
    }
  }
  const entries = Object.entries(body);
  consolelog("entries are :", entries);
  const values = entries
    .map((entry) => {
      const [key, value] = entry;
      return `${key}='${value}'`;
    })
    .join(",");
  const sqlUpdate = `UPDATE customer SET ${values} WHERE deletedBy IS NULL AND Id_customer = ${Id_customer}`;
  consolelog("trying this sql to update:", sqlUpdate);
  await query(sqlUpdate)
    .then((updateResult) => {
      const sqlSelect = `SELECT * FROM customer WHERE deletedBy IS NULL AND Id_customer = ${Id_customer}`;
      consolelog("le sqlSelect après l'update est :", sqlSelect);
      query(sqlSelect)
        .then((data) => {
          data = data.length == 1 ? data.pop() : null;
          const result = data != null && updateResult.affectedRows == 1;
          const message =
            (result ? `the` : `NO`) +
            ` row of table customer with Id_customer=${Id_customer} has been updated`;
          res.json({ data, result, message });
        })
        .catch((err) => {
          consolelog("this error");
          res.json({ data: null, result: false, message: err.message });
        });
    })
    .catch((err) => {
      consolelog("this error 2 :", err);
      res.json({ data: null, result: false, message: err.message });
    });
}

module.exports = { selectAllCustomer, modifyCustomer, selectOneCustomer };
