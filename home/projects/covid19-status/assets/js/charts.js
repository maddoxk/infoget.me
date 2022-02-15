var CurrentCountry = {}

const WWD_URL = 'https://disease.sh/v3/covid-19/historical/all?lastdays=all';
var casesLabels = [];
var casesData = [];
var deathsData = [];
var wwnc = {};
async function getWWD() { //Get Worldwide Data
    const response = await fetch(WWD_URL);
    const fullData = await response.json();
    const newCases = fullData.cases;
    const deaths = fullData.deaths;
    for (var property in newCases) {
        casesData.push(newCases[property]);
        casesLabels.push(property);
    }
    for (var property in deaths) {
        deathsData.push(deaths[property]);
    }

}
console.log(casesLabels, casesData, deathsData)
createWWDChart();
async function createWWDChart() {
    await getWWD();
    const ctx = document.getElementById('wwnc').getContext('2d');
    const config = {
        type: 'line',
        data: {
            labels: casesLabels,
            datasets: [{
                label: 'Worldwide Cases',
                data: casesData,
                backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 0.2)'],
                borderWidth: 1
            },
            {
                label: "Worldwide Deaths",
                data: deathsData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 0.2)'
            }]
        },
        options: {
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
    wwnc = new Chart(ctx, config);
}

var cdc = {}
var cdc2 = {}
createBCChart();

var fullData = {}
var newCases = fullData.cases;
var deaths = fullData.deaths;
async function getData() {
    const CountriesLookupURL = 'https://disease.sh/v3/covid-19/countries/'
    const response = await fetch(CountriesLookupURL);
    fullData = await response.json();
    console.log(fullData)
}

function getSelection() {
    var selection = document.getElementById("countries");
    var selected = selection.options[selection.selectedIndex].value;
    return selected;
}

function getDataByCountry(country) {
    for (var object in fullData) {
        if (fullData[object].country == country) {
            return fullData[object]
        }
    }
}

function handleUpdate() {
    CurrentCountry = getSelection();
    var data = getDataByCountry(CurrentCountry);
    updateRawData();
}

function updateChartData() {
    if (document.getElementById("countries").value == "1") {
        return;
    }

    const data = cdc.data;
    if (data.datasets.length > 0) {
        newLabels = data.labels;
        newLabels.push(CurrentCountry);
        data.labels = newLabels;
    }

    //Now we find the label that == the CurrentCountry, and add the cases and deaths to it.
    data.datasets[0].data.push(getDataByCountry(CurrentCountry).cases);
    data.datasets[1].data.push(getDataByCountry(CurrentCountry).deaths);
    cdc.update();

    //Now we do the same thing for the second chart.
    const data2 = cdc2.data;
    if (data2.datasets.length > 0) {
        newLabels = data2.labels;
        newLabels.push(CurrentCountry);
        data2.labels = newLabels;
    }

    //Now we find the label that == the CurrentCountry, and add the cases and deaths to it.
    data2.datasets[0].data.push(getDataByCountry(CurrentCountry).cases);
    data2.datasets[1].data.push(getDataByCountry(CurrentCountry).deaths);
    cdc2.update();

}

function updateRawData() {

    var title = document.getElementById("countryhead");
    var data = getDataByCountry(CurrentCountry);
    var population = document.getElementById("population");
    var active = document.getElementById("active");
    var cases = document.getElementById("cases");
    var critical = document.getElementById("critical");
    var recovered = document.getElementById("recovered");
    var deaths = document.getElementById("deaths");
    var updated = document.getElementById("updated");
    var flag = document.getElementById("flag");

    title.innerHTML = data.country;
    flag.src = data.countryInfo.flag;
    population.innerHTML = "Population   | " + data.population;
    active.innerHTML = "Active       | " + data.active;
    cases.innerHTML = "Cases        | " + data.cases;
    critical.innerHTML = "Critical     | " + data.critical;
    recovered.innerHTML = "Recovered    | " + data.recovered;
    deaths.innerHTML = "Deaths       | " + data.deaths;
    updated.innerHTML = "Last Updated | " + new Date(data.updated).toLocaleString();
}




function addData() {
    var label = CurrentCountry.country;
    var casesData = getDataByCountry(CurrentCountry).cases;
    var deathsData = getDataByCountry(CurrentCountry).deaths;

    cdc.data.labels.push(label);
    cdc.datasets.forEach((dataset) => {
        if (dataset.label == "Cases") {
            dataset.data.push(casesData);
        } else if (dataset.label == "Deaths") {
            dataset.data.push(deathsData);
        }
    });
    cdc.update();
}

function removeData(chart) {
    cdc.data.labels.pop();
    cdc.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    cdc.update();

    cdc2.data.labels.pop();
    cdc2.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    }
    );
    cdc2.update();
}


function addLabel() {
    CurrentCountry = getSelection();
    console.log(CurrentCountry);
    cdc.data.labels.push(CurrentCountry.country);
    cdc.update();
}

function changeChartType() {
    var x = document.getElementById("container2");
    var y = document.getElementById("container3");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none";
    } else {
        x.style.display = "none";
        y.style.display = "block";
    }    
}

async function createBCChart() {
    await getData();
    const colorGradient = new Gradient();
    const colors = colorGradient
        .setGradient("e9446a", "#3F2CAF")
        .setMidpoint(10)
        .getArray();
    console.log(colors)
    const ctx = document.getElementById('cdc').getContext('2d');
    const config = {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: 'Cases',
                data: newCases,
                backgroundColor: colors,
            },
            {
                label: "Deaths",
                data: deaths,
                backgroundColor: colors
            }],
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Data by Country (Inner Circle = Deaths, Outer Circle = Cases)'
                }
            }
        }
    };
    cdc = new Chart(ctx, config);

    // Bar chart
    const ctx2 = document.getElementById('cdc2').getContext('2d');
    const config2 = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Cases',
                data: newCases,
                backgroundColor: colors,
            },
            {
                label: "Deaths",
                data: deaths,
                backgroundColor: colors
            }],
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Data by Country (Inner Circle = Deaths, Outer Circle = Cases)'
                }
            }
        }
    };
    cdc2 = new Chart(ctx2, config2);

}