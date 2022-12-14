const mongoose = require('mongoose');

require('dotenv').config();

const conn = process.env.DB_GAME;

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const GameSchema = new mongoose.Schema({
    ownerId: String,
    username: String,
    eventName: String,
    description: String,
    sport: String,
    date: String,
    timeStart: String,
    timeEnd: String,
    venue: String,
    court: String,
    currentPlayer: Number,
    playerMax: Number,
    price: String,
    paymentMethod: String,
    courtId: String,
    playerIdJoin: Array
})



const Game = connection.model('Game', GameSchema);
module.exports = Game;



