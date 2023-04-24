const dotenv = require("dotenv");
dotenv.config();

const config = {
    dev: {
        API: {
            PORT: 5050,
        },
        FRONTEND:{
            URL: "http://localhost:5173/"
        },
        db: {
            host: "localhost",
            port: "3306",
            user: "root",
            password: "",
            database:"pccompare"
        },
        mail:{
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "maxtestnodejs@gmail.com",
                pass: 'xiwkuvhwjlwjhrtq'
            },
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