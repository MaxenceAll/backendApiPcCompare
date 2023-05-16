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
// Public routes (public data)
app.use('/carousel', require('./routes/api/carousel'));
app.use('/dropdownmenu', require('./routes/api/dropdownmenu'));
//Provisoires :
app.use('/compare', require('./routes/api/compare'));



// Public routes (login system)
app.use('/register', require('./routes/register'));
app.use('/reset', require('./routes/reset'));
app.use('/login', require('./routes/login'));
app.use('/refresh', require('./routes/refresh'));
app.use('/auth', require('./routes/auth'));


// Debut des routes protégées :
const verifyRefreshToken = require('./middleware/verifyRefreshToken ');
// app.use('/account', require('./routes/account'));
app.use('/alluserdata',verifyRefreshToken, require('./routes/api/allUsersData')); //TODO à refaire
app.use('/allroledata',verifyRefreshToken, require('./routes/api/allRoleData')); //TODO à refaire
app.use('/customer',verifyRefreshToken, require('./routes/customer'));
app.use('/account',verifyRefreshToken, require('./routes/account'));
app.use('/favorite',verifyRefreshToken, require('./routes/api/favorite'));


const uploadRouter = require('./routers/upload.router');
app.use(verifyRefreshToken,uploadRouter);


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