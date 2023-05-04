const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const jwt = require("jsonwebtoken");

async function selectOneCustomer(req, res) {
  try {
    consolelog("// Appel de la method selectOneCustomer //");
    const { Id_customer } = req.params;
    consolelog(
      "?? Nous tetons de chercher les infos de l'utilisateur avec l'id:",
      Id_customer
    );
    if (!Id_customer) {
      consolelog("Aucun Id_customer détecté dans l'url de la requete.");
      return res.status(404).json({
        data: null,
        result: false,
        message: `Aucun Id_customer détecté dans l'url de la requete.`,
      });
    }

    let account, customer, role;
    try {
      // On cherche toutes les informations d'un utilisateur :
      const SQL_selectOneCustomer = `SELECT customer.*, role.*, account.email
    FROM customer
    INNER JOIN role ON customer.Id_role = role.Id_role
    INNER JOIN account ON customer.Id_account = account.Id_account
    WHERE customer.Id_customer = ? AND customer.deletedBy IS NULL;
    `;
      const [userFound] = await query(SQL_selectOneCustomer, [Id_customer]);
      if (!userFound) {
        consolelog(
          `XX Erreur lors de la recherche de donnée de customer avec l'id ${Id_customer}.`
        );
        return res.status(401).json({
          message: "Erreur lors de la recherche de donnée de customer.",
          result: false,
        });
      }

      // Remplissage des objets pour utilisations futures.
      account = {
        email: userFound.email,
        // Noter qu'on envoit que le mail, pas le hashedpassword
      };
      customer = {
        Id_account: userFound.Id_account,
        Id_customer: userFound.Id_customer,
        Id_role: userFound.Id_role,
        pseudo: userFound.pseudo,
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        last_connection: userFound.last_connection,
        createdBy: userFound.createdBy,
        createdAt: userFound.createdAt,
        modifiedBy: userFound.modifiedBy,
        modifiedAt: userFound.modifiedAt,
        deletedBy: userFound.deletedBy,
        deletedAt: userFound.deletedAt,
      };
      role = {
        title: userFound.title,
      };
    } catch (error) {
      consolelog(
        "XX Erreur lors de la recherche des données de l'utilisateur:",
        error
      );
      return res.status(500).json({
        message: "Erreur lors de la recherche des données de l'utilisateur",
        result: false,
      });
    }

    const result = {
      account: account,
      customer: customer,
      role: role,
    };
    // Tout est ok, on fait le retour des données de l'utilisateur trouvé.
    consolelog(
      `?? Nous avons trouvé l'utilisateur avec l'id ${Id_customer}: ses infos :`,
      result
    );
    return res.status(200).json({
      data: result,
      result: true,
      message: `Voici les données de l'utilisateur avec l'id : ${Id_customer}`,
    });
  } catch (error) {
    console.error(`Error in handleLogout: ${error}`);
    consolelog(`Error in handleLogout: ${error}`);
    return res.status(500).json({ message: "Erreur interne.", result: false });
  }
}

async function modifyCustomer(req, res) {
  // TODO !!!! pas besoin d'aller chercher le refreshtoken y'a un middleware!
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

module.exports = { modifyCustomer, selectOneCustomer };
