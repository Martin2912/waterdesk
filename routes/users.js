var express = require('express');
var router = express.Router();
var userModel = require('../models/users');
var markerModel = require('../models/marker');
var request = require('sync-request');

var uid2 = require('uid2');
var SHA256 = require('crypto-js/sha256');
var encBase64 = require('crypto-js/enc-base64');

/* sign in */
router.post('/sign-in', async function(req, res, next) {
  var error = []
  var result = false
  var user = null
  var token = null
  let email = null
  let name = null
  
  if(req.body.emailFromFront == '' || req.body.passwordFromFront == '' ){
    error.push({msg:'Champs vides', type:"warning"});
  }

  if(error.length == 0){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
    })
      
    if(user){
      const passwordEncrypt = SHA256(req.body.passwordFromFront + user.salt).toString(encBase64)

      if(passwordEncrypt == user.password){
        result = true
        token = user.token
        email = user.email
        name = user.name
        error.push({msg:'connexion !', type:"success"});

        //fonction provisoire génératrice d'alerts
        let bool =  new Boolean( (Math.round(Math.random()) )==1 );
        let objet = {date: "28/03/2020", lieu: "mémé", latitude: 0.36,longitude: 9.47, type: bool  };
        if( (Math.round(Math.random()) )==1) {
            objet = {date: "28/03/2020", lieu: "maison", latitude: 0.392,longitude: 9.45, type: bool  };
        }
        // console.log(objet);
        addAlertToOneUser(email,token, objet);
        
      } else {
        result = false
        error.push({msg:'mot de passe incorrect', type:"warning"});
      }
      
    } else {
      error.push({msg:'Email incorrect', type:"warning"})
    }
  }
  res.json({result, error, token, email, name});
});


/* sign up */
router.post('/sign-up', async function(req, res, next) {
   let error = [];
   let result = false;
   let saveUser = null;
   let token = null;
   let email = null;
   let name = null;

   const data = await userModel.findOne({
     email: req.body.emailFromFront
   })

   let regex = /^\S+@\S+\.\S{2,4}$/;
   if(req.body.emailFromFront.match(regex) == null){
    error.push({msg:"Email non valide", type:"warning"});
   }

   if(data != null){
     error.push({msg:"Un compte utilise déja cet email", type:"warning"});
   }

   if(req.body.nameFromFront == '' || req.body.emailFromFront == '' || req.body.passwordFromFront == ''){
     error.push({msg:"Un ou plusieurs champs sont vides", type:"warning"});
   }

   if(error.length == 0){
     var salt = uid2(32);
     var newUser = new userModel({
       name: req.body.nameFromFront,
       email: req.body.emailFromFront,
       password: SHA256(req.body.passwordFromFront+salt).toString(encBase64),
       token: uid2(32),
       salt: salt,
     })
     saveUser = await newUser.save()
    
     if(saveUser){
       result = true
       token = saveUser.token
       email = saveUser.email
       name = saveUser.name
       error.push({msg:"Compte créé !", type:"success"});
     }
   }
   res.json({result, email , error, token, name})
});


/* get User_Alerts */
router.post('/get-user_alerts', async function(req, res, next) {
  let user_alerts =[];
  //console.log(await findUserToAlert());

  if(req.body.emailFromFront != '' && req.body.tokenFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      token : req.body.tokenFromFront
    });
    user? user_alerts = user.user_alerts : null;
    console.log(user_alerts);
  }
  res.json({user_alerts});
});


