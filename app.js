const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const connection = require('./config/database');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const Game = require('./config/databaseGame');
const { render } = require('ejs');
const Join = require('./config/databaseJoin');
const ObjectId = require('mongodb').ObjectID;
const Court = require('./config/databasecourt');
const User = require("./config/database");

const app = express();


// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');




// routes
app.get('/', (req, res) => res.send('wassup'));
app.use(authRoutes);

app.get('/dashboard', requireAuth, (req, res, next) => {
    const id = req.decodedToken.id;
    Court.find({user_id: id}, (err, docs) => {
        if(err){
            console.log(err);
        } else {
            res.render('dashboard', {courts: docs})
        }
    })
    
})


app.get('/court', (req, res, next) => {
    res.render('court');
})

app.post('/court', requireAuth, (req, res, next) => {
    
    const id = req.decodedToken.id;
    const newCourt = new Court({
        user_id: id,
        court: req.body.court,
        sport: req.body.sport,
        venue: req.body.venue,
        date: req.body.date,
        timestart: req.body.timeStart
    })
    newCourt.save();
    res.redirect('/');
})

app.get('/createGame/:id', (req, res, next) => {
    res.render('createGames', {courtId: req.params.id});
})

app.post('/createGame/:id', requireAuth, (req, res, next) => {
    //user id
    const id = req.decodedToken.id;
    //courts id
    const courtId= req.body.id;
    let result = courtId.trim();
    console.log(result);
    
    


    Court.findOne({_id: ObjectId(result)}, (err,docs) => {
        if(err){
            console.log(err);
        } else {
            User.findOne({_id: ObjectId(id)}, (err, data) => {
                if(err){
                    console.log(err);
                } else {
                    const newGame = new Game({
                        ownerId: data._id,
                        username: data.email,
                        eventName: req.body.eventName,
                        description: req.body.description,
                        sport: docs.sport,
                        date: docs.date,
                        timeStart: req.body.timeStart,
                        timeEnd: req.body.timeEnd,
                        venue: docs.venue,
                        court: docs.court,
                        currentPlayer: req.body.currentPlayer,
                        playerMax: req.body.playerMax,
                        playerIdJoin: []
                
                        
                
                    })
                    newGame.save();
                    res.redirect('/');
                }
            })
        }
    })

    


})

 app.get('/discover', checkUser, (req, res, next) => {
    if (req.user == null){
        var user = '';
    } else {
        var user = req.user._id;
    }
    Game.find()
        .then((result) => {
            res.render('discover', {games: result, userId: user});
        })
        .catch((err) => {
            console.log(err);
        })
 })


//the id is Game objectId
app.get('/join/:id', requireAuth, (req, res, next) => {
    res.render('join', {courtId: req.params.id, });
    
})

app.post('/join/:id', requireAuth, (req, res, next) => {
    const userId = req.decodedToken.id;
    const courtId= req.body.id;
    let result = courtId.trim();
    
    const newJoin = new Join({
        joinName: req.body.name,
        joinContact: req.body.contact, 
        joinId: userId,
        oriId: result,
    })
    
    
    
    newJoin.save()
    Game.findOneAndUpdate(
        {_id: ObjectId(result)} ,
        { $push: { playerIdJoin: userId} },
        {useFindAndModify: false},
        function (error, success) {
            if (error) {
                console.log(error);
                console.log(courtId);
            } else {
                console.log(success);
            }
        
        })
    
        Game.findOneAndUpdate(
            {_id: ObjectId(result)} ,
            { $inc: { currentPlayer: 1 }},
            {useFindAndModify: false},
            function (error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(success);
                }
            
            })
    
    
    
    
        
    res.redirect('/');
})


app.listen(3000);