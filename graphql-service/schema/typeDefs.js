const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Custom scalar for Date
  scalar DateTime

  # User type - represents a user in the system
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: DateTime!
    reviews: [Review!]!
    reviewCount: Int!
  }

  # Book type - represents a book in the system  
  type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String
    description: String
    publishedDate: DateTime
    genre: String
    pageCount: Int
    createdAt: DateTime!
    reviews: [Review!]!
    averageRating: Float
    reviewCount: Int!
  }

  # Review type - represents a review of a book by a user
  type Review {
    id: ID!
    rating: Int!
    reviewText: String
    createdAt: DateTime!
    updatedAt: DateTime
    user: User!
    book: Book!
    userId: ID!
    bookId: ID!
  }

  # Statistics type - aggregated data about the system
  type Statistics {
    totalUsers: Int!
    totalBooks: Int!
    totalReviews: Int!
    averageRating: Float!
    timestamp: DateTime!
  }

  # Book statistics - statistics for a specific book
  type BookStats {
    bookId: ID!
    book: Book
    totalReviews: Int!
    averageRating: Float!
  }

  # User statistics - statistics for a specific user
  type UserStats {
    userId: ID!
    user: User
    totalReviews: Int!
    averageRating: Float!
  }

  # Input types for mutations
  input CreateReviewInput {
    bookId: ID!
    rating: Int!
    reviewText: String
  }

  input UpdateReviewInput {
    rating: Int
    reviewText: String
  }

  # Root Query type - all possible queries
  type Query {
    # User queries
    users: [User!]!
    user(id: ID!): User
    userByEmail(email: String!): User

    # Book queries  
    books: [Book!]!
    book(id: ID!): Book
    booksByAuthor(author: String!): [Book!]!
    booksByGenre(genre: String!): [Book!]!

    # Review queries
    reviews: [Review!]!
    review(id: ID!): Review
    reviewsByUser(userId: ID!): [Review!]!
    reviewsByBook(bookId: ID!): [Review!]!
    recentReviews(limit: Int = 10): [Review!]!

    # Statistics queries
    statistics: Statistics!
    bookStatistics: [BookStats!]!
    userStatistics: [UserStats!]!
    bookStats(bookId: ID!): BookStats
    userStats(userId: ID!): UserStats
  }

  # Root Mutation type - all possible mutations
  type Mutation {
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
