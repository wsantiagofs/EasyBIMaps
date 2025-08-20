const initialCoordinates = [-14.235004, -51.92528];
const initialZoom = 4;
const map = L.map("map").setView(initialCoordinates, initialZoom);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let geojsonLayer = null;

let currentGeoJsonStyle = {
  color: "#3388ff",
  weight: 3,
  opacity: 1.0,
  fillColor: "#3388ff",
  fillOpacity: 0.2,
  pointColor: "#ff0000",
  radius: 6,
};

const styleColorInput = document.getElementById("styleColor");
const styleWeightInput = document.getElementById("styleWeight");
const styleOpacityInput = document.getElementById("styleOpacity");
const styleFillColorInput = document.getElementById("styleFillColor");
const styleFillOpacityInput = document.getElementById("styleFillOpacity");
const stylePointColorInput = document.getElementById("stylePointColor");
const styleRadiusInput = document.getElementById("styleRadius");
const applyStyleButton = document.getElementById("applyStyleButton");

const weightValueSpan = document.getElementById("weightValue");
const opacityValueSpan = document.getElementById("opacityValue");
const fillOpacityValueSpan = document.getElementById("fillOpacityValue");
const radiusValueSpan = document.getElementById("radiusValue");

function updateRangeValueSpans() {
  if (weightValueSpan) weightValueSpan.textContent = styleWeightInput.value;
  if (opacityValueSpan) opacityValueSpan.textContent = styleOpacityInput.value;
  if (fillOpacityValueSpan) fillOpacityValueSpan.textContent = styleFillOpacityInput.value;
  if (radiusValueSpan) radiusValueSpan.textContent = styleRadiusInput.value;
}

function initializeStyleControls() {
  styleColorInput.value = currentGeoJsonStyle.color;
  styleWeightInput.value = currentGeoJsonStyle.weight;
  styleOpacityInput.value = currentGeoJsonStyle.opacity;
  styleFillColorInput.value = currentGeoJsonStyle.fillColor;
  styleFillOpacityInput.value = currentGeoJsonStyle.fillOpacity;
  stylePointColorInput.value = currentGeoJsonStyle.pointColor;
  styleRadiusInput.value = currentGeoJsonStyle.radius;
  updateRangeValueSpans();
}

function updateCurrentStyleFromInputs() {
  currentGeoJsonStyle.color = styleColorInput.value;
  currentGeoJsonStyle.weight = parseInt(styleWeightInput.value);
  currentGeoJsonStyle.opacity = parseFloat(styleOpacityInput.value);
  currentGeoJsonStyle.fillColor = styleFillColorInput.value;
  currentGeoJsonStyle.fillOpacity = parseFloat(styleFillOpacityInput.value);
  currentGeoJsonStyle.pointColor = stylePointColorInput.value;
  currentGeoJsonStyle.radius = parseInt(styleRadiusInput.value);
  updateRangeValueSpans();
}

function applyCurrentStyleToGeoJsonLayer() {
  if (geojsonLayer) {
    geojsonLayer.setStyle((feature) => {
      let style = {};
      if (feature.geometry.type === "Point" || feature.geometry.type === "MultiPoint") {
        style = {
          radius: currentGeoJsonStyle.radius,
          fillColor: currentGeoJsonStyle.pointColor,
          color: currentGeoJsonStyle.pointColor,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.7,
        };
      } else {
        style = {
          color: currentGeoJsonStyle.color,
          weight: currentGeoJsonStyle.weight,
          opacity: currentGeoJsonStyle.opacity,
          fillColor: currentGeoJsonStyle.fillColor,
          fillOpacity: currentGeoJsonStyle.fillOpacity,
        };
      }
      if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
        if (currentGeoJsonStyle.fillOpacity === 0) {
          style.fill = false;
        } else {
          style.fill = true;
        }
      }
      if (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString") {
        style.fill = false;
      }
      return style;
    });
  }
}

[
  styleColorInput,
  styleWeightInput,
  styleOpacityInput,
  styleFillColorInput,
  styleFillOpacityInput,
  stylePointColorInput,
  styleRadiusInput,
].forEach((input) => {
  if (input) {
    input.addEventListener("input", () => {
      updateCurrentStyleFromInputs();
    });
  }
});

if (applyStyleButton) {
  applyStyleButton.addEventListener("click", () => {
    updateCurrentStyleFromInputs();
    applyCurrentStyleToGeoJsonLayer();
  });
}

initializeStyleControls();

