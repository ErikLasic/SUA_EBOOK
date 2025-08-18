const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  """DODATNI tipi (Query NE šteje): Loan, UserGql, BookGql"""
  enum LoanStatus {
    active
    returned
    canceled
  }

  type UserGql {
    id: ID!
    email: String!
    name: String!
    role: String
    status: String
    lastLoginAt: String
  }

  type BookGql {
    id: ID!
    title: String!
    author: String
  }

  type Loan {
    id: ID!
    bookId: ID!
    userId: ID!
    loanDate: String!
    dueDate: String!
    returnDate: String
    status: LoanStatus!
    note: String
    user: UserGql
    book: BookGql
  }

  type Query {
    loan(id: ID!): Loan
    loansByUser(userId: ID!): [Loan!]!
    activeLoans: [Loan!]!
  }

  type Mutation {
    createLoan(userId: ID!, bookId: ID!, dueDate: String!, note: String): Loan!
    returnLoan(id: ID!): Loan!
    cancelLoan(id: ID!): Loan!
  }
`);
