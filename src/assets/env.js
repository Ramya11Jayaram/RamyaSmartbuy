(function(window) {
  window.__env = window.__env || {};

  // API url - > you can edit this link

  //window.__env.apiUrl = "http://localhost:8080/api";

  window.__env.apiUrl = "https://smartbuy.ameri100.com/api";
  window.__env.apiUrlPref = "https://smartbuy.ameri100.com/userservice/";

  // Okta configuration -> you can edit this object.
  window.__env.oktaConfiguration = {
    issuer: 'https://dev-859580.okta.com/oauth2/default',
    //"issuer": "https://dev-859580.okta.com/default",
    //"redirectUri": "http://35.226.20.177:5015/implicit/callback",
    "redirectUri": "https://smartbuy.ameri100.com/implicit/callback",
    //"clientId": "0oaeaym7sfCHjE3gD4x6", 
    "clientId": "0oa2mnubdm9G8mPJr4x7", 
    "pkce": false,
    "baseUrl": "https://dev-859580.okta.com",
    "scopes": ["openid", "profile", "email"]
   };

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  // This setting is currently not used, but it is left in just in case. Ignore it if you're not a developer.
  window.__env.enableDebug = true;
})(this);
