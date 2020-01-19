import withApollo from "../src/with-apollo";
import { RichText } from "prismic-reactjs";
import { linkResolver } from "../src/links";
import htmlSerializer from "../src/prismic";
import React from "react";
import { NextComponentType, NextPageContext } from "next";
import query from "../queries/page.graphql";
import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { DocumentNode } from "graphql";
import { Page as PrismicPage } from "../src/@types/graphql-schema";

type ApolloPageContext = NextPageContext & {
  apolloClient: ApolloClient<NormalizedCacheObject>;
};
export type NextPrismicPage<P, IP = P> = NextComponentType<
  ApolloPageContext,
  IP,
  P
>;

type Props = {
  page: PrismicPage;
};

const Page: NextPrismicPage<Props> = ({ page }) => {
  return (
    page && (
      <>
        <RichText
          render={page.title}
          linkResolver={linkResolver}
          htmlSerializer={htmlSerializer}
        />

        <RichText
          render={page.content}
          linkResolver={linkResolver}
          htmlSerializer={htmlSerializer}
        />

        <footer>
          The prismic repository associated with this project is:
          <code>{process.env.PRISMIC_REPOSITORY}</code>
        </footer>
      </>
    )
  );
};

function loadQuery<P>(
  query: DocumentNode
): (ctx: ApolloPageContext) => Promise<P> {
  return async function(ctx: ApolloPageContext) {
    const { slug } = ctx.query;
    const apollo = ctx.apolloClient;

    const { data } = await apollo.query({
      query,
      variables: { slug }
    });

    return Promise.resolve(data as P);
  };
}

Page.getInitialProps = loadQuery<{ page: PrismicPage }>(query);

export default withApollo(Page);
