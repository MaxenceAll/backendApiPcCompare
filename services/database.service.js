const mysql = require("mysql2/promise");
const config = require("../config/config");
//  IMPORT d'une fonction custom pour log avec timestamp:
const consolelog = require("../Tools/consolelog");

// const pool = mysql.createPool({
//   host: config.db.host,
//   port: config.db.port,
//   database: config.db.database,
//   user: config.db.user,
//   password: config.db.password,
//   connectionLimit: 10
// });

let db;
async function connect() {
  if (!db) {
    const { host, port, database, user, password } = config.db;
    consolelog(`new connexion made sur la database: ${database}`);
    db = await mysql.createConnection({
      host,
      port,
      database,
      user,
      password,
    });
  }
  return db;
}

async function query(sql, params = []) {
  consolelog("// Appel de la method QUERY de database.service. //");
  const connection = await connect();
  try {
    const [rows] = await connection.execute(sql, params);
    consolelog("=> Requete appelée:", sql);
    consolelog("==>Retour de la requete:", [rows]);
    consolelog("---> Sortie de la method QUERY de database.service. //");
    return rows;
  } catch(error) {
    consolelog("Oops une erreur lors de la tentative de Query:",error)
  }
}

module.exports = {
  connect,
  query,
};
