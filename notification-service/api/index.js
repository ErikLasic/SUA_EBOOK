// Vercel Serverless Function for Notifications
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            service: 'notification-service',
            status: 'online',
            message: 'Serverless notification service is running',
            endpoints: [
                'POST /api/notify/review-created',
                'POST /api/notify/first-review', 
                'POST /api/notify/milestone'
            ],
            timestamp: new Date().toISOString()
        });
    }

    return res.status(404).json({ error: 'Not found' });
};
