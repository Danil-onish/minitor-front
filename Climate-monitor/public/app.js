var dataPath = "UsersData/O8A49VliQHYyO52tILuez1JOWes2/readings";
const dataRead = database.ref(dataPath);
var reading;

var dataArr = [];
var filteredArr = [];
var shrinkSize = 40;

var rangeFilter = {
  from: 3600,
  to: 0,
};

const ctx = document.getElementById("myChart");
const tempLabel = document.getElementById("reading-temp");
const humLabel = document.getElementById("reading-hum");
var graph;

var table;

dataRead.on(
  "value",
  (snapshot) => {
    reading = snapshot.val();
    UpdateData();
  },
  (errorObject) => {
    console.log("The read failed: " + errorObject);
  }
);

var graphDateSelect = document.getElementById("date-range-select");
graphDateSelect.addEventListener("change", (e) => {
  switch (e.target.value) {
    case "hour":
      dateQuery(1 * 60 * 60, 0);
      break;

    case "day":
      dateQuery(24 * 60 * 60, 0);
      break;

    case "week":
      dateQuery(7 * 24 * 60 * 60, 0);
      break;

    default:
      dateQuery(2147483647, 0);
      break;
  }
  UpdateData();
});

function dateQuery(from, to) {
  rangeFilter.from = from;
  rangeFilter.to = to;
}

function getAverage(arr) {
  return (arr.reduce((acc, val) => acc + Number(val), 0) / arr.length).toFixed(2);
}

function shrinkArray(arr, maxVals = 40) {
  if (arr.length <= maxVals) return arr;

  let step = Math.round(arr.length / maxVals);
  let resArr = [];

  for (let i = 0; i < arr.length; )
    resArr.push(getAverage(arr.slice(i, (i += step))));

  return resArr;
}

function formatDate(val, rangeFilter) {
  // console.log(val);
  const dt = new Date(val * 1000);
  const hour = String(dt.getHours()).padStart(2, "0"),
    min = String(dt.getMinutes()).padStart(2, "0"),
    sec = String(dt.getSeconds()).padStart(2, "0"),
    day = String(dt.getDate()).padStart(2, "0"),
    month = String(dt.getMonth() + 1).padStart(2, "0");
  if (rangeFilter.from - rangeFilter.to <= 3600) return `${hour}:${min}:${sec}`;
  if (rangeFilter.from - rangeFilter.to <= 3600 * 24) return `${hour}:${min}`;
  else return `(${day}.${month}) ${hour}:${min}`;
}

function UpdateData() {
  dataArr = Object.keys(reading).map((val) => reading[val]);
  filteredArr = dataArr.filter((val) => {
    if (
      val.timestamp >=
        Number(dataArr[dataArr.length - 1].timestamp) - rangeFilter.from &&
      val.timestamp <=
        Number(dataArr[dataArr.length - 1].timestamp) - rangeFilter.to
    )
      return val;
  });

  // console.log(filteredArr, dataArr);

  tempLabel.innerHTML = dataArr[dataArr.length - 1].temperature + "°C";
  humLabel.innerHTML = dataArr[dataArr.length - 1].humidity + "%";

  // console.log(new Date(rangeFilter.from * 1000));
  // console.log(new Date(rangeFilter.to * 1000));
  // console.log(filteredArr.length, dataArr.length);

  var table = document.getElementById("data-table");
  if (table) table.innerHTML = "";

  let thead = document.createElement("thead");
  let tr = document.createElement("tr");
  let th = [
    document.createElement("th"),
    document.createElement("th"),
    document.createElement("th"),
  ];

  th[0].textContent = "Time";
  tr.appendChild(th[0]);
  th[1].textContent = "Temperature °C";
  tr.appendChild(th[1]);
  th[2].textContent = "Humidity %";
  tr.appendChild(th[2]);

  thead.appendChild(tr);
  table.appendChild(thead);

  let tableTemp = [],
    tableHum = [],
    tableTimestamp = [];

  filteredArr.forEach((val) => {
    tableTimestamp.unshift(val.timestamp);
    tableHum.unshift(val.humidity);
    tableTemp.unshift(val.temperature);
  });

  tableTemp = shrinkArray(tableTemp, 100);
  tableHum = shrinkArray(tableHum, 100);
  tableTimestamp = shrinkArray(tableTimestamp, 100);

  tableTimestamp.forEach((val, i) => {
    let row = document.createElement("tr");
    let cells = [
      formatDate(tableTimestamp[i], rangeFilter),
      tableTemp[i],
      tableHum[i],
    ];

    // let cellsTime = shrinkArray(formatDate(val.timestamp, rangeFilter));
    // let cellsTemp = shrinkArray(Number(val.temperature));
    // let cellsHum = shrinkArray(Number(val.humidity));

    cells.forEach((val_in) => {
      cell = document.createElement("td");
      cell.textContent = val_in;
      row.appendChild(cell);
    });
    table.appendChild(row);
  });

  if (graph) graph.destroy();
  graph = new Chart(ctx, {
    type: "line",
    data: {
      labels: shrinkArray(
        filteredArr.map((val) => {
          return Number(val.timestamp);
        }),
        shrinkSize
      ).map((val) => {
        val = Math.round(val);
        return formatDate(val, rangeFilter);
      }),
      datasets: [
        {
          label: "Temperature °C",
          data: shrinkArray(
            filteredArr.map((val) => Number(val.temperature)),
            shrinkSize
          ),
          borderWidth: 1,
          tension: 0.1,
        },
        {
          label: "Humidity %",
          data: shrinkArray(
            filteredArr.map((val) => Number(val.humidity)),
            shrinkSize
          ),
          borderWidth: 1,
          tension: 0.1,
        },
      ],
    },
    options: {
      animation: false,
    },
  });
}
