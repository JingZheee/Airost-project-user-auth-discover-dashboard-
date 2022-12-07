const mongoose = require('mongoose');
const moongoose = require('moongoose');

require('dotenv').config();

const conn = process.env.DB_GAME;

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const JoinSchema = new mongoose.Schema({
    joinName: String,
    joinContact: String, 
    joinId: String,
    oriId: String
})
const Join = connection.model('Join', JoinSchema);

module.exports = Join;