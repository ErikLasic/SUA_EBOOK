const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
const root = require('./resolvers');

function mountUserGraphQL(app) {
  app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true // v dev načinu
  }));
  console.log('🔷 [user-service] GraphQL @ /graphql');
}

module.exports = { mountUserGraphQL };
