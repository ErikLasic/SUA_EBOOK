const { GraphQLScalarType, GraphQLError } = require('graphql');
const { Kind } = require('graphql/language');
const apiService = require('./services/apiService');

// Custom DateTime scalar
const DateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            return new Date(value).toISOString();
        }
        throw new GraphQLError(`Value is not a valid DateTime: ${value}`);
    },
    parseValue(value) {
        if (typeof value === 'string') {
            return new Date(value);
        }
        throw new GraphQLError(`Value is not a valid DateTime string: ${value}`);
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        throw new GraphQLError(`Can only parse strings to dates but got a: ${ast.kind}`);
    },
});

const resolvers = {
    DateTime: DateTimeScalar,

    // Query resolvers
    Query: {
        // User queries
        users: async () => {
            console.log('🚀 GraphQL users resolver called');
            const result = await apiService.getUsers();
            console.log('🔄 Resolver got result:', typeof result, Array.isArray(result), result?.length);
            return result;
        },

        user: async (_, { id }) => {
            return await apiService.getUser(id);
        },

        userByEmail: async (_, { email }) => {
            return await apiService.getUserByEmail(email);
        },

        // Book queries
        books: async () => {
            return await apiService.getBooks();
        },

        book: async (_, { id }) => {
            return await apiService.getBook(id);
        },

        booksByAuthor: async (_, { author }) => {
            return await apiService.getBooksByAuthor(author);
        },

        booksByGenre: async (_, { genre }) => {
            return await apiService.getBooksByGenre(genre);
        },

        // Review queries
        reviews: async () => {
            return await apiService.getReviews();
        },

        review: async (_, { id }) => {
            return await apiService.getReview(id);
        },

        reviewsByUser: async (_, { userId }) => {
            return await apiService.getReviewsByUser(userId);
        },

        reviewsByBook: async (_, { bookId }) => {
            return await apiService.getReviewsByBook(bookId);
        },

        recentReviews: async (_, { limit }) => {
            return await apiService.getRecentReviews(limit);
        },

        // Statistics queries
        statistics: async () => {
            return await apiService.getStatistics();
        },

        bookStatistics: async () => {
            return await apiService.getBookStatistics();
        },

        userStatistics: async () => {
            return await apiService.getUserStatistics();
        },

        bookStats: async (_, { bookId }) => {
            const allBookStats = await apiService.getBookStatistics();
            return allBookStats.find(stat => stat.bookId === bookId) || null;
        },

        userStats: async (_, { userId }) => {
            const allUserStats = await apiService.getUserStatistics();
            return allUserStats.find(stat => stat.userId === userId) || null;
        },
    },

    // Mutation resolvers
    Mutation: {
        createReview: async (_, { input }, { token }) => {
            if (!token) {
                throw new GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return await apiService.createReview(input, token);
        },

        updateReview: async (_, { id, input }, { token }) => {
            if (!token) {
                throw new GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return await apiService.updateReview(id, input, token);
        },

        deleteReview: async (_, { id }, { token }) => {
            if (!token) {
                throw new GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return await apiService.deleteReview(id, token);
        },
    },

    // Type resolvers - resolve nested fields
    User: {
        reviews: async (parent) => {
            return await apiService.getReviewsByUser(parent.id);
        },
        reviewCount: async (parent) => {
            const reviews = await apiService.getReviewsByUser(parent.id);
            return reviews.length;
        },
        createdAt: (parent) => {
            return parent.createdAt || new Date().toISOString();
        }
    },

    Book: {
        reviews: async (parent) => {
            return await apiService.getReviewsByBook(parent.id);
        },
        reviewCount: async (parent) => {
            const reviews = await apiService.getReviewsByBook(parent.id);
            return reviews.length;
        },
        averageRating: async (parent) => {
            const reviews = await apiService.getReviewsByBook(parent.id);
            if (reviews.length === 0) return 0;
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            return sum / reviews.length;
        },
        createdAt: (parent) => {
            return parent.createdAt || new Date().toISOString();
        },
        publishedDate: (parent) => {
            return parent.publishedDate || parent.published_date;
        }
    },

    Review: {
        user: async (parent) => {
            return await apiService.getUser(parent.userId);
        },
        book: async (parent) => {
            return await apiService.getBook(parent.bookId);
        },
        createdAt: (parent) => {
            return parent.createdAt || new Date().toISOString();
        },
        updatedAt: (parent) => {
            return parent.updatedAt || parent.createdAt || new Date().toISOString();
        }
    },

    BookStats: {
        book: async (parent) => {
            return await apiService.getBook(parent.bookId);
        }
    },

    UserStats: {
        user: async (parent) => {
            return await apiService.getUser(parent.userId);
        }
    },
};

module.exports = resolvers;
