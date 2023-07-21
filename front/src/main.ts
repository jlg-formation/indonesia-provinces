import "./style.css";
import * as echarts from "echarts";
import { queryData } from "./query";

(async () => {
  const chartDom = document.querySelector<HTMLElement>("div.map");
  if (chartDom === null) {
    throw new Error("Cannot find div.map");
  }
  const myChart = echarts.init(chartDom);
  console.log("myChart: ", myChart);

  const response = await fetch("/indonesia.geojson");
  const json = await response.json();
  console.log("json: ", json);

  const wikidataRequest = `
  SELECT ?item ?itemLabel ?population ?code ?surface  {
    ?item wdt:P31/wdt:P279* wd:Q5098.
    ?item wdt:P1082 ?population.
    ?item wdt:P300 ?code.
    ?item wdt:P2046 ?surface
    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
  } ORDER BY DESC(?item)
  `;
  console.log("wikidataRequest: ", wikidataRequest);

  const populationJson = await queryData(wikidataRequest);
  console.log("populationJson: ", populationJson);
})();
