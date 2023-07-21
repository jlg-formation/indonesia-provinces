import "./style.css";
import * as echarts from "echarts";
import * as d3 from "d3";
import { queryData } from "./query";

(async () => {
  const chartDom = document.querySelector<HTMLElement>("div.map");
  if (chartDom === null) {
    throw new Error("Cannot find div.map");
  }
  const myChart = echarts.init(chartDom);
  console.log("myChart: ", myChart);

  myChart.showLoading();

  const response = await fetch("/indonesia.geojson");
  const indonesiaGeoJson = await response.json();
  console.log("indonesiaGeoJson: ", indonesiaGeoJson);

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

  const results = populationJson.results.bindings;
  console.log("results: ", results);

  const popJson = results.map((row: any) => {
    return {
      code: row.code.value,
      surface: +row.surface.value,
      population: +row.population.value,
      label: row.itemLabel.value,
    };
  });
  console.log("popJson: ", popJson);

  const data = popJson.map((row: any) => ({
    name: row.code,
    value: row.population,
  }));

  const projection = d3.geoMercator();

  myChart.hideLoading();

  echarts.registerMap("Indonesia", indonesiaGeoJson);
  const option = {
    title: {
      text: "Indonesia Population Estimates",
      subtext: "Data from wikidata.org",
      sublink: "https://wikidata.org",
      left: "right",
    },
    tooltip: {
      trigger: "item",
      showDelay: 0,
      transitionDuration: 0.2,
    },
    visualMap: {
      left: "right",
      min: 500000,
      max: 38000000,
      inRange: {
        color: [
          "#313695",
          "#4575b4",
          "#74add1",
          "#abd9e9",
          "#e0f3f8",
          "#ffffbf",
          "#fee090",
          "#fdae61",
          "#f46d43",
          "#d73027",
          "#a50026",
        ],
      },
      text: ["High", "Low"],
      calculable: true,
    },
    toolbox: {
      show: true,
      //orient: 'vertical',
      left: "left",
      top: "top",
      feature: {
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {},
      },
    },
    series: [
      {
        name: "Indonesia population",
        type: "map",
        map: "Indonesia",
        zoom: 1.1,
        nameProperty: "shapeISO",
        projection: {
          project: function (point: [number, number]) {
            return projection(point);
          },
          unproject: function (point: [number, number]) {
            if (projection.invert) {
              return projection.invert(point);
            }
            return point;
          },
        },
        emphasis: {
          label: {
            show: true,
          },
        },
        data: data,
      },
    ],
  };

  myChart.setOption(option);
})();
