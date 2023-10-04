const mongoose = require('mongoose');
require('dotenv').config();

// connect to mongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(()=>{
    console.log("Connected to MongoDB");
  })
  .catch(()=>{
    console.log("Couldn't connect to MongoDB");
  })

const Schema = mongoose.Schema;

const inboundScheme = new Schema({
  Client: String,
  Rate: Number,
  Items: []
},
{
  collection: 'Inbound',
  versionKey: false
});

const outboundScheme = new Schema({
  Client: String,
  Rate: Number,
  Items: []
},
{
  collection: 'Outbound',
  versionKey: false
});

module.exports.Inbound = mongoose.model('Inbound', inboundScheme);
module.exports.Outbound = mongoose.model('Outbound', outboundScheme);
