// Serverless function for handling review notifications
const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, bookId, reviewId, rating, isFirstReview } = req.body;

        if (!userId || !bookId || !reviewId) {
            return res.status(400).json({ 
                error: 'Missing required fields: userId, bookId, reviewId' 
            });
        }

        console.log('Processing review notification:', { userId, bookId, reviewId, rating, isFirstReview });

        let notificationMessage = '';
        let notificationType = '';

        if (isFirstReview) {
            notificationMessage = `Čestitamo! Napisali ste svoj prvi review za knjigo ${bookId}. Hvala za prispevek! 🎉`;
            notificationType = 'FIRST_REVIEW';
        } else {
            notificationMessage = `Vaš review za knjigo ${bookId} je bil uspešno objavljen. Ocena: ${rating}/5 ⭐`;
            notificationType = 'REVIEW_CREATED';
        }

        // Simulate notification sending (could integrate with email, SMS, push notification service)
        const notification = {
            id: `notif_${Date.now()}`,
            userId,
            type: notificationType,
            message: notificationMessage,
            data: {
                bookId,
                reviewId,
                rating
            },
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        console.log('Notification sent:', notification);

        // In production, you would:
        // - Store notification in database
        // - Send actual push notification/email
        // - Update user preferences
        
        return res.status(200).json({
            success: true,
            message: 'Notification processed successfully',
            notification
        });

    } catch (error) {
        console.error('Error processing review notification:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
