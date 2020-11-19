import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom'
import './App.css';
import { Button, Badge, notification, Popover, List } from 'antd';
import Nav from './Nav'
import { connect } from 'react-redux';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import { ExclamationCircleTwoTone, BellOutlined, BellFilled, SmileOutlined, FrownOutlined, SaveOutlined } from '@ant-design/icons';

function ScreenMap({ google, emailRedux, tokenRedux, aboListRedux, aboListDispatch }) {

  const [userLat, setUserLat] = useState(0);
  const [userLong, setUserLong] = useState(0);
  const [statusGranted, setStatusGranted] = useState("not granted");
  const [alertMarkersData, setAlertMarkersData] = useState([]);
  const [notifData, setNotifData] = useState([]);
  const [nomAdresse, setNomAdresse] = useState("");
  const [sizeIcon, setSizeIcon] = useState("70px");
  const [signalTextVisible, setSignTextVisible] = useState(false);

  //get markers

  let fetchMarkers = async () => {
    const dataMarkers = await fetch('/get-markers');
    const markersRes = await dataMarkers.json();
    setAlertMarkersData(markersRes);
  }

  //get user abonnements

  let fetchAboUsers = async () => {
    const dataUserAbo = await fetch('users/get-user_abo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `emailFromFront=${emailRedux}&tokenFromFront=${tokenRedux}`
    })
    const aboRes = await dataUserAbo.json();

    // envoi dans Redux :
    aboListDispatch(aboRes.user_abo);
  }
 
  //get notifications de l'utilisateurs
  let fetchAlertNotif = async () => {
    const dataUserAlert = await fetch('users/get-user_alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `emailFromFront=${emailRedux}&tokenFromFront=${tokenRedux}`
    })
    const alertRes = await dataUserAlert.json();
    console.log(alertRes.user_alerts)
    setNotifData(alertRes.user_alerts)
  }

  const [state, setState] = useState({
    showingInfoWindow: false,
    name: null,
    activeMarker: {},
    selectedPlace: {}
  });



//gestion du clic sur les marqueurs
  const onMarkerClick = (props, marker) => {
    setState({
      selectedPlace: props,
      name: marker.name,
      activeMarker: marker,
      showingInfoWindow: true
    })
  };

//gestion du clic pour fermer les info windows des marqueurs
  const onClose = () => {
    if (state.showingInfoWindow) {
      setState({
        showingInfoWindow: false,
        activeMarker: {},
      });
    }
  };

//requête pour enregistrer une nouvelle alerte/un nouveau marqueur

  var sendAlertToBack = async (etat) => {
    console.log("send to back");
    const dataNewMarker = await fetch('users/save-new_marker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `userEmailFromFront=${emailRedux}&userTokenFromFront=${tokenRedux}&alertLongitudeFromFront=${userLong}&alertLatitudeFromFront=${userLat}&alertTypeFromFront=${etat}`
    })
    const newMarker = await dataNewMarker.json();
    setAlertMarkersData([...alertMarkersData, newMarker.savedMarker]);
    setSignTextVisible(false);

//Notification de succès de l'enregistrement de l'alerte
    const openNotificationAlerte = () => {

      var descriptionCoupure = "La coupure d'eau a bien été signalée"
      var descriptionRetourEau = "Le retour de l'eau a bien été signalé";
      notification.open({
        message: 'Nouvelle alerte émise ',
        description: etat ? descriptionRetourEau : descriptionCoupure,
        icon: <SaveOutlined style={{ color: etat ? '#108ee9' : '#e36387' }} />,
      });
    };
    openNotificationAlerte();
  }

//Texte et bouton qui accompagnent le user dans l'émission d'une alerte
  function SignalText() {
    if (signalTextVisible) {
      return (
        <div className="textBanniereMap">
          <div>
            <h3>Vous souhaitez émettre une nouvelle alerte à l'adresse suivante: {nomAdresse} </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Button type="primary" size="default" shape="round" onClick={() => { sendAlertToBack(true) }} style={{ marginRight: "10px" }}>
              Signaler le retour de l'eau
          </Button>
            <Button type="danger" size="default" shape="round" onClick={() => { sendAlertToBack(false) }}>
              Signaler une coupure d'eau
          </Button>
          </div>
          {/* <InputOuiOuAnnuler />
          <InputAjouterNom /> */}
        </div>
      )
    } else {
      return (
        <div className="textBanniereMap">
          <h3>Pour émettre une alerte, cliquez sur le bouton en bas à droit de la carte</h3>
        </div>
      )
    }
  }

