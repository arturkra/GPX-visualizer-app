const Joi = require('joi');
const express = require('express');
var expressLayouts = require('express-ejs-layouts');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const BazaDanych = require('nedb');
const { request } = require('http');
const { response, application } = require('express');
const bcrypt = require('bcrypt');
const { urlencoded } = require('body-parser');
const passport = require('passport')
const session = require('express-session');
const cookies = require('cookie-parser');
const { not } = require('joi');
app.set('views','./Client')
app.set('view engine', 'ejs')
app.use(session({
    secret: 'secret-key',
    saveUninitialized: false,
    resave: false,
    cookies
}))

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('Client'));

app.listen(3000, () => console.log('nasluchuje na porcie 3000'));


const bazaDanych = new BazaDanych('bazaDanych.db');
bazaDanych.loadDatabase();

const bazaUzytkownikow = new BazaDanych('bazaUzytkownikow.db');
bazaUzytkownikow.loadDatabase();

app.get('/aplikacja', (req, res) => {
    if(!req.session.userId){
        res.redirect('/')
    }
    else{
        res.render('index.ejs');
        console.log(req.session.userId);

    }
})


app.get('/heatmapa',(req,res) => {    
    let tabela;
    bazaDanych.find({"heatmapa":true}, function (err, docs){
        res.json(docs);
    })
    console.log(tabela);
})


app.get('/heatmapaUzytkownika',(req,res) => {    
    let tabela;
    console.log(req.session.userId);
    bazaDanych.find({"heatmapa":true, "uzytkownik": req.session.userId}, function (err, docs){
        res.json(docs);
    })
    console.log(tabela);
})

app.get('/',(req,res) => {
    if(req.session.userId){
        console.log(req.session.userId);
        res.redirect('/aplikacja')
    }
    else{
        let {userId} = req.session;
        res.render('login.ejs');
    } 
})

/* app.post('/',(req,res) => {
    const nazwaUzytkownika = req.body.login;
    const hasloUzytkownika = req.body.haslo;
    console.log(nazwaUzytkownika);
    console.log(req.body.haslo);
    bazaUzytkownikow.findOne({login: nazwaUzytkownika, password: hasloUzytkownika},function (err,docs){
        if(docs === null){
            res.status(400).send('podano niepoprawne dane');           
        }
        else{            
            res.render('index.ejs');
        }
    })     
}) */


app.post('/',(req,res) => {
    //const nazwaUzytkownika = req.body.login;
    //const hasloUzytkownika = req.body.haslo;
    //console.log(nazwaUzytkownika);
    //console.log(req.body.haslo);
    bazaUzytkownikow.findOne({login: req.body.login, password: req.body.password},function (err,docs){
        if(docs === null){
            //res.status(400).send('podano niepoprawne dane');
            res.redirect('/');           
        }
        else{          
            //console.log(req.body.login);
            req.session.userId = req.body.login;            
            res.redirect('/aplikacja');
        }
    })     
})

app.get('/rejestracja', (req,res) =>{
    res.render('rejestracja.ejs');
})

app.post('/rejestracja',(req,res) => {
    //console.log(req.body.login);
    //bazaUzytkownikow.
    bazaUzytkownikow.findOne({login: req.body.login},function (err,docs){
        if(docs === null){
            bazaUzytkownikow.insert(req.body);
            res.redirect('/');
        }
        else{
            //res.flash('uzytkownik juz istnieje');
            res.redirect('/rejestracja');
        }
    }) 
    


    //Szyfrowane hasło

    /*    bazaUzytkownikow.findOne({login: req.body.login},async function (err,docs){
        const niezaszyfrowaneHaslo = req.body.haslo;
        const login = req.body.login;
        if(docs === null){
            
            const zaszyfrowaneHaslo = await bcrypt.hash(niezaszyfrowaneHaslo,10)
            bazaUzytkownikow.insert({
            login: login,
            haslo: zaszyfrowaneHaslo
            });
            res.redirect('/');
        
            //bazaUzytkownikow.insert(req.body);
            //res.redirect('/');
        }
        else{
            res.redirect('/rejestracja');
        }
    }) */
})



app.post('/api', (req, res) => {
    //console.log(req.session.userId)
    const uzytkownik = req.session.userId;
    const odebraneDane = req.body.daneZPliku;
    const odebranaNazwa = req.body.nazwaPliku;
    ////console.log(odebranaNazwa, odebraneDane)
    const plikDoZapisu = {odebraneDane, odebranaNazwa, uzytkownik, heatmapa: true }
    bazaDanych.insert(plikDoZapisu)
    
})


app.get('/Wylogowywanie',(req,res) =>{            
    console.log(req.session.userId);        
    req.session.destroy();        
    res.redirect('/');
})


app.post('/bazaDanych', (req, res) => {
    const nazwa = req.body;
    console.log(req.body);
    console.log(req.session.userId);
     bazaDanych.find({odebranaNazwa: req.body.nazwaPliku}, function (err,docs){
        if(err){
            res.end();
            console.log('nie odnaleziono')
        }
        else if(bazaDanych.find({odebranaNazwa: req.body.nazwaPliku, uzytkownik: req.session.userId})){
            res.json(docs);
        }
        else{
            res.end();
        }
    }) 
    //response.json(request.body);
})


