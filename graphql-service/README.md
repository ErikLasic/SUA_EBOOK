# SUA eBook GraphQL Service

A GraphQL API service that provides a unified interface to query data from the SUA eBook system.

## Features

- **Unified API**: Single GraphQL endpoint for all data queries
- **Multiple Data Types**: Users, Books, Reviews, and Statistics
- **Complex Queries**: Fetch related data in a single request
- **Custom Scalars**: DateTime scalar for proper date handling
- **Authentication**: JWT token support for mutations
- **Cloud Integration**: Works with existing cloud services

## Schema Overview

### Types
- `User` - User information and related reviews
- `Book` - Book details with reviews and statistics
- `Review` - Review data linking users and books
- `Statistics` - System-wide statistics
- `BookStats` - Per-book statistics
- `UserStats` - Per-user statistics

### Queries
- User queries: `users`, `user(id)`, `userByEmail(email)`
- Book queries: `books`, `book(id)`, `booksByAuthor`, `booksByGenre`
- Review queries: `reviews`, `reviewsByUser`, `reviewsByBook`, `recentReviews`
- Statistics: `statistics`, `bookStatistics`, `userStatistics`

### Mutations
- `createReview` - Create a new review (requires authentication)
- `updateReview` - Update existing review (requires authentication)
- `deleteReview` - Delete review (requires authentication)

## Example Queries

### Get books with their reviews and authors
```graphql
query GetBooksWithReviews {
  books {
    id
    title
    author
    averageRating
    reviewCount
    reviews {
      id
      rating
      reviewText
      createdAt
      user {
        name
        email
      }
    }
  }
}
```

### Get user with their reviews and books
```graphql
query GetUserDetails($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    reviewCount
    reviews {
      id
      rating
      reviewText
      createdAt
      book {
        title
        author
      }
    }
  }
}
```

### Get system statistics
```graphql
query GetStatistics {
  statistics {
    totalUsers
    totalBooks
    totalReviews
    averageRating
    timestamp
  }
  bookStatistics {
    bookId
    totalReviews
    averageRating
    book {
      title
      author
    }
  }
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`

3. Start the service:
```bash
npm start
```

4. Access GraphQL Playground at: `http://localhost:4000/graphql`

## Endpoints

- GraphQL API: `/graphql`
- Health Check: `/health`
- Root: `/`

## Cloud Deployment

Ready for deployment on Render, Vercel, or other cloud platforms with Docker support.
