const consolelog = require("../Tools/consolelog");
const { query } = require("./database.service");

async function getAllCustomerDataById(Id_customer) {
  try {
    let account, customer, role;
    // On cherche toutes les informations d'un utilisateur :
    const SQL_selectOneCustomer = `SELECT customer.*, role.*, account.email
  FROM customer
  INNER JOIN role ON customer.Id_role = role.Id_role
  INNER JOIN account ON customer.Id_account = account.Id_account
  WHERE customer.Id_customer = ? AND customer.deletedBy IS NULL;
  `;
    const [userFound] = await query(SQL_selectOneCustomer, [Id_customer]);
    if (!userFound) {
      throw new Error(
        `XX Erreur lors de la recherche de donnée de customer avec l'id ${Id_customer}.`
      );
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

    const result = {
      account: account,
      customer: customer,
      role: role,
    };
    // Tout est ok, on fait le retour des données de l'utilisateur trouvé.
    return result;
  } catch (error) {
    consolelog("XX Error lors de la getAllCustomerDataById :", error);
    throw new Error("Error lors de la getAllCustomerDataById method :",error.message);
  }
}

async function getAllCustomerDataByEmail(email) {
  try {
    const SQL_allData = `
      SELECT account.email, account.password, customer.*, role.*
      FROM account
      JOIN customer ON account.Id_account = customer.Id_account
      JOIN role ON customer.Id_role = role.Id_role
      WHERE account.email = ?
    `;
    const [allData] = await query(SQL_allData, [email]);
    if (!allData) {
      throw new Error("Erreur lors de l'authentification 33.");
    }

    const account = {
      email: allData.email,
    };
    const customer = {
      Id_account: allData.Id_account,
      Id_customer: allData.Id_customer,
      Id_role: allData.Id_role,
      pseudo: allData.pseudo,
      firstname: allData.firstname,
      lastname: allData.lastname,
      last_connection: allData.last_connection,
      createdBy: allData.createdBy,
      createdAt: allData.createdAt,
      modifiedBy: allData.modifiedBy,
      modifiedAt: allData.modifiedAt,
      deletedBy: allData.deletedBy,
      deletedAt: allData.deletedAt,
    };
    const role = {
      title: allData.title,
    };

    const data = {
      account: account.email,
      customer: customer,
      role: role.title,
    };
    return data;
  } catch (error) {
    consolelog("XX Error lors de la getAllCustomerDataByEmail :", error);
    throw new Error("Error lors de la getAllCustomerDataByEmail method :",error.message);
  }
}

module.exports = { getAllCustomerDataById, getAllCustomerDataByEmail };
