const dotenv = require("dotenv");
dotenv.config();

const config = {
    dev: {
        // Config de l'api
        API: {
            PORT: 5050,
            // Version dealer
            VERSION: "v1",
            // SETUP limiter
            MAX_REQUEST: 1000,
            MAX_REQUEST_WINDOW: "1m",
        },
        // Url front (pour l'envoi des mails)
        FRONTEND:{
            URL: "http://localhost:5173/"
        },
        db: {
            host: "localhost",
            port: "3306",
            user: "root",
            password: "",
            database: process.env.DATABASE_NAME
        },
        mail:{
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "maxtestnodejs@gmail.com",
                pass: 'xiwkuvhwjlwjhrtq'
            },
            privateEmails: ["maxoa59@gmail.com", "maxence.allart@gmail.com", "mikackerman093@outlook.fr"]
        },
        // API ACCESS key :
        authorization:{
            secret: "pf[cX]RnE7!.2uNj/hkaPzfC./jMKIIn",
            keys: ["!Ml_MOAUG8X)kTkbkuF6]JkyRAO/SD-K"]
        },
        // hash prefix pour comparer le password au login
        hash: {
            prefix: "$2b$10$"
        },
        // Secret phrase pour la création du token de login.
        token: {
            secret: "Wp].p77qJiLV)jMw6!GXAhzyi(tTaciU"
        },
    },

    prod: {
        db: {
            host: "",
            port: "",
            user: "",
            password: "",
            database: ""
        },
    }
}

module.exports = config[process.env.NODE_ENV];