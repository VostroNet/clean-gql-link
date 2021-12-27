import { ApolloClient, ApolloLink, from, gql, InMemoryCache } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { buildSchema } from 'graphql';
import { generateJDTFromSchema } from "@vostro/graphql-jtd";
import cleanGqlLink from "../src/index";




test("clean object - basic", async() => {
  try {
    const schema = buildSchema(`
      input test1input1 {
        t1i1field1: String
      }
      type test1Result {
        t1rfield1: ID!
        t1rfield2: String!
      }
      type Query {
        test1(arg1: String!, arg2: [test1input1]): test1Result
      }
    `);
    const jtdSchema = generateJDTFromSchema(schema);
    const gqlLink = cleanGqlLink({
      jtdSchema
    });
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      ssrMode: true,
      link: from([gqlLink, new SchemaLink({ schema })])
    });
    const res = await client.query({
      query: gql`
      query testQuery($arg1: String!, $optional: String, $arg2: [test1input1]!) {
        test1(arg1: $arg1, arg2: $arg2, optional: $optional) {
          t1rfield1
          optional
        }
      }`,
      variables: {
        arg1: "Howdy",
        optional: "Like a ghost",
        arg2: [{
          t1i1field1: "Test1", 
        }, {
          t1i1field1: "test2",
          optional: "to be removed"
        }],
      }
    });
    expect(res.data.test1).toBe(null);
    expect(res.error).not.toBeDefined();
  } catch(err) {
    expect(true).toBe(false);
  }
});


test("clean object - function call", async() => {
  try {
    const schema = buildSchema(`
      input test1input1 {
        t1i1field1: String
      }
      type test1Result {
        t1rfield1: ID!
        t1rfield2: String!
      }
      type Query {
        test1(arg1: String!, arg2: [test1input1]): test1Result
      }
    `);
    const gqlLink = cleanGqlLink({
      jtdSchema: async() => {
        return generateJDTFromSchema(schema)
      }
    });
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      ssrMode: true,
      link: from([gqlLink, new SchemaLink({ schema })])
    });
    const res = await client.query({
      query: gql`
      query testQuery($arg1: String!, $optional: String, $arg2: [test1input1]!) {
        test1(arg1: $arg1, arg2: $arg2, optional: $optional) {
          t1rfield1
          optional
        }
      }`,
      variables: {
        arg1: "Howdy",
        optional: "Like a ghost",
        arg2: [{
          t1i1field1: "Test1", 
        }, {
          t1i1field1: "test2",
          optional: "to be removed"
        }],
      }
    });
    expect(res.data.test1).toBe(null);
    expect(res.error).not.toBeDefined();
  } catch(err) {
    expect(true).toBe(false);
  }
});
