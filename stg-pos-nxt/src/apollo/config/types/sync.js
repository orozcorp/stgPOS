import { gql } from "@apollo/client";

export const sync = gql`
  type Mutation {
    syncOffline: GeneralResponse
    syncOnline: GeneralResponse
  }
`;