//Requête pour supprimer une notification sur laquelle on clique
  let onNotifPress = async (alert) => {
    var delUserAlert = await fetch('users/deleteOne-userAlert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `emailFromFront=${emailRedux}&tokenFromFront=${tokenRedux}&alertIdFromFront=${alert._id}`
    });
    const alertRes = await delUserAlert.json();
    setNotifData(alertRes.user_alerts);
  }

//gestion de l'ouverture et du siplay de l'espace de notifications
  function openNotification(placement) {
    if (notifData.length > 0) {
      var lastNotif = notifData.length - 1;
      var notifDate = notifData[lastNotif].date
      var today = new Date();
      var todayDate = today.getDay() + today.getMonth();
      var notifCoupure = `Une coupure d'eau a été signalée au lieu suivant : ${notifData[lastNotif].lieu}. Pensez à regardez vos autres notifications !`;
      var notifCoupure = `Une coupure d'eau a été signalée au lieu suivant : ${notifData[lastNotif].lieu}. Pensez à regardez vos autres notifications !`;
      var notifRetourEau = `Bonne nouvelle ! Le retour de l'eau a été signalé au lieu suivant : ${notifData[lastNotif].lieu}!`;
      console.log("notifDate:", notifDate, "todayDate", today);
      console.log("type", notifData[lastNotif].type)
      notification.info({
        message: `Nouvelle Alerte à ${notifData[lastNotif].lieu}`,
        description: (notifData[lastNotif].type === "true" ? notifRetourEau : notifCoupure),
        onClick: () => {
          onNotifPress(notifData[lastNotif]);
        },
        placement,
        icon: (notifData[lastNotif].type === "true" ? <SmileOutlined style={{ color: '#12cad6' }} /> : <FrownOutlined style={{ color: '#e36387' }} />),
      });

    }
  };

