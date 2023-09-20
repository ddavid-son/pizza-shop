let ctx = document.getElementById("day-rev");

const DATA_COUNT = 10;
const labels = [];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const day = new Date().getDay();
for (let i = 0; i < DATA_COUNT; i++) {
  labels.push(days[(day + 14 - i) % 7]);
}
const dailyRevData = [350, 300, 400, 180, 260, 220, 400, 290, 340, 455];
const orderCountData = [12, 15, 18, 26, 22, 40, 29, 34, 45, 40];

const data = {
  labels: labels,
  datasets: [
    {
      label: "Daily Sales",
      data: dailyRevData,
      borderColor: "#FF6384",
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 0.4,
      yAxisID: "y1",
    },
    {
      label: "Daily Orders",
      data: orderCountData,
      borderColor: "#5d5fef",
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 0.4,
      yAxisID: "y2",
    },
  ],
};

const config = {
  type: "line",
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Daily Sales-Revenue Report",
      },
    },
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        display: true,
        title: {
          display: true,
        },
      },
      y1: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "sales",
        },
        position: "right",
      },
      y2: {
        suggestedMin: 100,
        suggestedMax: 500,
        grid: {
          display: false,
        },
        display: true,
        title: {
          display: true,
          text: "orders",
        },
        suggestedMin: 10,
        suggestedMax: 50,
      },
    },
  },
};

export let salesChart;
(function createSalesChart() {
  salesChart = new Chart(ctx, config);
})();
