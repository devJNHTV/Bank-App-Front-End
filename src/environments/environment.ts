export const environment = {
  production: false,
  apiUrl: 'http://localhost:8888/api/customers',
  keycloak: {
    url: 'http://localhost:8081/realms/myrealm/protocol/openid-connect/token',
    clientId: 'customer-service',
    clientSecret: 'vF8VYOn3m3g63csOanjpBqG9AxQNUEQX',
    realm: 'myrealm'
  }
};