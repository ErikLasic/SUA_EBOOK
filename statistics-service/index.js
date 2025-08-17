const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';

async function connectDB() {
    try {
        console.log('=== CONNECT DB CALLED ===');
        console.log('Connecting to MongoDB at:', MONGO_URL);
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        db = client.db('reviewservice');
        console.log('=== Connected to MongoDB database: reviewservice ===');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

// Service URLs
const REVIEW_SERVICE = process.env.REVIEW_SERVICE_URL || 'http://review-service:5003';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://user-service:5001';

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'statistics-service' });
});

// Get overall statistics
app.get('/api/stats/overview', async (req, res) => {
    try {
        console.log('=== Getting Overview Statistics ===');
        
        // Check if DB is connected
        if (!db) {
            console.error('Database not connected!');
            return res.status(500).json({ error: 'Database not connected' });
        }
        
        console.log('Database connected, querying reviews...');
        
        // Get review statistics from database
        const reviewsCollection = db.collection('reviews');
        console.log('Got reviews collection');
        
        const totalReviews = await reviewsCollection.countDocuments();
        console.log('Total reviews count:', totalReviews);
        
        const avgRating = await reviewsCollection.aggregate([
            { $group: { _id: null, averageRating: { $avg: "$rating" } } }
        ]).toArray();
        console.log('Average rating result:', avgRating);

        // Get unique book and user counts
        const uniqueBooks = await reviewsCollection.distinct('bookId');
        const uniqueUsers = await reviewsCollection.distinct('userId');
        console.log('Unique books:', uniqueBooks.length, 'Unique users:', uniqueUsers.length);

        const stats = {
            totalReviews,
            averageRating: avgRating.length > 0 ? Math.round(avgRating[0].averageRating * 100) / 100 : 0,
            totalBooks: uniqueBooks.length,
            totalUsers: uniqueUsers.length,
            timestamp: new Date().toISOString()
        };

        console.log('Overview stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Error getting overview stats:', error);
        res.status(500).json({ error: 'Failed to get statistics', message: error.message });
    }
});

// Get book statistics
app.get('/api/stats/books', async (req, res) => {
    try {
        console.log('=== Getting Book Statistics ===');
        
        const reviewsCollection = db.collection('reviews');
        
        // Aggregate reviews by book
        const bookStats = await reviewsCollection.aggregate([
            {
                $group: {
                    _id: "$bookId",
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" },
                    ratings: { $push: "$rating" }
                }
            },
            {
                $project: {
                    bookId: "$_id",
                    totalReviews: 1,
                    averageRating: { $round: ["$averageRating", 2] },
                    _id: 0
                }
            },
            { $sort: { totalReviews: -1 } },
            { $limit: 10 }
        ]).toArray();

        console.log('Book stats:', bookStats);
        res.json(bookStats);
    } catch (error) {
        console.error('Error getting book stats:', error);
        res.status(500).json({ error: 'Failed to get book statistics', message: error.message });
    }
});

// Get user activity statistics
app.get('/api/stats/users', async (req, res) => {
    try {
        console.log('=== Getting User Statistics ===');
        
        const reviewsCollection = db.collection('reviews');
        
        // Aggregate reviews by user
        const userStats = await reviewsCollection.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" }
                }
            },
            {
                $project: {
                    userId: "$_id",
                    totalReviews: 1,
                    averageRating: { $round: ["$averageRating", 2] },
                    _id: 0
                }
            },
            { $sort: { totalReviews: -1 } },
            { $limit: 10 }
        ]).toArray();

        console.log('User stats:', userStats);
        res.json(userStats);
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ error: 'Failed to get user statistics', message: error.message });
    }
});

// Get recent activity
app.get('/api/stats/recent', async (req, res) => {
    try {
        console.log('=== Getting Recent Activity ===');
        
        const reviewsCollection = db.collection('reviews');
        
        // Get recent reviews
        const recentReviews = await reviewsCollection
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        const activity = {
            recentReviews: recentReviews.map(review => ({
                bookId: review.bookId,
                userId: review.userId,
                rating: review.rating,
                createdAt: review.createdAt
            })),
            timestamp: new Date().toISOString()
        };

        console.log('Recent activity:', activity);
        res.json(activity);
    } catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({ error: 'Failed to get recent activity', message: error.message });
    }
});

// Start server
async function startServer() {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`Statistics Service running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

startServer().catch(console.error);
