import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Helper to get the cookie header for a given URL using the Chrome extension API
async function cookieHeaderFor(url) {
  return new Promise((resolve, reject) => {
    if (!chrome.cookies) {
      resolve("");
      return;
    }
    chrome.cookies.getAll({ url }, (cookies) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      resolve(cookieHeader);
    });
  });
}

// Custom fetch to inject all required headers
const customFetch = async (uri, options) => {
  const cookie = await cookieHeaderFor("https://home.atlassian.com");
  return fetch(uri, {
    ...options,
    headers: {
      ...options.headers,
      "content-type": "application/json",
      "cookie": cookie,
      "origin": "https://home.atlassian.com",
      "referer": "https://home.atlassian.com/",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Atl-Client-Name": "townsquare-frontend",
      "Atl-Client-Version": "6c7228"
    }
  });
};

const httpLink = new HttpLink({
  uri: "https://home.atlassian.com/gateway/api/townsquare/s/2b2b6771-c929-476f-8b6f-ca6ebcace8a2/graphql",
  fetch: customFetch
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

// Expose the client globally for Apollo DevTools
window.__APOLLO_CLIENT__ = client;

export const apolloClient = client;
