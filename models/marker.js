var mongoose = require('mongoose');

var markerSchema = mongoose.Schema({
                                    date : Date, 
                                    latitude : Number , 
                                    longitude : Number,
                                    type: Boolean  
                                    });

var markerModel = mongoose.model('markers', markerSchema);


module.exports = markerModel;