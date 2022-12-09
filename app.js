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

app.get('/game', requireAuth,(req, res) => {
    const id = req.decodedToken.id;
    Game.find({playerIdJoin: id}, (err, docs) => {
        if(err){
            console.log(err);
        } else {
            res.render('game', {courts: docs})
        }
    })
})

//dashbaord get 
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



//share to find friends get 
app.get('/createGame/:id', (req, res, next) => {
    
    const courtId= req.params.id;
    Court.findOne({_id: ObjectId(courtId)}, (err, data) => {
        if(err){
            console.log(err);
        } else {
            console.log(data);
            res.render('createGames', {courtId: req.params.id, data: data});
        }
    })
})
//share to findn friends post save to database
app.post('/createGame/:id', requireAuth, (req, res, next) => {
    //user id
    const id = req.decodedToken.id;
    //courts id
    const courtId = req.body.id;
    let result = courtId.trim();
    //find the court and user so that we can use the data in them and pass it to the share game db 
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
                        timeStart: docs.timestart,
                        timeEnd: req.body.timeEnd,
                        venue: docs.venue,
                        court: docs.court,
                        currentPlayer: req.body.currentPlayer,
                        playerMax: req.body.playerMax,
                        courtId: result,
                        price: req.body.price,
                        paymentMethod: req.body.paymentMethod,
                        playerIdJoin: []
                    })
                    newGame.save();
                    res.redirect('/');
                }
            })
        }
    })
    //to update the court so that we know is shared
    Court.findOneAndUpdate(
        {_id: ObjectId(result)},
        {share: true},
        (err, docs) => {
            if(err){
                console.log(err);
            } 

    })
})

//find to play 
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


//no need to see 
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

app.get('/detail/:id', (req, res, next) => {
    const courtId= req.params.id;
    Game.findOne({courtId: courtId}, (err, data) => {
        if(err) {
            console.log(err);
        } else {
            Join.find({oriId: data._id}, (err, user) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(user);
                    res.render('detail', {data: data, users: user});
                }
            }
        )}
    })
    
})


app.get('/info/:id', (req, res, next) => {
    const courtId= req.params.id;
    const result = courtId.trim();
    Game.findOne({_id: ObjectId(result)}, (err,docs) => {
        if(err){
            console.log(err);
        } else {
            res.render('info', {data: docs, id: result})
        }
    })
})

app.listen(3000);