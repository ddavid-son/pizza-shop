let ctxToppings = document.getElementById("toppings");

const TOPPINGS_COUNT = 5;
const NUMBER_CFG = { count: TOPPINGS_COUNT, min: 0, max: 100 };
const COLORS = {
  red: "rgb(255, 99, 132)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
};

const toppingsData = {
  labels: ["Onions", "Olives", "tomatoes", "parmesan", "mozzarella"],
  datasets: [
    {
      label: "Toppings",
      data: [30, 50, 100, 88, 54],
      backgroundColor: Object.values(COLORS),
      hoverOffset: 10,
    },
  ],
};

export const toppingsConfig = {
  type: "doughnut",
  data: toppingsData,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Customer toppings distribution",
      },
    },
  },
};
export const actions = [
  {
    name: "Randomize",
    handler(chart, data) {
      chart.data.datasets.forEach((dataset) => {
        dataset.data = data;
      });
      chart.update();
    },
  },
  {
    name: "Add Dataset",
    handler(chart) {
      const data = chart.data;
      const newDataset = {
        label: "Dataset " + (data.datasets.length + 1),
        backgroundColor: [],
        data: [],
      };

      for (let i = 0; i < data.labels.length; i++) {
        newDataset.data.push(Utils.numbers({ count: 1, min: 0, max: 100 }));

        const colorIndex = i % Object.keys(Utils.CHART_COLORS).length;
        newDataset.backgroundColor.push(
          Object.values(Utils.CHART_COLORS)[colorIndex]
        );
      }

      chart.data.datasets.push(newDataset);
      chart.update();
    },
  },
  {
    name: "Add Data",
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels.push("data #" + (data.labels.length + 1));

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(0, 100));
        }

        chart.update();
      }
    },
  },
];

export let toppingsChart;
(function createToppingsChart() {
  toppingsChart = new Chart(ctxToppings, toppingsConfig);
})();
