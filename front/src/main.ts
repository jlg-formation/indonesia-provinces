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
    label: row.label,
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
      formatter: function (params: any) {
        console.log("params: ", params);

        return `
<div class="tooltip">
  <span>${params.data.label}</span>
  <span><b>${params.data.value} hab.</b></span>
</div>        
        `;
      },
    },
    visualMap: {
      left: "left",
      min: 0,
      max: 49000000,
      inRange: {
        color: [
          "hsl(240, 100%, 95%)",
          "hsl(240, 100%, 90%)",
          "hsl(240, 100%, 85%)",
          "hsl(240, 100%, 80%)",
          "hsl(240, 100%, 75%)",
          "hsl(240, 100%, 70%)",
          "hsl(240, 100%, 65%)",
          "hsl(240, 100%, 50%)",
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
            show: false,
          },
        },
        data: data,
      },
    ],
  };

  myChart.setOption(option);
})();
