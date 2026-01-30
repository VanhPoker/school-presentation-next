// GraphQL Client configuration
const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL ||
  "https://api-dev.gkebooks.click/v1/graphql";
const HASURA_ADMIN_SECRET = import.meta.env.VITE_HASURA_ADMIN_SECRET;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (HASURA_ADMIN_SECRET) {
    headers["x-hasura-admin-secret"] = HASURA_ADMIN_SECRET;
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL Error");
  }

  if (!result.data) {
    throw new Error("No data returned");
  }

  return result.data;
}
