import { ApolloLink } from "@apollo/client";
import { cleanRequest } from "@vostro/clean-gql";
import { IJtdRoot } from "@vostro/jtd-types";

interface Options {
  jtdSchema: IJtdRoot | (() => Promise<IJtdRoot>)
}

export default function cleanGqlLink(options: Options) {
  async function getJtdSchema() {
    let jtdSchema: IJtdRoot;
    if(typeof options.jtdSchema === "function") {
      jtdSchema = await options.jtdSchema();
    } else {
      jtdSchema = options.jtdSchema;
    }
    return jtdSchema;
  }

  return new ApolloLink((operation, forward) : any => {
    return getJtdSchema().then((jtdSchema) => {
      const {query, variables} = cleanRequest(operation.query, operation.variables, jtdSchema);
      return forward({
        ...operation,
        query,
        variables
      });
    })  
  });
}





