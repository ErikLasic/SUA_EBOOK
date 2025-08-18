const axios = require('axios');

class ApiService {
    constructor() {
        // Service endpoints - adjust based on your environment
        this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5001';
        this.bookServiceUrl = process.env.BOOK_SERVICE_URL || 'http://localhost:8000';
        this.reviewServiceUrl = process.env.REVIEW_SERVICE_URL || 'http://localhost:5003';
        this.statisticsServiceUrl = process.env.STATISTICS_SERVICE_URL || 'https://statistics-service-qjzt.onrender.com';
    }

    // User service calls
    async getUsers() {
        try {
            console.log('🔍 Calling user service at:', `${this.userServiceUrl}/api/users`);
            const response = await axios.get(`${this.userServiceUrl}/api/users`);
            console.log('📊 Raw response data type:', typeof response.data);
            console.log('📊 Raw response data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
            
            // User service returns paginated response with items array
            const result = response.data.items || response.data || [];
            console.log('✅ Returning result type:', typeof result, 'length:', result.length);
            return result;
        } catch (error) {
            console.error('❌ Error fetching users:', error.message);
            return [];
        }
    }

    async getUser(id) {
        try {
            const response = await axios.get(`${this.userServiceUrl}/api/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error.message);
            return null;
        }
    }

    async getUserByEmail(email) {
        try {
            const response = await axios.get(`${this.userServiceUrl}/api/users/lookup?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user by email ${email}:`, error.message);
            return null;
        }
    }

    // Book service calls
    async getBooks() {
        try {
            const response = await axios.get(`${this.bookServiceUrl}/books`);
            return response.data;
        } catch (error) {
            console.error('Error fetching books:', error.message);
            return [];
        }
    }

    async getBook(id) {
        try {
            const response = await axios.get(`${this.bookServiceUrl}/books/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching book ${id}:`, error.message);
            return null;
        }
    }

    async getBooksByAuthor(author) {
        try {
            const response = await axios.get(`${this.bookServiceUrl}/books?author=${encodeURIComponent(author)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching books by author ${author}:`, error.message);
            return [];
        }
    }

    async getBooksByGenre(genre) {
        try {
            const response = await axios.get(`${this.bookServiceUrl}/books?genre=${encodeURIComponent(genre)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching books by genre ${genre}:`, error.message);
            return [];
        }
    }

    // Review service calls
    async getReviews() {
        try {
            const response = await axios.get(`${this.reviewServiceUrl}/reviews`);
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error.message);
            return [];
        }
    }

    async getReview(id) {
        try {
            const response = await axios.get(`${this.reviewServiceUrl}/reviews/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching review ${id}:`, error.message);
            return null;
        }
    }

    async getReviewsByUser(userId) {
        try {
            const response = await axios.get(`${this.reviewServiceUrl}/reviews/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews by user ${userId}:`, error.message);
            // Return empty array instead of crashing
            return [];
        }
    }

    async getReviewsByBook(bookId) {
        try {
            const response = await axios.get(`${this.reviewServiceUrl}/reviews/book/${bookId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews by book ${bookId}:`, error.message);
            return [];
        }
    }

    async createReview(reviewData, token) {
        try {
            const response = await axios.post(`${this.reviewServiceUrl}/reviews`, reviewData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating review:', error.message);
            throw error;
        }
    }

    async updateReview(id, reviewData, token) {
        try {
            const response = await axios.put(`${this.reviewServiceUrl}/reviews/${id}`, reviewData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating review ${id}:`, error.message);
            throw error;
        }
    }

    async deleteReview(id, token) {
        try {
            await axios.delete(`${this.reviewServiceUrl}/reviews/${id}`, {
                headers: {
                    'Authorization': token
                }
            });
            return true;
        } catch (error) {
            console.error(`Error deleting review ${id}:`, error.message);
            return false;
        }
    }

    // Statistics service calls
    async getStatistics() {
        try {
            const response = await axios.get(`${this.statisticsServiceUrl}/api/stats/overview`);
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error.message);
            return {
                totalUsers: 0,
                totalBooks: 0,
                totalReviews: 0,
                averageRating: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    async getBookStatistics() {
        try {
            const response = await axios.get(`${this.statisticsServiceUrl}/api/stats/books`);
            return response.data;
        } catch (error) {
            console.error('Error fetching book statistics:', error.message);
            return [];
        }
    }

    async getUserStatistics() {
        try {
            const response = await axios.get(`${this.statisticsServiceUrl}/api/stats/users`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user statistics:', error.message);
            return [];
        }
    }

    async getRecentReviews(limit = 10) {
        try {
            const response = await axios.get(`${this.statisticsServiceUrl}/api/stats/recent?limit=${limit}`);
            // Statistics service returns {recentReviews: [...]} not direct array
            return response.data.recentReviews || [];
        } catch (error) {
            console.error('Error fetching recent reviews:', error.message);
            return [];
        }
    }
}

module.exports = new ApiService();
