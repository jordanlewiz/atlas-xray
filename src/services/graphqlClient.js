// src/services/graphqlClient.js

/**
 * Fetches data from a GraphQL endpoint.
 * @param {string} endpoint - The GraphQL endpoint URL.
 * @param {string} query - The GraphQL query string.
 * @param {object} variables - The variables for the query.
 * @param {string} cookie - The cookie string for authentication/session.
 * @param {object} [headers={}] - Optional additional headers.
 * @returns {Promise<object>} - The data from the GraphQL response.
 */
export async function fetchGraphQL(endpoint, query, variables = {}, cookie = '', headers = {}) {
  const defaultHeaders = {
    "content-type": "application/json",
    "cookie": cookie,
    "origin": "https://home.atlassian.com",
    "referer": "https://home.atlassian.com/",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  };
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }
    return result.data;
  } catch (error) {
    console.error('GraphQL fetch error:', error);
    throw error;
  }
}
