const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
const root = require('./resolvers');

function mountLoanGraphQL(app) {
  app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
  }));
  console.log('🔷 [loan-service] GraphQL @ /graphql');
}

module.exports = { mountLoanGraphQL };
