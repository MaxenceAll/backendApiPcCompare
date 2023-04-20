const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');

// async function loginUser(req, res) {
//     try {
//       console.log("// Appel de la method loginUser //");
//       const { body } = req;
//       // Escape the email value before using it in the SQL query
//       const email = escape(body.email);
  
//       const sql = `SELECT * FROM account WHERE deletedBy = 0 AND email = ?`;
//       const [user] = await query(sql, [email]);
//       console.log("++ L'utilisateur trouvé est :", user);
//       if (!user) {
//         throw new Error("Bad Login 1");
//       }
  
//       const sql2 = `SELECT * FROM customer WHERE id_account = ?`;
//       const [customer] = await query(sql2, [user.id]);
  
//       consolelog("body.password:",body.password)
//       consolelog("user.password:",user.password)

//     //   let hashedPassword = await bcrypt.hash(body.password, 10);
//     //   hashedPassword = hashedPassword.replace(/^\$2a\$/, '');
//     //   consolelog("hashedPassword:",hashedPassword)
//     //   const passwordMatch = await bcrypt.compare(
//     //     hashedPassword,
//     //     user.password
//     const hashedPassword = await bcrypt.hash(body.password, 10);
//     const passwordMatch = await bcrypt.compare(hashedPassword, user.password);
//     if (!passwordMatch || body.email !== user.email) {
//       throw new Error("Bad Login 3");
//     }
//       const emailMatch = body.email === user.email;

//       consolelog("passwordMatch:",passwordMatch)
//       consolelog("emailMatch:",emailMatch)
//       if (!passwordMatch || !emailMatch) {
//         throw new Error("Bad Login 2");
//       }
  
//       const data = { ...user, ...customer };
//       const token = jwt.sign(data, config.token.secret, {
//         expiresIn: "10m",
//       });
  
//       const refreshToken = jwt.sign(
//         data,
//         process.env.REFRESH_TOKEN_SECRET,
//         { expiresIn: "1d" }
//       );
  
//       // Assigning refresh token in http-only cookie
//       res.cookie("jwt", refreshToken, {
//         httpOnly: true,
//         sameSite: "None",
//         secure: true,
//         maxAge: 24 * 60 * 60 * 1000,
//       });
  
//       res.json({ result: true, message: "Login OK", token });
//     } catch (error) {
//       console.error(`Error in loginUser: ${error}`);
//       res.status(500).json({
//         message: "Internal server error",
//       });
//     }
//   }
  

async function loginUser(req, res) {
    const { email, password } = req.body;

    
}


async function refreshToken(req, res) {
    if (req.cookies?.jwt) {
  
        // Destructuring refreshToken from cookie
        const refreshToken = req.cookies.jwt;
  
        // Verifying refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, 
        (err, decoded) => {
            if (err) {  
                // Wrong Refesh Token
                return res.status(406).json({ message: 'Unauthorized' });
            }
            else {
                // Correct token we send a new access token
                const accessToken = jwt.sign({
                    username: userCredentials.username,
                    email: userCredentials.email
                }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '10m'
                });
                return res.json({ accessToken });
            }
        })
    } else {
        return res.status(406).json({ message: 'Unauthorized' });
    }
}
  




module.exports = { loginUser , refreshToken};
