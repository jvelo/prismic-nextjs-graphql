// Based on: https://github.com/zeit/next.js/blob/canary/examples/with-typescript-graphql/lib/with-apollo.tsx
// Adapted for Prismic

import { NextPage, NextPageContext } from "next";
import React from "react";
import Head from "next/head";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { GraphQLRequest } from "apollo-link";
import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import { ServerError } from "apollo-link-http-common";
import { HttpLink } from "apollo-link-http";
import fetch from "isomorphic-unfetch";

import {
  PRISMIC_ACCESS_TOKEN,
  PRISMIC_GRAPHQL_ENDPOINT,
  prismicClient
} from "./env";

type TApolloClient = ApolloClient<NormalizedCacheObject>;

type InitialProps = {
  apolloClient: TApolloClient;
  apolloState: any;
} & Record<string, any>;

type WithApolloPageContext = {
  apolloClient: TApolloClient;
} & NextPageContext;

let globalApolloClient: TApolloClient;

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 */
export default function withApollo(
  PageComponent: NextPage,
  { ssr = true } = {}
) {
  const WithApollo = ({
    apolloClient,
    apolloState,
    ...pageProps
  }: InitialProps) => {
    const client = apolloClient || initApolloClient(apolloState);
    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== "production") {
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";

    if (displayName === "App") {
      console.warn("This withApollo HOC only works with PageComponents.");
    }

    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx: WithApolloPageContext) => {
      const { AppTree } = ctx;

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApolloClient());

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      // Only on the server:
      if (typeof window === "undefined") {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import("@apollo/react-ssr");
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient
                }}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error("Error while running `getDataFromTree`", error);
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind();
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...pageProps,
        apolloState
      };
    };
  }

  return WithApollo;
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */
function initApolloClient(initialState?: any) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(initialState);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState);
  }

  return globalApolloClient;
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
function createApolloClient(initialState = {}) {
  const ssrMode = typeof window === "undefined";
  const cache = new InMemoryCache().restore(initialState);

  return new ApolloClient({
    ssrMode,
    link: createLink(),
    cache
  });
}

let prismicRef: string | null = null;

const withPrismicRef = setContext((_: GraphQLRequest, prevContext: any) => {
  // If a prismic ref is passed, just use it
  if (prevContext.headers && prevContext.headers["Prismic-ref"]) {
    return prevContext;
  }

  // Otherwise, use the master ref obtained from API
  const headers = () => ({
    headers: {
      "Prismic-ref": prismicRef,
      ...(PRISMIC_ACCESS_TOKEN
        ? { Authorization: `Token ${PRISMIC_ACCESS_TOKEN}` }
        : {})
    }
  });

  if (prismicRef !== null) return headers();

  return prismicClient.getApi().then(api => {
    prismicRef = api.masterRef.ref;
    return headers();
  });
});

const resetPrismicRef = onError(({ networkError }) => {
  if (
    networkError &&
    networkError.name === "ServerError" &&
    (networkError as ServerError).statusCode === 401
  ) {
    prismicRef = null;
  }
});

const prismicLink = withPrismicRef.concat(resetPrismicRef);

function createLink() {
  return prismicLink.concat(
    new HttpLink({
      uri: PRISMIC_GRAPHQL_ENDPOINT,
      credentials: "same-origin",
      fetch,
      useGETForQueries: true
    })
  );
}
