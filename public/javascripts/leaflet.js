var map = L.map("map").setView([51.505, -0.09], 13);

var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var satellite = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
).addTo(map);

var baseMaps = {
  Luftbild: satellite,
  OpenStreetMap: osm,
};

var layerControl = L.control.layers(baseMaps).addTo(map);

addGeoJSONToMap(
  "https://geodienste.hamburg.de/HH_WFS_Radverkehrsnetz?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=radwege_fahrradstrasse&OUTPUTFORMAT=application/geo%2bjson&srsName=EPSG:4326"
);

/**
 * adds trainings data to map
 * @param {*} url
 */
function addGeoJSONToMap(url) {
  // this requests the file and executes a callback with the parsed result once it is available
  let layerArray = [];
  fetchJSONFile(url, function (data) {
    data.features.forEach((element) => {
      layerArray.push(
        L.geoJSON(element) /*.bindPopup(function (layer) {
            let text =
              "<b>ClassID:</b> " + layer.feature.properties.ClassID + "<br>";
            text += "<b>Label:</b> " + layer.feature.properties.Label;
            return text;
          })*/
      );
    });

    let group = L.layerGroup(layerArray).addTo(map);
    geojsonLayer = layerArray;
    layerControl.addOverlay(group, "Fahrradnetz");
  });
}

/**
 * calls a local json file
 * Quelle: https://stackoverflow.com/questions/14388452/how-do-i-load-a-json-object-from-a-file-with-ajax
 * @param {*} path
 * @param {*} callback
 */

function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}
