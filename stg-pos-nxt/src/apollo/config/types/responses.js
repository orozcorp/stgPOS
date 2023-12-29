import { gql } from "@apollo/client";

export const responses = gql`
  scalar Date
  type GeneralResponse {
    "Similar to HTTP status code, represents the status of the mutation"
    code: Int!
    "Indicates whether the mutation was successful"
    success: Boolean!
    "Human-readable message for the UI"
    message: String!
    data: String
  }
  type GeneralResponseDataString {
    "Similar to HTTP status code, represents the status of the mutation"
    code: Int!
    "Indicates whether the mutation was successful"
    success: Boolean!
    "Human-readable message for the UI"
    message: String!
    "data as string"
    data: String
  }
  type MessageMassiveResponse {
    "Similar to HTTP status code, represents the status of the mutation for a particular message"
    code: Int
    "Indicates whether the mutation was successful for a particular message"
    success: Boolean
    "Human-readable message for the UI regarding a particular message"
    message: String
    "Index of the message in the messages array"
    index: Int
    "Additional data as a string, if necessary"
    data: String
  }

  type CreateMessageMassiveResponse {
    "Array of responses, one for each message"
    responses: [MessageMassiveResponse]
  }
  input InputSelect {
    value: String
    label: String
    google: Int
    sat: String
  }
  type ResponseFields {
    key: String
    bucket: String
    xAmzAlgorithm: String
    xAmzCredential: String
    xAmzDate: String
    Policy: String
    xAmzSignature: String
  }
  type ResponseSigner {
    url: String
    fields: ResponseFields
  }
  type Mutation {
    "Sign File"
    signFile(key: String!): ResponseSigner!
  }
`;
