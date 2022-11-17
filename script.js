
am4core.useTheme(am4themes_dataviz);

function am4themes_myTheme(target) {
  if (target instanceof am4charts.LineSeries) {
    target.background.fill = am4core.color("#00A3AD");
  }
}
var w = window.innerWidth;
console.log(w);


/**
 * Create container for charts
 */
var container = am4core.create("chartdiv", am4core.Container);
container.width = am4core.percent(100);
container.height = am4core.percent(100);
// container.layout = "vertical"
if (w>400 && w < 768) {
  container.layout = "vertical";
} else {
  container.layout = "horizontal";
}
window.addEventListener("resize", (e) => {
  console.log(window.innerWidth);
  redimensionar();
});
const redimensionar = () => {
  var w = window.innerWidth;
  console.log(w);
  if (w < 768) {
    container.layout = "vertical";
  } else {
    container.layout = "horizontal";
  }
}

var popChart = container.createChild(am4charts.XYChart);
popChart.marginLeft = 15;
popChart.data = [{}];

var popSubtitle = popChart.titles.create();
popSubtitle.text = "Passa el cursor sobre el gràfic per a verificar la informació";

var popTitle = popChart.titles.create();
popTitle.text = "Població Oliva";
popTitle.fontSize = 20;

popChart.numberFormatter.numberFormat = "#.###,#a";
popChart.numberFormatter.bigNumberPrefixes = [
  { "number": 1, "suffix": "" }
];

popChart.dateFormatter.dateFormat = "yyyy";

var popXAxis = popChart.xAxes.push(new am4charts.DateAxis());
popXAxis.renderer.minGridDistance = 40;

var popYAxis = popChart.yAxes.push(new am4charts.ValueAxis());
popYAxis.renderer.opposite = true;

var popSeriesMale = popChart.series.push(new am4charts.LineSeries());

popSeriesMale.dataFields.dateX = "col3";
popSeriesMale.dataFields.valueY = "col4";
popSeriesMale.propertyFields.strokeDasharray = "dash";
popSeriesMale.propertyFields.fillOpacity = "opacity";
popSeriesMale.stacked = true;
popSeriesMale.strokeWidth = 2;
popSeriesMale.fillOpacity = 0.5;
popSeriesMale.name = "Home";

var popSeriesFemale = popChart.series.push(new am4charts.LineSeries());
popSeriesFemale.dataFields.dateX = "col3";
popSeriesFemale.dataFields.valueY = "col5";
popSeriesFemale.propertyFields.strokeDasharray = "dash";
popSeriesFemale.propertyFields.fillOpacity = "opacity";
popSeriesFemale.stacked = true;
popSeriesFemale.strokeWidth = 2;
popSeriesFemale.fillOpacity = 0.5;
popSeriesFemale.tooltipText = "[bold]Població Oliva en {dateX}[/]\n[font-size: 20]Home: {col4}\nDona: {col5}";
popSeriesFemale.name = "Dona";


// Grafic de punts
popChart.dataSource.url = "un_population.csv";
popChart.dataSource.parser = new am4core.CSVParser();
popChart.dataSource.parser.options.numberFields = ["col4", "col6", "col6"];
popChart.dataSource.adapter.add("parsedData", function (data) {
  am4core.array.each(data, function (item) {
    if (item.col3.getFullYear() == currentYear) {
      item.dash = "3,3";
      item.opacity = 0.3;
    }
  });
  return data;
});

popChart.cursor = new am4charts.XYCursor();
popChart.snapToSeries = popSeriesFemale;
popChart.cursor.events.on("cursorpositionchanged", function (ev) {
  currentYear = popXAxis.positionToDate(popXAxis.toAxisPosition(ev.target.xPosition)).getFullYear().toString();
  updateData();
});

popChart.cursor.events.on("hidden", function (ev) {
  var currentYear = new Date().getFullYear().toString();
  updateData();
});
let ocultar = document.querySelector("g[aria-labelledby='id-39-title']");
ocultar.style.display = "none";
ocultar.classList.add("d-none");

/**
 * Population pyramid chart
 */

var pyramidChart = container.createChild(am4charts.XYChart);
// am4themes_myTheme(pyramidChart);
pyramidChart.numberFormatter.numberFormat = "#.###,#a";
pyramidChart.numberFormatter.bigNumberPrefixes = [
  { "number": 1e+0, "suffix": "" }
];

pyramidChart.dataSource.url = "poblacio.csv";
pyramidChart.dataSource.parser = new am4core.CSVParser();
pyramidChart.dataSource.parser.options.numberFields = ["col5", "col6", "col7"];
pyramidChart.dataSource.events.on("parseended", function (ev) {
  sourceData = ev.target.data;
  ev.target.data = getCurrentData();
});

