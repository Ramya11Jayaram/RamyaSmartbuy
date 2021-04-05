// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  /** Okta Config */
  
  //client_id: "0oaeaym7sfCHjE3gD4x6",
  client_id: "0oa2mnubdm9G8mPJr4x7",
  //issuer: 'https://dev-235390.okta.com/oauth2/smartbuy',
  //issuer: 'https://dev-859580.okta.com/oauth2/default',
  issuer: 'https://dev-859580.okta.com/oauth2/default',
  redirectUri: window.location.origin + '/login/callback',
  callback_path: '/implicit/callback',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
