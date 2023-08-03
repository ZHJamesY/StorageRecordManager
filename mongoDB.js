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

const chargesSchema = new Schema({
  Date: String,
  Clients: []
},
{
  collection: 'Charges',
  versionKey: false
});

module.exports.Inbound = mongoose.model('Inbound', inboundScheme);
module.exports.Outbound = mongoose.model('Outbound', outboundScheme);
module.exports.Charges = mongoose.model('Charges', chargesSchema);


// const clientsSchema = new Schema({
//   Clients: []
// },
// {
//   collection: 'Clients',
//   versionKey: false
// });

// const recordsSchema = new Schema({
//   Records: []
// },
// {
//   collection: 'Records',
//   versionKey: false
// });

// module.exports.Clients = mongoose.model('Clients', clientsSchema);
// module.exports.Records = mongoose.model('Records', recordsSchema);

// let Schema = mongoose.Schema;

// // Create Schema instance for users collection. 
// // This will be for users of the system
// let userSchema = new Schema({
//     username: String,
//     email: String,
//     hashPassword: String
// }, {
//     collection: 'users'
// });

// // Create Schema instance for students in our University DB
// let studentSchema = new Schema({
//     sid: String,
//     firstName: String,
//     lastName: String,
//     gpa: Number
// }, {
//     collection: 'students'
// });

// // Here we export our module (node.js) to make it available in a different file (savingdata.js)
// // See L23SL14 - An example Schema
// module.exports.User = mongoose.model('user', userSchema);
// module.exports.Student = mongoose.model('student', studentSchema);