const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

async function loginUser(req, res) {
  try {
    consolelog("// Appel de la method loginUser //");
    const { email, password } = req.body;

    const sql = `SELECT * FROM account WHERE deletedBy = 0 AND email = ?`;
    const [user] = await query(sql, [email]);
    consolelog("++ L'utilisateur trouvé est :", user);
    if (!user) {
      throw new Error("Bad Login 1");
    }
    const passwordMatch = await bcrypt.compare(
      password,
      config.hash.prefix + user.password
    );
    if (passwordMatch) {
      const sql2 = `SELECT * FROM customer WHERE id_account = ?`;
      const [customer] = await query(sql2, [user.id]);
      consolelog("++ Customer trouvé est :", customer);

      const data = { ...user, ...customer };
      const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2m",
      });

      const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      // Assigning refresh token in http-only cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      consolelog(
        "Login successful ! sending token and refreshToken (httpOnly)"
      );
      res.status(200).json({ result: true, message: "Login OK", token });
    } else {
      // Passwords do not match, reject login attempt
      throw new Error("Bad Login 2");
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur d'authentification.",
    });
  }
}

async function refreshToken(req, res) {
    consolelog("// Appel de la fonction refreshToken")
    if (req.cookies?.jwt) {
        consolelog("Réception du cookie suivant :",req.cookies?.jwt);
      // Destructuring refreshToken from cookie
      const refreshToken = req.cookies.jwt;
  
      try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        consolelog("yo decoded is:",decoded);
        const sql = `SELECT * FROM account WHERE id = ?`;
        const [user] = await query(sql, [decoded.id_account]);
        if (!user) {
            throw new Error("User not found");
        }
        consolelog("++ L'utilisateur trouvé est :", user);
        const sql2 = `SELECT * FROM customer WHERE id_account = ?`;
        const [customer] = await query(sql2, [user.id]);
        consolelog("++ Customer trouvé est :", customer);
        

        // Generate new access token
        const data = { ...user , ...customer};
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "2m",
        });
        consolelog("__ Génération d'un nouveau token d'access grace au token refresh sécurisé !")
  
        // Send new token in response
        res.status(200).json({ result: true, message: "Token refreshed", token });
      } catch (error) {
        console.error(`Error in refreshToken: ${error}`);
        res.status(406).json({ message: "Unauthorized" });
      }
    } else {
      return res.status(406).json({ message: "Unauthorized" });
    }
  }  

module.exports = { loginUser, refreshToken };