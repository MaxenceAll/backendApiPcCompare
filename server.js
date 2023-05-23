const express = require('express');
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const config = require("./config/config");
const consolelog = require("./Tools/consolelog")
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const app = express();


const upload = require("./middleware/multerSetup");


// custom middleware logger
app.use(logger);
// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);
// Cross Origin Resource Sharing
app.use(cors(corsOptions));
// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));
// built-in middleware for json 
app.use(express.json());
// serve static files
app.use('/', express.static(path.join(__dirname, '/public')));
// built-in middleware pour parse les cookies
app.use(cookieParser());



// NO LONGER USED, pas de verif clé api :
// Middleware pour l'acces à l'api (check le autorization Headers dans une requete pour voir si cela correspond à notre clé d'api):
// const accesMiddleware = require('./middleware/acces.middleware');
// app.use(accesMiddleware);

// Custom middleware for limiter le nb de requests Anti timing attack + brute force
const limiter = require('./Tools/rateLimiter');

// Route root, pour l'affichage doc de l'API
app.use('/', limiter, require(`./routes/${config.API.VERSION}/root`));

// Public routes (public data)
app.use('/carousel', require(`./routes/${config.API.VERSION}/api/carousel`));
app.use('/dropdownmenu', require(`./routes/${config.API.VERSION}/api/dropdownmenu`));
app.use('/compare', require(`./routes/${config.API.VERSION}/api/compare`));
app.use('/avatar', require(`./routes/${config.API.VERSION}/api/avatar`));
app.use('/test', require(`./routes/${config.API.VERSION}/api/test`));

// Public routes (login system)
app.use('/register', limiter, require(`./routes/${config.API.VERSION}/login/register`));
app.use('/reset', limiter, require(`./routes/${config.API.VERSION}/login/reset`));
app.use('/login', limiter, require(`./routes/${config.API.VERSION}/login/login`));
app.use('/refresh', limiter, require(`./routes/${config.API.VERSION}/login/refresh`));
app.use('/auth', limiter, require(`./routes/${config.API.VERSION}/login/auth`));


// Debut des routes protégées avec verifyRefreshToken:
const verifyRefreshToken = require('./middleware/verifyRefreshToken ');
app.use('/alluserdata', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/api/allUsersData`)); //TODO à refaire
app.use('/allroledata', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/api/allRoleData`)); //TODO à refaire
app.use('/customer', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/customer`));
app.use('/account', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/account`));
app.use('/favorite', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/api/favorite`));
app.use('/comments', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/api/comments`));

// Catch all others routes not caught before : (404 envoyé en fonction de accept)
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// On place le errorHandler à la fin
app.use(errorHandler);


app.listen(config.API.PORT, () => {
    consolelog(`Ouverture d'un port d'écoute sur : ${config.API.PORT}`);
});