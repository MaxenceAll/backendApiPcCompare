const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const jwt = require("jsonwebtoken");

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
  const sql =
    "SELECT * FROM customer WHERE deletedBy IS NULL AND Id_customer = ?";
  try {
    const [customer] = await query(sql, [Id_customer]);
    consolelog("yoyo account c'est:", customer);
    consolelog(
      "---> Sortie de la method selectOneCustomer de customerController. //"
    );
    const sql2 = "SELECT * FROM account WHERE Id_account = ?";
    const [account] = await query(sql2, [customer.Id_account]);
    // TODO: ne pas renvoyer le hashedpassword
    const data = { ...customer, ...account };
    consolelog("Yo le data=", data);

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
  const foundAccessToken = req.cookies.accessToken;
  consolelog(
    "modifyCustomer called check le accessToken received(httponly):",
    foundAccessToken
  );
  if (!foundAccessToken) {
    return res.status(401).json({ message: "Non autorisé.", result: "false" });
  }
  try {
    const decoded = jwt.verify(
      foundAccessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = decoded;
  } catch (err) {
    consolelog("oops une erreur dans veriyfyRefresh Token", err);
    return res.status(401).json({ message: "Non autorisé.", result: "false" });
  }
  consolelog("yo yoyoyo le user est :", req.user);

  consolelog("modifyCustomer.put called with this req.body", req.body);
  const { Id_customer } = req.params;
  consolelog("modifyCustomer, with Id_customer = ", Id_customer);
  const { body } = req;
  for (const key in body) {
    if (key === "modifiedBy") {
      body[key] = decoded.pseudo;
    } else if (key === "modifiedAt") {
      body[key] = "NOW()";
    } else if (typeof body[key] === "string") {
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
  const sqlUpdate = `UPDATE customer SET ${values}, modifiedBy='${req.user.pseudo}', modifiedAt=NOW() WHERE deletedBy IS NULL AND Id_customer = ${Id_customer}`;
  consolelog("trying this sql to update:", sqlUpdate);
  try {
    const updateResult = await query(sqlUpdate);
    const sql1 = `SELECT * FROM customer WHERE deletedBy IS NULL AND Id_customer = ${Id_customer}`;
    let customer = await query(sql1);
    consolelog("le customer après l'update est :", customer);
    customer = customer.length == 1 ? customer.pop() : null;
    const result = customer != null && updateResult.affectedRows == 1;
    const message =
      (result ? `the` : `NO`) +
      ` row of table customer with Id_customer=${Id_customer} has been updated`;

    const sql5 = `SELECT * FROM role WHERE Id_role = ?`;
    consolelog("yoyoyoici on test customer.Id_role:", customer.Id_role);
    const [role] = await query(sql5, [customer.Id_role]);
    consolelog("++ Le customer trouvé est du role:", role);
    const sql4 = `SELECT * FROM account WHERE Id_account = ?`;
    const [account] = await query(sql4, [customer.Id_account]);
    const data = { ...account, ...customer, role: role.title };
    consolelog("yoyoyo la newdata:", data);
    // On crée un JWT avec la clé secrete dans .env
    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    // On crée un JWT de refresh  avec la clé secrete dans .env
    const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "10d",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      data,
      result: true,
      message,
      accessToken,
    });
  } catch (err) {
    consolelog("this error:", err);
    res.status(500).json({ data: null, result: false, message: err.message });
  }
}

module.exports = { selectAllCustomer, modifyCustomer, selectOneCustomer };
