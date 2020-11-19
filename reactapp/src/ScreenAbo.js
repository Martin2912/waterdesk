import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Redirect } from "react-router-dom";
import { Button, Input, notification } from 'antd';
import Nav from './Nav'
import { connect } from 'react-redux';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import usePlacesAutocomplete, { getGeocode, getLatLng, } from "use-places-autocomplete";
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxOption } from "@reach/combobox";
import '@reach/combobox/styles.css';
import { SaveOutlined } from '@ant-design/icons';

function ScreenAbo({ google, emailRedux, tokenRedux, aboListRedux, aboListUpdate }) {

  const [userLat, setUserLat] = useState(0);
  const [userLong, setUserLong] = useState(0);
  const [statusGranted, setStatusGranted] = useState("not granted");
  const [addressSearch, setAddressSearch] = useState("")
  const [newAboLat, setNewAboLat] = useState();
  const [newAboLong, setNewAboLong] = useState();
  const nomNouvelAbo = useRef("");
  const [inputVisible, setInputVisible] = useState(false);
  const [questionVisible, setQuestionVisible] = useState(true);

//fonction qui détermine ce qu'il se passe au clic sur un marqeur d'abonnement
  const onMarkerClick = (props, marker, e) => {
    setState({
      selectedPlace: props,
      name: marker.name,
      activeMarker: marker,
      showingInfoWindow: true
    })
  };

//fonction qui  permet de fermer le "info window" ouvert qu clic ci-dessus

  const onClose = () => {
    if (state.showingInfoWindow) {
      setState({
        showingInfoWindow: false,
        activeMarker: {},
      });
    }
  };

//fonction qui gère l'input dans lequel on écrit le nom du nouvel abonnement

  const handleOnChange = (nom) => {
    nomNouvelAbo.current = nom;
  }

// Input et bouton pour ajouter une adresse
  const InputAjouterNom = () => {
    if (inputVisible) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Input placeholder="Veuillez saisir le nom du lieu" onChange={(e) => handleOnChange(e.target.value)} />
          <div>
            <Button type="primary" size="small" shape="round" onClick={() => { btnAdd() }} style={{ marginTop: "5px" }}>
              Ajouter cette adresse
            </Button>
            <Button type="danger" size="small" shape="round" onClick={() => { btnAnnuler() }} style={{ marginTop: "5px" }}>
              Annuler
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }

  // texte et bouton de confirmation de l'ajout de la nouvelle adresse
  const InputOuiOuAnnuler = () => {
    if (questionVisible) {
      return (
        <div>
          <h4>Souhaitez-vous ajouter cette adresse à vos abonnements ?</h4>
          <div>
            <Button type="primary" size="small" shape="round" onClick={() => { btnOui() }}>
              Oui
            </Button>
            <Button type="danger" size="small" shape="round" onClick={() => { btnAnnuler() }}>
              Annuler
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  };

//fonction qui gère la visibilité des éléments
  const btnOui = () => {

    setInputVisible(true);
    setQuestionVisible(false);

  };

//fonction qui gère la visibilité des éléments

  const btnAnnuler = () => {
    setNewAboLat();
    setNewAboLong();
    setAddressSearch("");
    setInputVisible(false);
    setQuestionVisible(true);
  };

  const btnAdd = async () => {

    /* envoi d'un nouvel abonnement au BACK pour sauvegarde en BDD */
    const aboData = await fetch('users/abo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `userEmailFromFront=${emailRedux}&userTokenFromFront=${tokenRedux}&aboLongitudeFromFront=${newAboLong}&aboLatitudeFromFront=${newAboLat}&aboNomFromFront=${nomNouvelAbo.current}&aboEtatFromFront=${true}`
    })
    /* récupérer la liste mise à jour des abonnements de l'utilisateur */
    const aboBDD = await aboData.json()
    if (aboBDD) {
      /* envoi de la liste d'abonnement à jour dans Redux */
      aboListUpdate(aboBDD.user_abo);
      // }
    };
    setAddressSearch("");
    const openNotificationAbo = () => {
      notification.open({
        message: 'Enregistrement nouvel abonnement ',
        description: `l'abonnement : ${nomNouvelAbo.current} a bien été ajouté`,
        icon: <SaveOutlined style={{ color: '#108ee9' }} />,
      });
    };
    openNotificationAbo();
  }

//Map qui permet l'affiche des marqueurs abonnements sur l'écran
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

  const [state, setState] = useState({
    showingInfoWindow: false,
    name: null,
    activeMarker: {},
    selectedPlace: {}
  });

// fonction qui gère la fonctionnalité de recherche d'adresse, ici dans les options on détermine qu'on souhaite des adresses proches du centre de Paris
  function Search({ }) {
    const { ready, value, suggestions: { status, data }, setValue, clearSuggestion } = usePlacesAutocomplete({
      requestOptions: {
        location: { lat: () => 48.866667, lng: () => 2.333333 },
        radius: 2 * 1000,

      }
    });


    return (
      <div className="searchAbo">
        <Combobox onSelect={async (address) => {

          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            setNewAboLat(lat);
            setNewAboLong(lng);
            setAddressSearch(address);
          } catch (error) {
            console.log(error)
          }
        }}
        >
          <ComboboxInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Veuillez saisir une adresse à surveiller"
            className="searchAboInput"
          />
          <ComboboxPopover>
            {status === "OK" && data.map(({ id, description }) => (<ComboboxOption key={description} value={description} />))}
          </ComboboxPopover>
        </Combobox>
      </div>
    )

  }

  function SearchText() {
    if (addressSearch != "") {
      return (
        <div className="textBanniere">
          <div style={{ marginRight: '20px' }}>
            <h4>Vous avez sélectionné l'adresse suivante:</h4>
            <h4>{addressSearch}</h4>
          </div>
          <InputOuiOuAnnuler />
          <InputAjouterNom />
        </div>
      )
    } else {
      return (
        <div className="textBanniereAlt">
          <h3>Merci de saisir une adresse</h3>
        </div>
      )
    }
  }


  useEffect(() => {
    let initFunc = () => {

      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      function success(pos) {
        var crd = pos.coords;

        setUserLat(crd.latitude);
        setUserLong(crd.longitude);
        if (userLat != 0) {
          setStatusGranted("granted");
          console.log('status granted ?', statusGranted)
        }
      }

      function error(err) {
        console.warn(`ERREUR (${err.code}): ${err.message}`);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    }

    initFunc()

  }, [])


  if (tokenRedux) {
    return (
      <div>
        <Nav />

        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }} className="Banner">
          <Search />
          <SearchText />
        </div>

        <div className="HomeThemes">
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

            {aboMarkersJSX}

            <Marker
              onClick={onMarkerClick}
              name={'You are here'}
              position={{ lat: userLat, lng: userLong }}
            />

            <Marker
              onClick={onMarkerClick}
              name={'Voici votre nouvel abonnement'}
              position={{ lat: newAboLat, lng: newAboLong }}
              icon={{ url: "../images/signal.png", scaledSize: new window.google.maps.Size(30, 30) }}
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
    aboListUpdate: function (aboArray) {
      dispatch({ type: 'aboListUpdate', aboArray })
    },
    changeCurrentLocation: function (location) {
      dispatch({ type: 'changeCurrentLoca', location })
    },


  }
}

const connectRedux = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenAbo)


export default GoogleApiWrapper({
  apiKey: 'AIzaSyDat-YeWhRqyV2Ga7qXT6yw1X9Y__5Uwmk'
})(connectRedux);