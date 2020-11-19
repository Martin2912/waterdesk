import React, { useState } from 'react';
import './App.css';
import { Input, Button } from 'antd';
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

function ScreenHome({ onSignIn, onSignUp }) {

  const [emailField, setEmailField] = useState('');
  const [nameField, setNameField] = useState('');
  const [passField, setPassField] = useState('');

  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  const [userExists, setUserExists] = useState(false)

  const [listErrorsSignin, setErrorsSignin] = useState([])
  const [listErrorsSignup, setErrorsSignup] = useState([])

//Fonction asynchrone qui gère les requêtes d'inscription (ajout nouvel utilisateur)
  var handleSubmitSignup = async () => {

    const data = await fetch('users/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `nameFromFront=${nameField}&emailFromFront=${emailField}&passwordFromFront=${passField}`
    })

    const signUpRes = await data.json()

    if (signUpRes.result == true) {
      onSignUp([signUpRes.token, signUpRes.email, signUpRes.name])
      setUserExists(true)
    } else {
      setErrorsSignup(signUpRes.error)
    }
  }

//Fonction asynchrone qui gère les requêtes de login (vérification en BDD des infos saisies par utilisateur)
var handleSubmitSignin = async () => {

    const data = await fetch('users/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `emailFromFront=${signInEmail}&passwordFromFront=${signInPassword}`
    })

    const signInRes = await data.json()

    console.log("connexion:", signInRes.error.type)
    if (signInRes.result == true) {
      onSignIn([signInRes.token, signInRes.email, signInRes.name])

      setUserExists(true)

    } else {
      setErrorsSignin(signInRes.error)
    }
  }

  if (userExists) {
    return <Redirect to='/screenmap' />
  }

  var tabErrorsSignin = listErrorsSignin.map((error, i) => {
    return (<p style={{ color: "red" }} key={i + "listeerror signin"}>{error.msg}</p>)
  })

  var tabErrorsSignup = listErrorsSignup.map((error, i) => {
    return (<p style={{ color: "red" }} key={i + "listeerror signup"}>{error.msg}</p>)
  })



  return (
    <div className="Login-page" >

      {/* SIGN-IN */}

      <div className="Sign">

        <Input onChange={(e) => setSignInEmail(e.target.value)} className="Login-input" placeholder="email" />

        <Input.Password onChange={(e) => setSignInPassword(e.target.value)} className="Login-input" placeholder="password" />

        {tabErrorsSignin}

        <Button onClick={() => handleSubmitSignin()} style={{ width: '80px' }} type="primary">Sign-in</Button>

      </div>

      {/* SIGN-UP */}

      <div className="Sign">

        <Input onChange={(e) => setNameField(e.target.value)} className="Login-input" placeholder="username" />

        <Input onChange={(e) => setEmailField(e.target.value)} className="Login-input" placeholder="email" />

        <Input.Password onChange={(e) => setPassField(e.target.value)} className="Login-input" placeholder="password" />

        {tabErrorsSignup}

        <Button onClick={() => handleSubmitSignup()} style={{ width: '80px' }} type="primary">Sign-up</Button>

      </div>

    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    onSignIn: function ([token, email, name]) {
      dispatch({ type: 'connectUser', token: token, email: email, name: name })
    },
    onSignUp: function ([token, email, name]) {
      dispatch({ type: 'connectUser', token: token, email: email, name: name })
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(ScreenHome)
