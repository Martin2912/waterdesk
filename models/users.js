var mongoose = require('mongoose');

var userAboSchema = mongoose.Schema({
    nomAbo: String,
    etatAbo: Boolean,
    latitude: Number,
    longitude: Number,
    rue: String,
    nbRue: Number,
    postCode: String,
    ville: String,
    region: String,
    pays: String
  });  

  var userAlertSchema = mongoose.Schema({
    date: Date,
    latitude: Number,
    longitude: Number,
    type:String,
    lieu:String
  });  

var userSchema = mongoose.Schema({  name: String,
                                    email: {type:String, required:true, unique:true},
                                    password: String,
                                    token: String,
                                    salt: String,
                                    user_abo: [userAboSchema],
                                    user_alerts: [userAlertSchema],
                                    firstname: String,
                                    phone: String,
                                    img: String,
                                    address: Object,
                                    tokenNotif : String
                                    });

var userModel = mongoose.model('users', userSchema);


module.exports = userModel;