var dataPath = "UsersData/O8A49VliQHYyO52tILuez1JOWes2/readings";
const dataRead = database.ref(dataPath);
var reading;

var dataArr = [];

const ctx = document.getElementById("myChart");
const tempLabel = document.getElementById("reading-temp");
const humLabel = document.getElementById("reading-hum");
var graph;

// const arrq = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function filterData(arr, start = 0, end = arr.length - 1, maxVals = 30) {
  let arrSliced = arr.slice(start, end + 1);
  if (arr.length <= maxVals) return arrSliced;
  let averageAcc = 0;
  let resArr = [];
  let avIndex = 0;
  const averageVal = Math.round(arrSliced.length / maxVals);
  for (let i = 0; i < arrSliced.length; i++) {
    avIndex++;
    if (avIndex === averageVal) {
      resArr = [...resArr, (averageAcc + arrSliced[i]) / avIndex];
      avIndex = 0;
      averageAcc = 0;
    } else averageAcc += arrSliced[i];
  }
  if (avIndex > 0) resArr = [...resArr, averageAcc / avIndex];
  return resArr;
}

dataRead.on(
  "value",
  (snapshot) => {
    reading = snapshot.val();
    dataArr = Object.keys(reading).map((val) => reading[val]);

    tempLabel.innerHTML = dataArr[dataArr.length - 1].temperature;
    humLabel.innerHTML = dataArr[dataArr.length - 1].humidity;

    if (graph) graph.destroy();
    graph = new Chart(ctx, {
      type: "line",
      data: {
        labels: filterData(
          dataArr.map((val) => {
            return Number(val.timestamp);
          })
        )
          .map((val) => Math.round(val))
          .map((val) => {
            const dt = new Date(val * 1000);
            return `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`;
          }),
        datasets: [
          {
            label: "Temperature °C",
            data: filterData(dataArr.map((val) => Number(val.temperature))),
            borderWidth: 1,
            tension: 0.1,
          },
          {
            label: "Humidity %",
            data: filterData(dataArr.map((val) => Number(val.humidity))),
            borderWidth: 1,
            tension: 0.1,
          },
        ],
      },
    });
  },
  (errorObject) => {
    console.log("The read failed: " + errorObject);
  }
);
