const jwt = require('jsonwebtoken');
const consolelog = require('../Tools/consolelog');
const { query } = require('../services/database.service');

async function handleRefreshToken(req, res) {
    consolelog("// Appel de la fonction refreshToken");
    consolelog("test de req.cookies?.refreshToken",req.cookies?.refreshToken)
    if (req.cookies?.refreshToken) {
      consolelog("Réception du cookie suivant :", req.cookies?.refreshToken);
      // Destructuring refreshToken from cookie
      const refreshToken = req.cookies.refreshToken;
  
      try {
        // Verify refresh token
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        // consolelog("yo decoded is:",decoded);
        if (!decoded.id_account) {
          throw new Error("Refresh token invalide !");
        }
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
        const data = { ...user, ...customer };
        const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        consolelog(
          "__ Génération d'un nouveau token d'access grace au token refresh sécurisé !"
        );
  
        // Send new token in response
        res.status(200).json({ result: true, message: "Token refreshed", accessToken });
      } catch (error) {
        console.error(`Error in refreshToken: ${error}`);
        res.status(406).json({ message: "Unauthorized" });
      }
    } else {
      return res.status(406).json({ message: "Unauthorized" });
    }
  }
  

module.exports = { handleRefreshToken }