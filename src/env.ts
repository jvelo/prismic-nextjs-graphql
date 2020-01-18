import Prismic from "prismic-javascript";

export const PRISMIC_REPOSITORY = process.env.PRISMIC_REPOSITORY;
export const PRISMIC_REPOSITORY_URL = process.env.PRISMIC_REPOSITORY_URL || `https://${PRISMIC_REPOSITORY}.prismic.io`;

export const PRISMIC_API_ENDPOINT = `${PRISMIC_REPOSITORY_URL}/api/v2`;
export const PRISMIC_GRAPHQL_ENDPOINT = `${PRISMIC_REPOSITORY_URL}/graphql`;

export const PRISMIC_ACCESS_TOKEN: string | null = process.env.PRISMIC_TOKEN || null;

export const prismicClient = Prismic.client(PRISMIC_API_ENDPOINT, {
    ...(PRISMIC_ACCESS_TOKEN ? {accessToken: PRISMIC_ACCESS_TOKEN} : {})
});
