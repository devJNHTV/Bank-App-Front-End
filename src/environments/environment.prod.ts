export const environment = {
     production: true,
     keycloak: {
       url: 'https://your-production-keycloak-url/realms/myrealm/protocol/openid-connect/token',
       clientId: 'customer-service',
       clientSecret: 'your-production-client-secret'
     }
   };