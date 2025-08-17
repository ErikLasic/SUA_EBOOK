// Serverless function for milestone notifications (book reaches certain number of reviews)
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
        const { bookId, reviewCount, averageRating, milestone } = req.body;

        if (!bookId || !reviewCount) {
            return res.status(400).json({ 
                error: 'Missing required fields: bookId, reviewCount' 
            });
        }

        console.log('Processing milestone notification:', { bookId, reviewCount, milestone });

        const milestones = [5, 10, 25, 50, 100];
        const reachedMilestone = milestones.includes(reviewCount);

        if (!reachedMilestone && !milestone) {
            return res.status(200).json({
                success: true,
                message: 'No milestone reached',
                reviewCount
            });
        }

        const targetMilestone = milestone || reviewCount;
        
        const notificationMessage = `🎊 Knjiga ${bookId} je dosegla ${targetMilestone} reviews! Povprečna ocena: ${averageRating || 'N/A'}/5`;
        
        const notification = {
            id: `milestone_${Date.now()}`,
            type: 'MILESTONE_REACHED',
            message: notificationMessage,
            data: {
                bookId,
                reviewCount,
                averageRating,
                milestone: targetMilestone
            },
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        console.log('Milestone notification:', notification);

        // In production, you would:
        // - Notify book authors/publishers
        // - Update book popularity metrics
        // - Send notifications to interested users
        
        return res.status(200).json({
            success: true,
            message: 'Milestone notification processed successfully',
            notification
        });

    } catch (error) {
        console.error('Error processing milestone notification:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
