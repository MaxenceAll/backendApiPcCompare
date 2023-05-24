const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const { query } = require("../../services/database.service");
const jwt = require("jsonwebtoken");
const { getAllCustomerDataById } = require("../../services/getAllCustomerData");

async function selectOneCustomer(req, res , next) {
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

    // Appel d'une function qui recherche toutes les infos d'un utilisateur (de account/customer/role) à partir d'un Id_customer.
    const result = await getAllCustomerDataById(Id_customer);
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
    consolelog(`Error in handleLogout: ${error}`);
    next(error);
  }
}

async function modifyCustomer(req, res , next) {
  try {
    // je vérifie la présence d'un utilisateur dans req.currentUser et d'un body
    consolelog("reqcurrentUser is :", req.currentUser);
    consolelog("reqbody is :", req.body);
    const Id_customer = req.body.Id_customer;
    consolelog("Id_customer is :", Id_customer);
    const currentUser = req.currentUser;
    consolelog("currentUser is :", currentUser);
    if (!Id_customer) {
      consolelog("Hello y'a pas d'id pour modifier");
      return res.status(404).json({ result: false, message: "manque l'id" });
    }
    if (!currentUser) {
      consolelog("Il manque le req.currentuser");
      return res.status(404).json({ result: false, message: "no req.currentuser" });
    }

    // verifier la dispo du pseudo TODO mettre ça ailleurs XD
    // consolelog("On vérifie si le pseudo est dispo ou pas");
    // try {
    //   const pseudoToTest = req.body.pseudo;
    //   consolelog("--> Test de la disponibilité du pseudo: ", pseudoToTest);
    //   const sql = `SELECT * FROM customer WHERE pseudo = ?`;
    //   const response = await query(sql, [pseudoToTest]);
    //   if (response.length > 0) {
    //     consolelog(`++ Le pseudo ${pseudoToTest} n'est pas disponible.`);
    //     return res.status(200).json({ result: false, message: `Ce pseudo (${pseudoToTest}) n'est pas disponible.`});
    //   } else {
    //     consolelog(`XX Le pseudo ${pseudoToTest} est disponible.`);
    //   }
    // } catch (error) {
    //   consolelog(`XX Erreur dans verifyPseudoAvailable: ${error}`);
    //   return res.status(500).json({ data: null,message: "Erreur interne.", result: false });
    // }


    if (currentUser.customer.Id_customer !== Id_customer) {
      consolelog(`Le middleware a détécté l'id : ${currentUser.customer.Id_customer} alors que le formulaire a envoyé l'id: ${Id_customer}!`);
      if (currentUser.role !== "Administrateur") {
        return res.status(401).json({result: false,message:"vous tentez de modifier un autre utilisateur sans être admin!!",});
      }
    }

    const { body } = req;
    for (const key in body) {
      if (key === "modifiedBy") {
        body[key] = currentUser.customer.pseudo;
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
    consolelog("values are:", values);

    const sqlUpdate = `UPDATE customer SET ${values}, modifiedBy='${currentUser.customer.pseudo}', modifiedAt=NOW() WHERE deletedBy IS NULL AND Id_customer = ${Id_customer}`;
    try {
      const data = await query(sqlUpdate);
      consolelog("yo le retour de la sqlupdate (data) is :", data);
      if(data){
        return res.status(200).json({data,result: true,message: `Modification de l'utilisateur avec l'id ${Id_customer} par l'utilisateur : ${currentUser.customer.pseudo}`,});
      }else {
        return res.status(401).json({data:null, result: false, message: `Erreur lors de la modification de votre pseudo !`})
      }
    } catch (error) {
      consolelog(`Erreur lors de la requete pour modifier l'utilisateur avec l'id ${Id_customer} par l'utilisateur : ${currentUser.customer.pseudo}`);
      next(error);
    }
  } catch (error) {
    console.error(`Error in modifyCustomer: ${error}`);
    consolelog(`Error in modifyCustomer: ${error}`);
    next(error);
  }}

module.exports = { modifyCustomer, selectOneCustomer };