function getCurrentData() {
  var currentData = [];
  am4core.array.each(sourceData, function (row, i) {
    if (row.col3 == currentYear) {
      currentData.push(row);
    }
  });
  currentData.sort(function (a, b) {
    var a1 = Number(a.col4.replace(/[^0-9]+.*$/, ""));
    var b1 = Number(b.col4.replace(/[^0-9]+.*$/, ""));
    if (a1 > b1) {
      return 1;
    }
    else if (a1 < b1) {
      return -1;
    }
    return 0;
  });
  return currentData;
}

function updateData() {
  var data = getCurrentData();
  if (data.length == 0) {
    return;
  }
  am4core.array.each(pyramidChart.data, function (row, i) {
    if (!data[i]) {
      pyramidChart.data[i].col5 = 0;
      pyramidChart.data[i].col6 = 0;
    }
    else {
      pyramidChart.data[i].col5 = data[i].col5;
      pyramidChart.data[i].col6 = data[i].col6;
    }
  });
  pyramidChart.invalidateRawData();

  // Set title
  pyramidChart.titles.getIndex(0).text = currentYear;
}

// An adapter which filters data for the current year
var currentYear = new Date().getFullYear().toString();
var sourceData = [];

var pyramidXAxisMale = pyramidChart.xAxes.push(new am4charts.ValueAxis());
pyramidXAxisMale.min = 0;
pyramidXAxisMale.max = 1000;

var maleRange = pyramidXAxisMale.axisRanges.create();
maleRange.value = 0;
maleRange.endValue = 1000;
maleRange.label.text = "Homes";
maleRange.label.inside = true;
maleRange.label.valign = "top";
maleRange.label.fontSize = 20;
maleRange.label.fill = pyramidChart.colors.getIndex(0);
var pyramidXAxisFemale = pyramidChart.xAxes.push(new am4charts.ValueAxis());
pyramidXAxisFemale.min = 0;
pyramidXAxisFemale.max = 1000;
pyramidXAxisFemale.renderer.inversed = true;

var maleRange = pyramidXAxisFemale.axisRanges.create();
maleRange.value = 0;
maleRange.endValue = 1000;
maleRange.label.text = "Dones";
maleRange.label.inside = true;
maleRange.label.valign = "top";
maleRange.label.fontSize = 20;
maleRange.label.fill = pyramidChart.colors.getIndex(1);

pyramidChart.bottomAxesContainer.layout = "horizontal";

var pyramidYAxis = pyramidChart.yAxes.push(new am4charts.CategoryAxis());
pyramidYAxis.dataFields.category = "col4";
pyramidYAxis.renderer.minGridDistance = 10;
pyramidYAxis.renderer.grid.template.location = 0;
pyramidYAxis.title.text = "Grups d'edat";
pyramidYAxis.renderer.labels.template.adapter.add("textOutput", function (text, target) {
  if (text == "80-84") {
    text += "";
  }
  return text;
});

var pyramidSeriesMale = pyramidChart.series.push(new am4charts.ColumnSeries());
pyramidSeriesMale.dataFields.categoryY = "col4";
pyramidSeriesMale.dataFields.valueX = "col6";
pyramidSeriesMale.tooltipText = "{valueX}";
pyramidSeriesMale.name = "Homes";
pyramidSeriesMale.xAxis = pyramidXAxisMale;
pyramidSeriesMale.clustered = false;
pyramidSeriesMale.columns.template.tooltipText = "Homes, edad{categoryY}: {valueX} ({valueX.percent.formatNumber('#.0')}%)";


var pyramidSeriesFemale = pyramidChart.series.push(new am4charts.ColumnSeries());
pyramidSeriesFemale.dataFields.categoryY = "col4";
pyramidSeriesFemale.dataFields.valueX = "col5";
pyramidSeriesFemale.tooltipText = "{valueX}";
pyramidSeriesFemale.name = "Dones";
pyramidSeriesFemale.xAxis = pyramidXAxisFemale;
pyramidSeriesFemale.clustered = false;
pyramidSeriesFemale.columns.template.tooltipText = "Dones, edad{categoryY}: {valueX} ({valueX.percent.formatNumber('#.0')}%)";
am4themes_myTheme(pyramidSeriesFemale.fill)
am4themes_myTheme(pyramidSeriesFemale.stroke)
var pyramidTitle = pyramidChart.titles.create();
pyramidTitle.text = currentYear;
pyramidTitle.fontSize = 20;
pyramidTitle.marginBottom = 22;

var note = pyramidChart.tooltipContainer.createChild(am4core.Label);
//legenda
note.text = ""
note.fontSize = 10;
note.valign = "bottom";
note.align = "center";

/**
 * Create population chart
 */
