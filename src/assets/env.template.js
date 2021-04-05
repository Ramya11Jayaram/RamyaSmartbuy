(function(window) {
  window.__env = window.__env || {};

  // API url - > you can edit this link
  window.__env.apiUrl = "${API_URL}";

  // Okta configuration -> you can edit this object.
  window.__env.oktaConfiguration = {
    "issuer": "${ISSUER_URL}",
    "redirectUri": "${UI_URL}/implicit/callback",
    "clientId": "${CLIENT_ID}",
    "pkce": false,
    "baseUrl": "${BASE_URL}",
    "scopes": ["openid", "profile", "email"]
   };

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  // This setting is currently not used, but it is left in just in case. Ignore it if you're not a developer.
  window.__env.enableDebug = true;
})(this);
