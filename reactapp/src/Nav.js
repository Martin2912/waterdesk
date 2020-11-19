import React from 'react';
import { Link } from 'react-router-dom'
import './App.css';
import { Menu, Icon } from 'antd'
import { EnvironmentOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';


//barre de navigation qui va apparaître sur tous les écrans
function Nav() {

  return(
    <nav key="nav du navbar">
      <Menu style={{ textAlign: 'center', backgroundColor:'#0fabbc' }} mode="horizontal" theme="dark" key="Menu du navbar">



      <Menu.Item key="mail1">
          <Link to="/screenmyprofile">
            <UserOutlined></UserOutlined>
            Mon Profil
          </Link>
        </Menu.Item>

        <Menu.Item key="mail2">
          <Link to="/screenmap">
            <EnvironmentOutlined></EnvironmentOutlined>
            Carte des alertes
          </Link>
        </Menu.Item>

        <Menu.Item key="app">
          <Link to="/">
          <LogoutOutlined></LogoutOutlined>
            Logout
          </Link>
        </Menu.Item>

      </Menu>
    </nav>
  );
}

export default Nav;
