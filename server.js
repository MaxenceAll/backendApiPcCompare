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

// KO :
// Middleware pour l'acces à l'api (check le autorization Headers dans une requete pour voir si cela correspond à notre clé d'api):
// const accesMiddleware = require('./middleware/acces.middleware');
// app.use(accesMiddleware);

// Custom middlewar for limiter le nb de requests
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Trop de requêtes ! Re-essayez un peu plus tard.',
  });


// Route root, pour l'affichage doc de l'API
app.use('/', limiter, require(`./routes/${config.API.VERSION}/root`));
// Public routes (public data)
app.use('/carousel', limiter, require(`./routes/${config.API.VERSION}/api/carousel`));
app.use('/dropdownmenu', limiter, require(`./routes/${config.API.VERSION}/api/dropdownmenu`));
app.use('/compare', limiter, require(`./routes/${config.API.VERSION}/api/compare`));

// Public routes (login system)
app.use('/register', limiter, require(`./routes/${config.API.VERSION}/login/register`));
app.use('/reset', limiter, require(`./routes/${config.API.VERSION}/login/reset`));
app.use('/login', limiter, require(`./routes/${config.API.VERSION}/login/login`));
app.use('/refresh', limiter, require(`./routes/${config.API.VERSION}/login/refresh`));
app.use('/auth', limiter, require(`./routes/${config.API.VERSION}/login/auth`));

// Debut des routes protégées :
const verifyRefreshToken = require('./middleware/verifyRefreshToken ');
// app.use('/account', require('./routes/account'));
app.use('/alluserdata', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/api/allUsersData`)); //TODO à refaire
app.use('/allroledata', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/api/allRoleData`)); //TODO à refaire
app.use('/customer', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/customer`));
app.use('/account', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/account`));
app.use('/favorite', limiter,verifyRefreshToken, require(`./routes/${config.API.VERSION}/api/favorite`));


const uploadRouter = require('./routers/upload.router');
app.use(verifyRefreshToken,uploadRouter);




// Customer error handler si le rate limiter throw une erreur :
app.use((err, req, res, next) => {
    if (err instanceof RateLimitError) {
      // Handle rate limit exceeded error
      res.status(429).json({ error: 'Trop de requête !' });
    } else {
      // Pass other errors to the next error handler
      next(err);
    }
  });


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

app.use(errorHandler);


app.listen(config.API.PORT, () => {
    consolelog(`Ouverture d'un port d'écoute sur : ${config.API.PORT}`);
});