// enregistrer l'alerte déclarée dans la BDD => collection markers
router.post('/save-new_marker', async function(req, res, next) {
  console.log('route save new marker')

  let result = false;
  let savedMarker = null;
  var dateRaw = new Date();
  
  //console.log('date raw',dateRaw);
  // console.log('date GMT',dateRaw.toGMTString());
  //var dateMarker = `${dateRaw.getDate()}/${dateRaw.getMonth()}/${dateRaw.getFullYear()} à ${dateRaw.getHours()}h${dateRaw.getMinutes()}`;
  // console.log('date String',dateMarker);

  if(req.body.userEmailFromFront != '' && req.body.userTokenFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.userEmailFromFront,
      token : req.body.userTokenFromFront
    })

    if(user){
      const newMarker = new markerModel({
        longitude: req.body.alertLongitudeFromFront,
        latitude: req.body.alertLatitudeFromFront,
        date: dateRaw,
        type: req.body.alertTypeFromFront
      })
      savedMarker = await newMarker.save()
      //console.log('date in bdd',savedMarker.date);
      if(savedMarker){
        result = true;
      }

      //Trouvez les utilisateurs à avertir et push une alerte  
      let aboToAlerts = await findUserToAlert(req.body.alertLatitudeFromFront,req.body.alertLongitudeFromFront);
     
      for (let i = 0; i<aboToAlerts.length; i++){
        if(aboToAlerts[i].user_abo.length>0){

          let usertk = await userModel.find({_id : aboToAlerts[i]._id });
          tokNotif = usertk[0].tokenNotif;

          sendPushNotification(tokNotif,aboToAlerts[i].user_abo[0].nomAbo,req.body.alertTypeFromFront) ;
          
          addAlertToOneUser( aboToAlerts[i]._id,
                              { date: dateRaw, // req.body.alertDateFromFront 
                                lieu: aboToAlerts[i].user_abo[0].nomAbo, 
                                latitude: aboToAlerts[i].user_abo[0].latitude,
                                longitude: aboToAlerts[i].user_abo[0].longitude, 
                                type: req.body.alertTypeFromFront  });
        }
      }  
    }
  }

  res.json({result,savedMarker});
});


// enregistrer l'abonnement dans la BDD => sous-document de la collection users
router.post('/abo', async function(req, res, next) {
  console.log('route abo')
    
  let user_abo =[];
  let result = false;
  let newAbo = {
    nomAbo: req.body.aboNomFromFront,
    etatAbo: req.body.aboEtatFromFront,
    latitude: req.body.aboLatitudeFromFront,
    longitude: req.body.aboLongitudeFromFront,
  }

  if(req.body.userEmailFromFront != '' && req.body.userTokenFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.userEmailFromFront,
      token : req.body.userTokenFromFront
    })

    if(user){
      user.user_abo = [...user.user_abo, newAbo]
      let savedUser = await user.save();
      user_abo = savedUser.user_abo;
      let taille = savedUser.user_abo.length -1;
      // console.log(taille);
        if(savedUser.user_abo[taille].latitude==newAbo.latitude && savedUser.user_abo[taille].longitude==newAbo.longitude){
          result = true;
        }
    }
  }

res.json({user_abo, result});
});


/* get User_Abo */
router.post('/get-user_abo', async function(req, res, next) {
  let user_abo =[];
  console.log('route get user abo')

  if(req.body.emailFromFront != '' && req.body.tokenFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      token : req.body.tokenFromFront
    });
    user? user_abo = user.user_abo : null;
  }
  res.json({user_abo});
});


/* deleteOne Abonnement  */
router.post('/deleteOne-userAbo', async function(req, res, next) {
  let user_abo= [];

  if(req.body.emailFromFront != '' && req.body.tokenFromFront != '' && req.body.aboIdFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      token : req.body.tokenFromFront
    });
    if(user){
      user.user_abo = [...user.user_abo].filter((e)=>{
        console.log("user.user_abo BACK", e)
        return (e._id!=req.body.aboIdFromFront)
      });
      let savedUser = await user.save();
      user_abo = savedUser.user_abo;
       //console.log("userAbo from Back",user_abo)
    }
  }
res.json({user_abo});
});


