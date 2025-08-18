const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  """DODATNI tipi (Query NE šteje): User, Profile, UserStats"""
  type Profile {
    nickname: String
    website: String
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: String
    status: String
    lastLoginAt: String
    profile: Profile
  }

  type UserStats {
    total: Int!
    active: Int!
    inactive: Int!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    usersByStatus(status: String!): [User!]!
    userStats: UserStats!
  }

  type Mutation {
    updateUserStatus(id: ID!, status: String!): User!
  }
`);
