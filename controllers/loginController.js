const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function handleLogin(req, res) {
  try {
    consolelog("// Appel de la method handleLogin //");
    //   On déconstruit req.body
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Il faut saisir un email Et un mot de passe.",
        result: `false`,
      });
    }

    // query pour chercher l'utilisateur en fonction du mail reçu
    const sql = `SELECT * FROM account WHERE deletedBy = 0 AND email = ?`;
    const [user] = await query(sql, [email]);
    consolelog("++ L'utilisateur trouvé est :", user);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Non autorisé.", result: "false" });
    }

    // On compare le password reçu avec celui en db.
    const passwordMatch = await bcrypt.compare(
      password,
      config.hash.prefix + user.password
    );
    consolelog("Comparons les mots de passe reçus :", passwordMatch);
    // ca correspond donc on va chercher le customer qui correspond
    if (!passwordMatch) {
      // Passwords do not match, reject login attempt
      return res
        .status(401)
        .json({ message: "Non autorisé.", result: "false" });
    }

    const sql2 = `SELECT * FROM customer WHERE id_account = ?`;
    const [customer] = await query(sql2, [user.id]);
    consolelog("++ Customer trouvé est :", customer);

    // update après avoir retrouvé la table cusotmer pour avoir la dernière connexion (avant celle-ci)
    const sql4 = `
    UPDATE customer
    SET last_connection = NOW()
    WHERE id = ?;
    `;
    const resultTest = await query(sql4, [customer.id]);
    // consolelog("yo le restultat est:", resultTest);

    // on crée un objet avec toutes les données //TODO ne pas intégrer le hashedpassword.
    const data = { ...user, ...customer };
    // consolelog("yoyoyo data:", data);
    // On crée un JWT avec la clé secrete dans .env
    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    // On crée un JWT de refresh  avec la clé secrete dans .env
    const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "10d",
    });

    // save refresh token to database
    const sql3 = `UPDATE account SET refresh_token = ? WHERE id = ?`;
    await query(sql3, [refreshToken, user.id]);

    // TODO ajoute var au max age et vérif que tout est ISO
    // Assigning refresh token in http-only cookie et envoi en cookie.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });
    consolelog("Login successful ! sending token and refreshToken (httpOnly)");
    return res.status(200).json({
      data: {
        data,
        result: true,
        message: "Authentification avec succes.",
        accessToken,
      },
    });
  } catch (error) {
    console.error(`Error in handleLogin: ${error}`);
    consolelog(`Error in handleLogin: ${error}`);
    return res
      .status(500)
      .json({ message: "Erreur interne.", result: "false" });
  }
}

async function handleLogout(req, res) {
  try {
    // décoder le refresh token pour savoir a qui on a afaire
    const refreshToken = req.cookies.refreshToken;
    consolelog("yo refreshToken:", refreshToken);
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    consolelog("yo decodedRefreshToken:", decodedRefreshToken);
    const userId = decodedRefreshToken.id_account;
    consolelog("yo userId:", userId);

    // update le token dans la database
    const sql = "UPDATE account SET refresh_token = NULL WHERE id = ?";
    await query(sql, [userId]);

    // envoyer un nouveau refreshToken "vide" et expiré
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
      sameSite: "None",
      secure: true,
    });

    return res.status(200).json({
      result: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(`Error in handleLogout: ${error}`);
    consolelog(`Error in handleLogout: ${error}`);
    return res.status(500).json({
      message: "Internal Server Error",
      result: false,
    });
  }
}

module.exports = { handleLogin, handleLogout };
