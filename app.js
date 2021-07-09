const express = require("express");
const path = require("path");
const mysql = require("mysql");
const env = require("dotenv");
const cookieParser = require("cookie-parser");
const { Server } = require("http");


env.config({ path: './password.env'});

const app = express();
const db = mysql.createConnection({
    host: process.env.dbs_host,
    user: process.env.dbs_user,
    password: process.env.dbs_password,
    database: process.env.dbs
});


const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended: false }));

app.use(express.json());

app.use(cookieParser());

app.set('view engine', 'hbs');

db.connect( (error) => {
    if(error) {
        console.log(error)
    }
        else {
            console.log("MYSQL Connected")
        }
} );

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(4000, () => {
    console.log("Server running at 4000");
});