/* deleteOne UserAlert */
router.post('/deleteOne-userAlert', async function(req, res, next) {
  let user_alerts= [];

  if(req.body.emailFromFront != '' && req.body.tokenFromFront != '' && req.body.alertIdFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      token : req.body.tokenFromFront
    });
    if(user){
      user.user_alerts = [...user.user_alerts].filter((e)=>{
        // console.log(e._id,"!=",req.body.alertIdFromFront)
        return (e._id!=req.body.alertIdFromFront)
      });
      let savedUser = await user.save();
      user_alerts = savedUser.user_alerts;
      // console.log("sav",user_alerts)
    }
  }
res.json({user_alerts});
});


/* set User_Alerts */
let addAlertToOneUser = async (id,alert) => {
  const user = await userModel.findOne({
    _id:id
  });
  if(user){
    user.user_alerts.push(alert);
    await user.save();
  }
}

let findUserToAlert = async (latitude, longitude) => {
  lat = Number(latitude);
  long = Number(longitude);

  //const aboToAlerts = await userModel.find({  "user_abo.etatAbo": true ,"user_abo.latitude": { $gt: lat-0.002, $lt: lat+0.002 }, "user_abo.longitude": { $gt: long-0.002, $lt: long+0.002 } },{'user_abo.$': 1});
  const aboToAlerts = await userModel.find({ 'user_abo': { $elemMatch: { "etatAbo": true ,"latitude": { $gt: lat-0.002, $lt: lat+0.002 }, "longitude": { $gt: long-0.002, $lt: long+0.002 } } } } , { 'user_abo': { $elemMatch: { "etatAbo": true ,"latitude": { $gt: lat-0.002, $lt: lat+0.002 }, "longitude": { $gt: long-0.002, $lt: long+0.002 } } } });
  return aboToAlerts;
}

let sendPushNotification = async(pushToken,nom,type) => {
  let msg = "";
    if(type=='true'){
      msg = `${nom} : Un rétablissement de l'eau a été signalé !`
    }else{
      msg = `${nom} : coupure d'eau signalée !`
    }
    const message = {
      to:pushToken,
      sound: 'default',
      title: 'WaterBack',
      body: msg,
      data: {},
    };
    
    let notifReq = await request('POST','https://exp.host/--/api/v2/push/send', {
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
}

/* deleteOne Abonnement  */
router.post('/deleteOne-userAbo', async function(req, res, next) {
  let user_abo= [];

  if(req.body.emailFromFront != '' && req.body.tokenFromFront != '' && req.body.aboIdFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      token : req.body.tokenFromFront
    });
    if(user){
      user.user_abo = [...user.user_abo].filter((e)=>{
        console.log("user.user_abo BACK", e)
        return (e._id!=req.body.aboIdFromFront)
      });
      let savedUser = await user.save();
      user_abo = savedUser.user_abo;
       //console.log("userAbo from Back",user_abo)
    }
  }
res.json({user_abo});
});

/* updateOne Abonnement  */
router.put('/updateOne-userAbo', async function(req, res, next) {
  let user_abo= [];
  console.log("route update ok")

  if(req.body.emailFromFront != '' && req.body.tokenFromFront != '' && req.body.aboIdFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      token : req.body.tokenFromFront
    });
    if(user){

      for (let i=0; i < user.user_abo.length; i++){
        if(user.user_abo[i]._id == req.body.aboIdFromFront){
          user.user_abo[i].etatAbo = !user.user_abo[i].etatAbo
        }
      }

      let savedUser = await user.save();
      user_abo = savedUser.user_abo;
    }
  }
res.json({user_abo});
});


//update Token Notif
router.put('/update-tokenNotif', async function(req, res, next) {
  let tokenNotif= '';

  if(req.body.emailFromFront != '' && req.body.tokenFromFront != '' && req.body.tokenNotifFromFront != '' ){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      token : req.body.tokenFromFront
    });
    if(user){
      user.tokenNotif = req.body.tokenNotifFromFront;
      let savedUser = await user.save();
      tokenNotif = savedUser.tokenNotif;
    }
  }
  console.log("backtoken",tokenNotif)
res.json({tokenNotif});
});

module.exports = router;
