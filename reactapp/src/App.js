import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import './App.css';

import {provider, Provider} from 'react-redux'
import {createStore, combineReducers} from 'redux'

import user from './reducers/user';
import aboList from './reducers/abo';
import currentLoca from './reducers/location';
import tokenNotif from './reducers/notifToken';
import alertsData from './reducers/alerts';

import ScreenHome from './ScreenHome';
import ScreenMyProfile from './ScreenMyProfile';
import ScreenMap from './ScreenMap';
import ScreenAbo from './ScreenAbo';

const store = createStore(combineReducers({user, aboList, currentLoca, tokenNotif, alertsData}))

function App() {
  return (

    <Provider store={store}>
      <Router>
        <Switch>
          <Route component={ScreenHome} path="/" exact />
          <Route component={ScreenMap} path="/screenmap" exact />
          <Route component={ScreenAbo} path="/screenabo" exact />
          <Route component={ScreenMyProfile} path="/screenmyprofile" exact />
        </Switch>
      </Router>
    </Provider>
    

  );
}

export default App;
