export async function getData({ query, variables }, refetch = false) {
  try {
    const bodyContent = JSON.stringify({
      query,
      variables,
      refetch,
    });

    const res = await fetch(`/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyContent,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Fetching data failed:", error);
    // Handle the error as needed
    return null; // Or your preferred error handling
  }
}

export async function postData({ query, variables }) {
  try {
    const res = await fetch(`/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) {
      const error = json.errors ? JSON.stringify(json.errors) : res.statusText;
      throw new Error(`GraphQL error: ${error}`);
    }
    return json.data;
  } catch (error) {
    console.error(error);
    throw error; // re-throw the error so it can be caught higher up
  }
}
