// import modules
const express = require('express');
const session = require('express-session');

const app = express();
const dataBase = require('./mongoDB.js');
const {v4:uuidv4} = require('uuid');

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
    console.log(`Listening for requests on port ${app.get('port')}.`);
});

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(session({
    // generate session id
    genid: () => uuidv4(),

    // save file: false
    resave: false,

    // save parameters: false
    saveUninitialized: false,

    // signature
    secret: 'ChatRooms'
}))

app.set('views', __dirname + '/public/views');
app.set('view engine', 'pug');


app.get('/', (request, respond) => {
    respond.render('LogIn', {
        title: 'Log In',
        h1Message: 'Username/Password incorrect',
        animationClass: ''
    });
})