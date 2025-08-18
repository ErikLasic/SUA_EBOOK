const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
require('dotenv').config();

const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers');

async function startServer() {
    const app = express();
    
    // Enable CORS
    app.use(cors());
    
    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        playground: true,
        context: ({ req }) => {
            // Pass request context for authentication if needed
            const token = req.headers.authorization || '';
            return { token };
        }
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.PORT || 4001;

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'healthy',
            service: 'GraphQL Service',
            timestamp: new Date().toISOString(),
            graphql: `http://localhost:${PORT}${server.graphqlPath}`
        });
    });

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'SUA eBook GraphQL API',
            graphql: `http://localhost:${PORT}${server.graphqlPath}`,
            health: `http://localhost:${PORT}/health`
        });
    });

    app.listen(PORT, () => {
        console.log(`🚀 GraphQL Service running on http://localhost:${PORT}`);
        console.log(`🎯 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    });
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
