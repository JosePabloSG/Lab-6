"use strict";

// Cargar variables de entorno
require('dotenv').config();

// Imports
const express = require("express");
const { auth, requiresAuth } = require('express-openid-connect');
var cons = require('consolidate');
var path = require('path');
let app = express();

// Variables de entorno
const PORT = process.env.PORT || "3000";
const SECRET = process.env.AUTH0_SECRET; // Dejar el secret así como está.

//  Configuración de Auth0 usando variables de entorno
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  routes: {
    callback: '/callback',
    postLogoutRedirect: '/'
  }
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Custom callback to redirect to dashboard after login
app.get('/callback', requiresAuth(), (req, res) => {
  res.redirect('/dashboard');
});

// MVC View Setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('models', path.join(__dirname, 'models'));
app.set('view engine', 'html');

// App middleware
app.use("/static", express.static("static"));

// App routes
app.get("/",  (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render("index");
  }
});

app.get("/dashboard", requiresAuth() ,(req, res) => {  
  // Obtener información del usuario autenticado
  const userInfo = req.oidc.user;
  res.render("dashboard", { user: userInfo });
});

console.log("Server running on port: " + PORT);
app.listen(parseInt(PORT));