//gestion de la cloche représentant les notifications
  function NotifBell() {
    if (notifData.length > 0) {


      var content = <List
        itemLayout="horizontal"
        dataSource={notifData}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={(item.type === "true" ? <div><SmileOutlined style={{ color: '#12cad6' }} /> Alerte : {item.lieu}</div> : <div><FrownOutlined style={{ color: '#e36387' }} /> Alerte : {item.lieu}</div>)}
              description={(item.type === "true" ? ` [${item.date.substring(0, 10)} à ${item.date.substring(11, 16)} ] Le retour de l'eau a été signalé au lieu suivant : ${item.lieu}.` : ` [${item.date.substring(0, 10)} à ${item.date.substring(11, 16)} ] Une coupure d'eau a été signalée au lieu suivant : ${item.lieu}.`)}
            />
            <Button type="danger" size="small" shape="round" onClick={() => onNotifPress(item)}>Supprimer</Button>

          </List.Item>
        )}
      />


      return (
        <div className="Bell">
          <Popover placement="leftTop" title={"Vos notifications en attente"} content={content} trigger="click">
            <Badge count={(notifData.length < 10) ? notifData.length : "10+"} offset={[8, 5]}>
              <BellFilled style={{ fontSize: "30px", zIndex: "1", color: "#e4f9ff" }}>
              </BellFilled>
            </Badge>
          </Popover>
        </div>
      )
    } else {
      return (
        <div className="Bell">
          <BellOutlined style={{ fontSize: "30px", zIndex: "1", color: "#e4f9ff" }}>
          </BellOutlined>
        </div>
      )
    }
  }

  useEffect(() => {
    //fonction lancée à l'initialisation de la page
    let initFunc = () => {

      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
//géolocalisation du user
      function success(pos) {
        var crd = pos.coords;

        setUserLat(crd.latitude);
        setUserLong(crd.longitude);
        var latlng = { lat: crd.latitude, lng: crd.longitude }

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === "OK") {
            if (results[0]) {
              setNomAdresse(results[0].formatted_address);
            } else {
              window.alert("No results found");
            }
          } else {
            window.alert("Geocoder failed due to: " + status);
          }
        })

        if (userLat != 0) {
          setStatusGranted("granted");
          console.log('status granted ?', statusGranted)
        }
      }

      function error(err) {
        console.warn(`ERREUR (${err.code}): ${err.message}`);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
//fetch des marqueurs, des notifications, et des abonnements
      fetchMarkers();
      fetchAboUsers();
      fetchAlertNotif();
//fonction pour mettre à jour régulièrement les informations
      setInterval(() => { fetchAboUsers(); fetchAlertNotif(); fetchMarkers() }, 30000)
    }

    initFunc();
  }, [])

  useEffect(() => {
    console.log("notif du useeffect", notifData)
    setTimeout(() => { openNotification('topRight') }, 60000);
  }, [notifData])

  let alertMarkersJSX = alertMarkersData.map((marker, i) => {
    return ([<Marker key={i + 'alert screen map'}
      position={{ lat: marker.latitude, lng: marker.longitude }}
      onClick={onMarkerClick}
      name={marker.date.substring(0,10)}
      icon={{ url: (marker.type ? "../images/002-drop.png" : "../images/001-drop-1.png"), scaledSize: new window.google.maps.Size(30, 30) }}
    />,

    ])
  }
  );

  let aboMarkersJSX = aboListRedux.map((abo, i) => {
    return ([<Marker key={i + 'abo screenAbo'}
      onClick={onMarkerClick}
      name={abo.nomAbo}
      position={{ lat: abo.latitude, lng: abo.longitude }}
      icon={{ url: "../images/signal.png", scaledSize: new window.google.maps.Size(30, 30) }}
    />
    ])
  }
  );



  if (tokenRedux) {

    return (
      <div>
        <Nav />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="Banner">
          <SignalText />
          <NotifBell />

        </div>

        <div className="HomeThemes">

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', width: "87%", height: "33em" }}>
            <ExclamationCircleTwoTone
              style={{ fontSize: sizeIcon, zIndex: "1" }} twoToneColor="#0fabbc"
              onClick={() => { setSignTextVisible(true) }}
              onMouseEnter={() => (setSizeIcon("90px", setTimeout(setSizeIcon("70px", 300))))}
              onMouseLeave={() => setSizeIcon("70px")}
            />
          </div>

          <Map
            google={google}
            zoom={14}
            style={mapStyles}
            initialCenter={
              {
                lat: 48.866667,
                lng: 2.333333
              }
            }

          >


            {alertMarkersJSX}
            {aboMarkersJSX}

            <Marker
              onClick={onMarkerClick}
              name={'Vous êtes ici'}
              position={{ lat: userLat, lng: userLong }}

            />

            <InfoWindow
              marker={state.activeMarker}
              visible={state.showingInfoWindow}
              onClose={onClose}
            >
              <div>
                <h4>{state.name}</h4>
              </div>
            </InfoWindow>

          </Map>

        </div>

      </div>
    );
  } else {
    return <Redirect to="/" />
  }
}

const mapStyles = {
  width: '100%',
  height: '85%'
};

function mapStateToProps(state) {
  return { emailRedux: state.user.email, tokenRedux: state.user.token, nameRedux: state.user.name, aboListRedux: state.aboList }
}

function mapDispatchToProps(dispatch) {
  return {
    aboListDispatch: function (aboArray) {
      dispatch({ type: 'aboListDispatch', aboArray })
    },
    changeCurrentLocation: function (location) {
      dispatch({ type: 'changeCurrentLoca', location })
    },
    setUserAlerts: function (alertsArr) {
      dispatch({ type: 'setUserAlerts', alertsArr })
    }

  }
}

const connectRedux = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenMap)


export default GoogleApiWrapper({
  apiKey: 'AIzaSyDat-YeWhRqyV2Ga7qXT6yw1X9Y__5Uwmk'
})(connectRedux);