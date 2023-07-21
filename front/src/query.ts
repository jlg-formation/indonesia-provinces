export const queryData = async (query: string) => {
  const endpoint = `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${encodeURIComponent(
    query
  )}`;
  const response = await fetch(endpoint);
  const json = await response.json();

  return json;
};
