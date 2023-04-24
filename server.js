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
//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));
// built-in middleware pour parse les cookies
app.use(cookieParser());


// KO :
// Middleware pour l'acces à l'api (check le autorization Headers dans une requete pour voir si cela correspond à notre clé d'api):
// const accesMiddleware = require('./middleware/acces.middleware');
// app.use(accesMiddleware);


// routes
// Route root, pour l'affichage doc de l'API
app.use('/', require('./routes/root'));
app.use('/carousel', require('./routes/api/carousel'));
app.use('/register', require('./routes/register'));
app.use('/reset', require('./routes/reset'));
app.use('/login', require('./routes/login'));
app.use('/refresh', require('./routes/refresh'));
app.use('/auth', require('./routes/auth'));


const verifyRefreshToken = require('./middleware/verifyRefreshToken ');
// Debut des routes protégées :
app.use('/account',verifyRefreshToken, require('./routes/account'));

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