function addGeoJsonToMap(geojsonData) {
  if (!map) return;

  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  geojsonLayer = L.geoJSON(geojsonData, {
    style: function (feature) {
      let style = {};
      if (feature.geometry.type === "Point" || feature.geometry.type === "MultiPoint") {
        style = {
          radius: currentGeoJsonStyle.radius,
          fillColor: currentGeoJsonStyle.pointColor,
          color: currentGeoJsonStyle.pointColor,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.7,
        };
      } else {
        style = {
          color: currentGeoJsonStyle.color,
          weight: currentGeoJsonStyle.weight,
          opacity: currentGeoJsonStyle.opacity,
          fillColor: currentGeoJsonStyle.fillColor,
          fillOpacity: currentGeoJsonStyle.fillOpacity,
        };
      }
      if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
        if (currentGeoJsonStyle.fillOpacity === 0) style.fill = false;
        else style.fill = true;
      }
      if (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString") {
        style.fill = false;
      }
      return style;
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
      });
    },
    onEachFeature: function (feature, layer) {
      if (feature.properties) {
        let popupContent = "<h4>Propriedades</h4><ul>";
        for (const key in feature.properties) {
          popupContent += `<li><strong>${key}:</strong> ${feature.properties[key]}</li>`;
        }
        popupContent += "</ul>";
        layer.bindPopup(popupContent);
      }
    },
  }).addTo(map);

  if (geojsonLayer && geojsonLayer.getBounds().isValid()) {
    map.fitBounds(geojsonLayer.getBounds());
  }
}

const fileInput = document.getElementById("geojsonFile");
if (fileInput) {
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const geojsonData = JSON.parse(e.target.result);
          console.log("GeoJSON carregado do arquivo:", geojsonData);
          addGeoJsonToMap(geojsonData);
          if (geojsonEditor) {
            geojsonEditor.setValue(JSON.stringify(geojsonData, null, 2));
          }
        } catch (error) {
          console.error("Erro ao processar o arquivo GeoJSON:", error);
          alert("Erro ao carregar o arquivo GeoJSON. Verifique se o arquivo é válido.");
        }
      };
      reader.readAsText(file);
    }
  });
}

const geojsonTextarea = document.getElementById("geojsonTextarea");
let geojsonEditor = null;
if (geojsonTextarea) {
  geojsonEditor = CodeMirror.fromTextArea(geojsonTextarea, {
    mode: "application/json",
    theme: "material-darker",
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 2,
    tabSize: 2,
  });
  geojsonEditor.setValue(
    JSON.stringify(
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Ponto de Exemplo" },
            geometry: { type: "Point", coordinates: [-46.633308, -23.55052] },
          },
        ],
      },
      null,
      2
    )
  );
} else {
  console.error("Elemento textarea para CodeMirror não encontrado.");
}

const renderTextButton = document.getElementById("renderTextButton");
if (renderTextButton && geojsonEditor) {
  renderTextButton.addEventListener("click", function () {
    try {
      const geojsonString = geojsonEditor.getValue();
      if (!geojsonString.trim()) {
        alert("A área de texto GeoJSON está vazia.");
        return;
      }
      const geojsonData = JSON.parse(geojsonString);
      console.log("GeoJSON carregado do texto:", geojsonData);
      addGeoJsonToMap(geojsonData);
    } catch (error) {
      console.error("Erro ao processar o GeoJSON do texto:", error);
      alert("Erro ao processar o GeoJSON do texto. Verifique a sintaxe: " + error.message);
    }
  });
} else {
  if (!renderTextButton) console.error("Botão 'renderTextButton' não encontrado.");
  if (!geojsonEditor) console.error("Editor CodeMirror não inicializado para o botão de renderizar.");
}

const exportGeoJsonButton = document.getElementById("exportGeoJsonButton");
const exportImageButton = document.getElementById("exportImageButton");

function triggerDownload(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

if (exportGeoJsonButton) {
  exportGeoJsonButton.addEventListener("click", () => {
    if (geojsonLayer && Object.keys(geojsonLayer.toGeoJSON().features).length > 0) {
      const geoJsonData = geojsonLayer.toGeoJSON();
      const geoJsonString = JSON.stringify(geoJsonData, null, 2);
      triggerDownload(geoJsonString, "mapa_exportado.geojson", "application/json");
    } else if (geojsonEditor && geojsonEditor.getValue().trim() !== "") {
      try {
        const geojsonStringFromEditor = geojsonEditor.getValue();
        JSON.parse(geojsonStringFromEditor); 
        triggerDownload(geojsonStringFromEditor, "editor_exportado.geojson", "application/json");
      } catch (error) {
        alert("Não há dados GeoJSON válidos na camada do mapa ou no editor para exportar.");
        console.error("Erro ao tentar exportar GeoJSON do editor:", error);
      }
    } else {
      alert("Não há dados GeoJSON na camada do mapa ou no editor para exportar.");
    }
  });
}

if (exportImageButton) {
  exportImageButton.addEventListener("click", () => {
    if (!map) {
      alert("O mapa não foi inicializado.");
      return;
    }

    leafletImage(map, function (err, canvas) {
      if (err) {
        alert("Erro ao exportar o mapa como imagem: " + err.toString());
        console.error(err);
        return;
      }
      const dataUrl = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "mapa_exportado.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
}
