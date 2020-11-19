var express = require('express');
var router = express.Router();
var markerModel = require('../models/marker');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json('index');
});

router.get('/get-markers', async function(req, res, next) {
  let markers = await markerModel.find({});
  res.json(markers);
});
  
// router.get('/generate-marker', async function(req, res, next) {
//   const initialRegion = { latitude: 0.392038, longitude: 9.440623, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
//   const { latitude, longitude, latitudeDelta, longitudeDelta } = initialRegion;
//   let randomBin = [];
//   for(let i = 0; i < 30; i++){
//     randomBin.push(Math.round(Math.random()));
//     let randomLatForUse = latitude + (Math.random() - 0.5) * latitudeDelta;
//     let newMarker = new markerModel({
//       latitude : randomLatForUse , 
//       longitude : longitude+ 0.02 +(0.392038-randomLatForUse)*0.06/latitudeDelta + (Math.random() - 0.5) * longitudeDelta,
//       type: (randomBin[i]==1),
//       date: new Date()  
//     });
//     await newMarker.save();
//     console.log(i);
//   }
//   res.json('index');
// });

// router.get('/generate-marker', async function(req, res, next) {
//   const initialRegion = { latitude: 48.88, longitude: 2.30, latitudeDelta: 0.006, longitudeDelta: 0.006 };
//   const { latitude, longitude, latitudeDelta, longitudeDelta } = initialRegion;
//   let randomBin = [];
//   for(let i = 0; i < 5; i++){
//     randomBin.push(Math.round(Math.random()));
//     let randomLatForUse = latitude + (Math.random() - 0.5) * latitudeDelta;
//     let newMarker = new markerModel({
//       latitude : randomLatForUse , 
//       longitude : longitude+ (Math.random() - 0.5) * longitudeDelta,
//       //type: (randomBin[i]==1),
//       type: true,
//       date: new Date()  
//     });
//     await newMarker.save();
//     console.log(i);
//   }
//   res.json('index');
// });

module.exports = router;
