import "./style.css";
import * as echarts from "echarts";

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
})();
