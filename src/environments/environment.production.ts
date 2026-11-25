/**
 * Configuración de producción.
 *
 * Por ahora comparte el proyecto Firebase de desarrollo (grifoasto). Si más
 * adelante existe un proyecto separado de producción, reemplaza estos valores.
 */
export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyAhqWy1_2slpmEuLXVpMXn1cyjOgVA3jx8',
    authDomain: 'grifoasto.firebaseapp.com',
    databaseURL: 'https://grifoasto.firebaseio.com',
    projectId: 'grifoasto',
    storageBucket: 'grifoasto.appspot.com',
    messagingSenderId: '398237107059',
    appId: '1:398237107059:web:821d803fad89b2b9cfbb06',
  },
};
