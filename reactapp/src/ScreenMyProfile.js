import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import './App.css';
import { Card, Avatar, Row, Col, Switch, Button } from 'antd';
import { AlertOutlined } from '@ant-design/icons';

import Nav from './Nav'

import { connect } from 'react-redux'

const { Meta } = Card;

function ScreenMyProfile({ nameRedux, aboListRedux, aboListUpdate, emailRedux, tokenRedux }) {

// Fonction qui gère la suppression d'un abonnement
  const deleteAbo = async (aboId) => {

    var delUserAbo = await fetch('users/deleteOne-userAbo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `emailFromFront=${emailRedux}&tokenFromFront=${tokenRedux}&aboIdFromFront=${aboId}`
    });
    const aboRes = await delUserAbo.json();
    aboListUpdate(aboRes.user_abo);
  }

  //fonction qui gère le status de l'abonnement (actif ou non)
  const updateBoolAbo = async (aboId) => {
    var updateUserAbo = await fetch('users/updateOne-userAbo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `emailFromFront=${emailRedux}&tokenFromFront=${tokenRedux}&aboIdFromFront=${aboId}`
    });
    const aboUpdateRes = await updateUserAbo.json();

    aboListUpdate(aboUpdateRes.user_abo);
  }

//affichage des abonnements sur le profil utilisateur
  var aboComponent = aboListRedux.map((abo, i) => {
    let cardTitle = <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}> <AlertOutlined></AlertOutlined> {abo.nomAbo}</div>

    return (
      <Col span={8} key={i + "liste abo"}>
        <Card title={cardTitle} bordered={true} style={{ display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: "center" }}>
          Activer/Désactiver les notifications
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: "10px" }}>
            <Switch checkedChildren="On" unCheckedChildren="Off" checked={abo.etatAbo} onChange={() => updateBoolAbo(abo._id)} checked={abo.etatAbo} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: "10px" }}>
            <Button type="danger" size="small" shape="round" onClick={() => deleteAbo(abo._id)}>
              Supprimer
          </Button>
          </div>
        </Card>
      </Col>
    )
  }
  )


  if (tokenRedux) {
    return (
      <div>

        <Nav />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "10px" }} >

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: "10px", width: "100%", height: "auto" }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: "10px", width: "45%", height: "auto" }}>
              <Avatar size={128} src={'https://randomuser.me/api/portraits/women/36.jpg'} />
              <h1>Bonjour {nameRedux}</h1>
              <h2>Voici votre dashboard</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: "10px", width: "55%", height: "auto" }}>
              <h3 style={{ fontStyle: "italic", marginBottom: "20px", textAlign: "justify" }}>WaterBack a été conçu par des étudiants de la Capsule afin d'assurer une meilleure communication entre les foyers de Libreville concernant les pénuries d'eau. Vous pouvez surveiller différents lieux grâce à votre dashboard ci-dessous. Pour ajouter un abonnement, cliquer sur le bouton suivant : </h3>
              <Link to="/ScreenAbo">
                <Button type="primary" size="large" shape="round">
                  Ajouter un abonnement
          </Button>
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: "10px", width: "100%", height: "auto" }}>
            <div className="site-card-wrapper">
              <Row gutter={32}>
                {aboComponent}
              </Row>
            </div>
          </div>
        </div>

      </div>
    );
  } else {
    return <Redirect to="/" />
  }

}


function mapStateToProps(state) {
  return { emailRedux: state.user.email, tokenRedux: state.user.token, nameRedux: state.user.name, aboListRedux: state.aboList }
}

function mapDispatchToProps(dispatch) {
  return {
    aboListUpdate: function (aboArray) {
      dispatch({ type: 'aboListUpdate', aboArray })
    }
  }
}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScreenMyProfile);
