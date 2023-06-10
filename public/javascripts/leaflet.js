function getposition() {
  if ("geolocation" in navigator) {
    // Geolocation wird unterstützt
    navigator.geolocation.getCurrentPosition(function (position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      map.setView([latitude, longitude], 16);
      console.log("Latitude: " + latitude + ", Longitude: " + longitude);
    });
  } else {
    // Geolocation wird nicht unterstützt
    console.log("Geolocation wird nicht unterstützt.");
  }
}

var map = L.map("map").setView([53.55, 9.992], 12);

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
  "https://geodienste.hamburg.de/HH_WFS_Radverkehrsnetz?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=radwege_fahrradstrasse&OUTPUTFORMAT=application/geo%2bjson&srsName=EPSG:4326",
  "Fahrradnetz",
  {
    style: {
      color: "#b80aa1",
      weight: 3,
    },
  }
);
addGeoJSONToMap("NICHT_OEFFNEN.json", "Verkehrsnetz", {
  style: {
    color: "blue",
    weight: 1,
    opacity: 0.5,
  },
});
addGeoJSONToMap(
  "https://geodienste.hamburg.de/HH_WFS_Radverkehrsnetz?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=de.hh.up:radwege_streifen&OUTPUTFORMAT=application/geo%2bjson&srsName=EPSG:4326",
  "Fahrradwegstreifen",
  {
    style: {
      color: "#0288da",
      weight: 2,
    },
  }
);
addGeoJSONToMap(
  "https://geodienste.hamburg.de/HH_WFS_Radverkehrsnetz?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=de.hh.up:radwege_radweg&OUTPUTFORMAT=application/geo%2bjson&srsName=EPSG:4326",
  "Fahrradwegstreifen",
  {
    style: {
      color: "#c79a4a",
      weight: 2,
    },
  }
);

/*saveJSONToFile(
  "https://geodienste.hamburg.de/HH_WFS_Stadtradeln?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&typename=de.hh.up:stadtradeln2018,de.hh.up:stadtradeln2019,de.hh.up:stadtradeln2020",
  "Alle",
  {
    style: {
      color: "orange",
      weight: 2,
    },
  }
);
*/

/**
 * adds trainings data to map
 * @param {*} url
 */
https: function addGeoJSONToMap(url, name, style) {
  // this requests the file and executes a callback with the parsed result once it is available
  let layerArray = [];
  fetchJSONFile(url, function (data) {
    // JSON in Datei speichern
    //saveJSONToFile(data, "output.json");
    data.features.forEach((element) => {
      layerArray.push(
        L.geoJSON(element, style).bindPopup(function (layer) {
          let text =
            "<b>Straßenname:</b> " +
            layer.feature.properties.strassenname +
            "<br>";
          text += "<b>Breite:</b> " + layer.feature.properties.breite + "m";
          return text;
        })
      );
    });

    let group = L.layerGroup(layerArray).addTo(map);
    geojsonLayer = layerArray;
    layerControl.addOverlay(group, name);
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

function saveJSONToFile(data, filename) {
  const jsonData = JSON.stringify(data);

  // Erzeuge einen Blob mit dem JSON-Daten
  const blob = new Blob([jsonData], { type: "application/json" });

  // Erzeuge eine URL für den Blob
  const url = URL.createObjectURL(blob);

  // Erzeuge einen Link
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Füge den Link zum Dokument hinzu und klicke ihn an
  document.body.appendChild(link);
  link.click();

  // Entferne den Link vom Dokument
  document.body.removeChild(link);

  // Entferne die URL des Blobs
  URL.revokeObjectURL(url);
}
