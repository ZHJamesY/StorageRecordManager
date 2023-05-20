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

const rentSchema = new Schema({
  ID: String,
  Client: String,
  Date: String,
  Product: String,
  Inbound_CBM: Number,
  Outbound_CBM: Number,
  Unit_Price: Number

},
{
    collection: 'Rent',
    versionKey: false
});

module.exports.Rent = mongoose.model('rent', rentSchema);