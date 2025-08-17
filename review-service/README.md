# Review Service

Review and Rating Management Microservice for SUA E-Book System

## Overview

The Review Service is a Spring Boot microservice that handles book reviews and ratings. It allows users to create, read, update, and delete reviews and ratings for books in the e-book management system.

## Features

- **Review Management**: Full CRUD operations for book reviews
- **Rating System**: 1-5 star rating system with quick rating option  
- **User Authentication**: JWT-based authentication integrated with user service
- **Book Validation**: Validates book existence via book service integration
- **Loan Verification**: Checks if user has borrowed the book for verified reviews
- **Statistics**: Provides review statistics and rating distributions
- **Role-based Access**: User and admin role differentiation
- **Comprehensive Documentation**: Full OpenAPI/Swagger documentation

## Technology Stack

- **Framework**: Spring Boot 3.1.0
- **Language**: Java 17
- **Database**: MongoDB (dedicated reviewdb database)
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: SpringDoc OpenAPI 3
- **Build Tool**: Maven
- **Containerization**: Docker

## API Endpoints

### Review Operations
- `GET /reviews/book/{bookId}` - Get all reviews for a specific book
- `GET /reviews/user/{userId}` - Get all reviews by a specific user
- `POST /reviews` - Create a new review (rating + text)
- `POST /reviews/book/{bookId}/quick` - Quick rating (rating only)
- `PUT /reviews/{reviewId}` - Update a review
- `PUT /reviews/{reviewId}/rating` - Update only the rating
- `DELETE /reviews/{reviewId}` - Delete a review
- `DELETE /reviews/book/{bookId}` - Delete all reviews for a book (admin only)

### Statistics
- `GET /reviews/book/{bookId}/stats` - Get review statistics for a book

### Health & Info
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with service information

## Service Integration

### Dependencies
- **Book Service** (port 8000): Validates book existence
- **Loan Service** (port 5002): Checks user loan history for verification
- **User Service** (port 5001): Provides JWT authentication

### Database
- **MongoDB Collection**: `reviews` in `reviewdb` database
- **Indexes**: Created on `bookId` and `userId` for performance

## Authentication & Authorization

### JWT Token Requirements
- **Header**: `Authorization: Bearer <jwt_token>`
- **Token Fields**: `sub` (userId), `email`, `role`
- **Roles**: 
  - `user`: Can create/update/delete own reviews
  - `admin`: Can delete any review and all reviews for a book

### Access Control
- Users can only modify their own reviews
- Admins can delete any review
- All endpoints require authentication (except health checks)

## Business Logic

### Review Creation Rules
- One review per user per book
- Rating is mandatory (1-5 stars)
- Review text is optional (max 1000 characters)
- Verified flag set if user has borrowed the book

### Update Rules
- Users can only update their own reviews
- Both rating and text can be updated separately
- Timestamps are automatically updated

### Deletion Rules
- Users can delete their own reviews
- Admins can delete any review
- Admins can delete all reviews for a specific book

## Data Model

### Review Entity
```json
{
  "id": "string",
  "bookId": "string",
  "userId": "string", 
  "rating": 1-5,
  "reviewText": "string (optional)",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "isVerified": boolean
}
```

## Development

### Prerequisites
- Java 17+
- Maven 3.6+
- Docker & Docker Compose
- MongoDB (local or containerized)

### Running Locally

1. **Clone the repository**
```bash
git clone <repository-url>
cd review-service
```

2. **Set environment variables**
```bash
export JWT_SECRET=mysecret
export MONGO_URL=mongodb://localhost:27017/reviewdb
```

3. **Build and run**
```bash
./mvnw clean package
./mvnw spring-boot:run
```

Or using Docker:
```bash
docker build -t review-service .
docker run -p 5003:5003 --env-file .env review-service
```

### Running with Docker Compose
```bash
# From the root project directory
docker-compose up --build
```

## Configuration

### Environment Variables
- `PORT`: Service port (default: 5003)
- `JWT_SECRET`: JWT signing secret (default: mysecret)  
- `MONGO_URL`: MongoDB connection string
- `JAVA_OPTS`: JVM options for containerized deployment

### Application Configuration
See `src/main/resources/application.yml` for detailed configuration options.

## Documentation

### Swagger UI
- **Local**: http://localhost:5003/swagger-ui.html
- **Docker**: http://review-service:5003/swagger-ui.html

### OpenAPI Spec
- **JSON**: http://localhost:5003/v3/api-docs
- **YAML**: Available in `docs/openapi.yaml`

## Testing

### API Testing Examples

**Create a Review:**
```bash
curl -X POST http://localhost:5003/reviews \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "60f7b3b3b3b3b3b3b3b3b3b1",
    "rating": 4,
    "reviewText": "Great book!"
  }'
```

**Quick Rating:**
```bash
curl -X POST http://localhost:5003/reviews/book/60f7b3b3b3b3b3b3b3b3b3b1/quick \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

**Get Book Statistics:**
```bash
curl -X GET http://localhost:5003/reviews/book/60f7b3b3b3b3b3b3b3b3b3b1/stats \
  -H "Authorization: Bearer <jwt_token>"
```

## Error Handling

The service provides comprehensive error handling with appropriate HTTP status codes:
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid/missing JWT token
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate review attempt
- **500 Internal Server Error**: Unexpected server error

## Performance Considerations

- **Database Indexes**: Optimized for bookId and userId queries
- **Connection Pooling**: Configured MongoDB connection pool
- **Memory Management**: JVM tuned for container deployment
- **Caching**: Consider Redis for frequently accessed statistics

## Security

- **JWT Validation**: All endpoints validate JWT tokens
- **Role-based Access**: Proper authorization checks
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: MongoDB queries are parameterized
- **CORS Configuration**: Configurable for different environments

## Monitoring

- **Health Endpoint**: `/health` for service monitoring
- **Actuator**: Spring Boot Actuator endpoints available
- **Logging**: Structured logging with configurable levels
- **Metrics**: Ready for integration with monitoring systems

## Future Enhancements

- **Review Moderation**: Content filtering and moderation
- **Review Helpfulness**: Voting system for helpful reviews
- **Review Analytics**: Advanced statistics and insights
- **Notification Integration**: Notify users about new reviews
- **Search & Filter**: Advanced review search capabilities
- **Pagination**: Implement pagination for large result sets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
