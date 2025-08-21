// --- Variáveis Globais ---
let map, layers = [], activeLayerIndex = null;

// --- Inicialização do Mapa ---
map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// --- Função de Mensagem Flutuante ---
function showMessage(msg, type = 'info', timeout = 3000) {
  const box = document.getElementById('messageBox');
  box.textContent = msg;
  box.classList.remove('hidden');
  box.classList.remove('bg-black', 'bg-red-600', 'bg-green-600');
  box.classList.add(type === 'error' ? 'bg-red-600' : (type === 'success' ? 'bg-green-600' : 'bg-black'));
  setTimeout(() => box.classList.add('hidden'), timeout);
}

// --- Renderização da Lista de Camadas ---
function renderLayerList() {
  const ul = document.getElementById('layerList');
  ul.innerHTML = '';
  layers.forEach((layerObj, idx) => {
    const li = document.createElement('li');
    li.className = `flex items-center justify-between mb-1 px-2 py-1 rounded cursor-pointer ${activeLayerIndex === idx ? 'bg-blue-100' : 'hover:bg-gray-200'}`;
    li.innerHTML = `<span class="truncate" title="${layerObj.name}">${layerObj.name}</span>`;
    li.onclick = () => setActiveLayer(idx);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-2 text-red-600 hover:text-red-800 font-bold';
    removeBtn.textContent = 'Remover';
    removeBtn.onclick = (e) => { e.stopPropagation(); removeLayer(idx); };
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });
  renderStylePreview();
}

// --- Adicionar Camada GeoJSON ---
function addGeoJsonLayer(geojson, name = 'GeoJSON', style = {}) {
  let leafletLayer;
  function styleFunc(feature) {
    const s = feature.properties && feature.properties._style ? feature.properties._style : style;
    return {
      color: s.color || '#3388ff',
      weight: typeof s.weight !== 'undefined' ? s.weight : 3,
  // opacity removido
      fillColor: s.fillColor || '#3388ff',
      fillOpacity: s.fillOpacity || 0.2,
      radius: s.radius || 8
    };
  }
  leafletLayer = L.geoJSON(geojson, {
    style: styleFunc,
    pointToLayer: function(feature, latlng) {
      const s = feature.properties && feature.properties._style ? feature.properties._style : style;
      return L.circleMarker(latlng, styleFunc(feature));
    }
  }).addTo(map);
  layers.push({ name, geojson, leafletLayer, style });
  setActiveLayer(layers.length - 1);
  renderLayerList();
  fitLayerBounds(leafletLayer);
}

// --- Ajustar Mapa para Camada ---
function fitLayerBounds(layer) {
  try {
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds);
  } catch {}
}

// --- Remover Camada ---
function removeLayer(idx) {
  map.removeLayer(layers[idx].leafletLayer);
  layers.splice(idx, 1);
  if (activeLayerIndex === idx) activeLayerIndex = null;
  else if (activeLayerIndex > idx) activeLayerIndex--;
  renderLayerList();
  renderStylePanel();
}

// --- Ativar Camada ---
function setActiveLayer(idx) {
  activeLayerIndex = idx;
  renderLayerList();
  renderStylePanel();
}

// --- Renderizar Painel de Estilo ---
function renderStylePanel() {
  const panel = document.getElementById('stylePanel');
  if (activeLayerIndex === null || layers.length === 0) {
    panel.classList.add('hidden');
    panel.innerHTML = '';
    return;
  }
  panel.classList.remove('hidden');
  const style = layers[activeLayerIndex].style;
  const defaultStyle = {
    color: '#3388ff',
    weight: 3,
  // opacity removido
    fillColor: '#3388ff',
    fillOpacity: 0.2,
    radius: 8
  };
  Object.keys(defaultStyle).forEach(key => {
    if (typeof style[key] === 'undefined') style[key] = defaultStyle[key];
  });
  panel.innerHTML = `
    <h3 class="font-bold mb-2">Estilo do GeoJSON</h3>
  <label class="flex items-center gap-2">Cor da Linha: <input type="color" id="color" value="${style.color || '#3388ff'}" style="width:40px;"> <input type="text" id="colorHex" value="${style.color || '#3388ff'}" maxlength="7" style="width:80px;text-transform:uppercase;"></label>
  <label class="flex items-center gap-2">Espessura: <input type="range" id="weight" min="0" max="10" value="${typeof style.weight !== 'undefined' ? style.weight : 3}" style="width:120px;"> <input type="number" id="weightNum" min="0" max="10" value="${typeof style.weight !== 'undefined' ? style.weight : 3}" style="width:60px;"></label>
  <label class="flex items-center gap-2">Cor do Preenchimento: <input type="color" id="fillColor" value="${style.fillColor || '#3388ff'}" style="width:40px;"> <input type="text" id="fillColorHex" value="${style.fillColor || '#3388ff'}" maxlength="7" style="width:80px;text-transform:uppercase;"></label>
  <label class="flex items-center gap-2">Opacidade do Preenchimento: <input type="range" id="fillOpacity" min="0" max="1" step="0.05" value="${typeof style.fillOpacity !== 'undefined' ? style.fillOpacity : 0.2}" style="width:120px;"> <input type="number" id="fillOpacityNum" min="0" max="1" step="0.05" value="${style.fillOpacity || 0.2}" style="width:60px;"></label>
  <label class="flex items-center gap-2">Raio dos Pontos: <input type="range" id="radius" min="1" max="30" value="${style.radius || 8}" style="width:120px;"> <input type="number" id="radiusNum" min="1" max="30" value="${style.radius || 8}" style="width:60px;"></label>
  `;
  ['color', 'weight', 'fillColor', 'fillOpacity', 'radius'].forEach(attr => {
    panel.querySelector(`#${attr}`).oninput = (e) => {
      style[attr] = attr === 'weight' || attr === 'radius' ? parseInt(e.target.value) : (attr.includes('Opacity') ? parseFloat(e.target.value) : e.target.value);
      // Sincroniza o input numérico
      const numInput = panel.querySelector(`#${attr}Num`);
      if (numInput) numInput.value = style[attr];
      // Sincroniza o campo HEX se for cor
      if (attr === 'color') {
        const hexInput = panel.querySelector('#colorHex');
        if (hexInput) hexInput.value = style[attr];
      }
      if (attr === 'fillColor') {
        const hexInput = panel.querySelector('#fillColorHex');
        if (hexInput) hexInput.value = style[attr];
      }
      updateLayerStyle(activeLayerIndex);
    };
    // Adiciona evento ao input numérico
    const numInput = panel.querySelector(`#${attr}Num`);
    if (numInput) {
      numInput.oninput = (e) => {
        style[attr] = attr === 'weight' || attr === 'radius' ? parseInt(e.target.value) : (attr.includes('Opacity') ? parseFloat(e.target.value) : e.target.value);
        // Sincroniza o slider
        const slider = panel.querySelector(`#${attr}`);
        if (slider) slider.value = style[attr];
        updateLayerStyle(activeLayerIndex);
      };
    }
    // Adiciona evento ao campo HEX
    if (attr === 'color') {
      const hexInput = panel.querySelector('#colorHex');
      if (hexInput) {
        hexInput.oninput = (e) => {
          let val = e.target.value;
          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            style[attr] = val.toUpperCase();
            panel.querySelector('#color').value = style[attr];
            updateLayerStyle(activeLayerIndex);
          }
        };
      }
    }
    if (attr === 'fillColor') {
      const hexInput = panel.querySelector('#fillColorHex');
      if (hexInput) {
        hexInput.oninput = (e) => {
          let val = e.target.value;
          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            style[attr] = val.toUpperCase();
            panel.querySelector('#fillColor').value = style[attr];
            updateLayerStyle(activeLayerIndex);
          }
        };
      }
    }
  });
}

// --- Atualizar Estilo da Camada ---
function updateLayerStyle(idx) {
  const layerObj = layers[idx];
  layerObj.leafletLayer.setStyle(function(feature) {
    feature.properties = feature.properties || {};
    feature.properties._style = layerObj.style;
    return {
  color: typeof layerObj.style.color !== 'undefined' ? layerObj.style.color : '#3388ff',
  weight: typeof layerObj.style.weight !== 'undefined' ? layerObj.style.weight : 3,
  fillColor: typeof layerObj.style.fillColor !== 'undefined' ? layerObj.style.fillColor : '#3388ff',
  fillOpacity: typeof layerObj.style.fillOpacity !== 'undefined' ? layerObj.style.fillOpacity : 0.2,
  radius: typeof layerObj.style.radius !== 'undefined' ? layerObj.style.radius : 8
    };
  });
  layerObj.leafletLayer.eachLayer(function(l) {
    if (l instanceof L.CircleMarker) {
      l.setStyle({
        radius: layerObj.style.radius
      });
    }
  });
  renderStylePreview();
}

// --- Carregar Arquivos ---
document.getElementById('fileInput').addEventListener('change', function(e) {
  Array.from(e.target.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const geojson = JSON.parse(evt.target.result);
        // Se for FeatureCollection, separa cada feature em uma camada
        if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
          geojson.features.forEach((feature, idx) => {
            // Mantém o estilo existente se houver
            let style = {};
            if (feature.properties && feature.properties._style) {
              style = { ...feature.properties._style };
            } else {
              // Se propriedades de estilo estiverem diretamente nas properties
              ['color','weight','fillColor','fillOpacity','radius','stroke','stroke-width'].forEach(k => {
                if (feature.properties && typeof feature.properties[k] !== 'undefined') {
                  style[k] = feature.properties[k];
                }
              });
            }
            addGeoJsonLayer(feature, `${file.name} - feature ${idx+1}`, style);
          });
          showMessage(`Arquivo ${file.name} carregado! (${geojson.features.length} features)`, 'success');
        } else if (geojson.type === 'Feature') {
          let style = {};
          if (geojson.properties && geojson.properties._style) {
            style = { ...geojson.properties._style };
          } else {
            ['color','weight','fillColor','fillOpacity','radius','stroke','stroke-width'].forEach(k => {
              if (geojson.properties && typeof geojson.properties[k] !== 'undefined') {
                style[k] = geojson.properties[k];
              }
            });
          }
          addGeoJsonLayer(geojson, file.name, style);
          showMessage(`Arquivo ${file.name} carregado! (1 feature)`, 'success');
        } else {
          showMessage(`Arquivo ${file.name} não é um GeoJSON válido!`, 'error');
        }
      } catch (err) {
        showMessage(`Erro ao carregar ${file.name}: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  });
  e.target.value = '';
});

// --- Exportar Tudo como GeoJSON ---
document.getElementById('exportGeojson').onclick = function() {
  if (layers.length === 0) return showMessage('Nenhuma camada para exportar!', 'error');
  let fileName = document.getElementById('exportFileName').value.trim();
  if (!fileName) fileName = 'EasyBIMaps';
  fileName += '.geojson';

  const defaultStyle = {
    color: '#3388ff',
    weight: 3,
    fillColor: '#3388ff',
    fillOpacity: 0.2,
    radius: 8
  };
  const allFeatures = layers.flatMap(layerObj => {
    let style = { ...defaultStyle, ...layerObj.style
    };
    style.stroke = style.color;
    style['stroke-width'] = style.weight;

    function addStrokeProps(props) {
      props.stroke = props.color;
      props['stroke-width'] = props.weight;
      return props;
    }

    if (layerObj.geojson.type === 'FeatureCollection') {
      return layerObj.geojson.features.map(f => {
        const featureCopy = JSON.parse(JSON.stringify(f));
        featureCopy.properties = featureCopy.properties || {};
        // Remove propriedades antigas de estilo
        ['_style','color','weight','fillColor','fillOpacity','radius','stroke','stroke-width','opacity'].forEach(k => {
          delete featureCopy.properties[k];
        });
        featureCopy.properties = addStrokeProps({ ...style,
          ...featureCopy.properties
        });
        return featureCopy;
      });
    } else if (layerObj.geojson.type === 'Feature') {
      const featureCopy = JSON.parse(JSON.stringify(layerObj.geojson));
      featureCopy.properties = featureCopy.properties || {};
      // Remove propriedades antigas de estilo
      ['_style','color','weight','fillColor','fillOpacity','radius','stroke','stroke-width','opacity'].forEach(k => {
        delete featureCopy.properties[k];
      });
      featureCopy.properties = addStrokeProps({ ...style,
        ...featureCopy.properties
      });
      return [featureCopy];
    }
    return [];
  });
  const geojsonString = '{\n"type": "FeatureCollection",\n"features": [\n' +
    allFeatures.map(f => JSON.stringify(f)).join(',\n') + '\n]\n}';
  const blob = new Blob([geojsonString], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showMessage('GeoJSON exportado!', 'success');
};

// --- Responsividade ---
function handleResize() {
  const h = window.innerHeight;
  document.getElementById('map').style.height = (h - 32) + 'px';
}
window.addEventListener('resize', handleResize);
handleResize();

// --- Renderizar Visualização de Estilo ---
function renderStylePreview() {
  const preview = document.getElementById('stylePreview');
  if (!preview) return;
  let out = '<div style="font-family:monospace; width:100%;">';
  layers.forEach(layerObj => {
    const style = layerObj.style || {};
    out += `<div style='margin-bottom:1.5em;'>`;
    out += `<div style='font-size:1.1em;font-weight:bold;margin-bottom:0.5em;'>${layerObj.name}</div>`;
    Object.entries(style).forEach(([k, v]) => {
      if ((k === 'color' || k === 'fillColor' || k === 'stroke') && typeof v === 'string' && v.startsWith('#')) {
        out += `<div style='font-weight:bold; margin-left:1em; margin-bottom:0.2em;'>${k}: <span style='font-weight:normal;'>${v}</span> <span style='display:inline-block;width:18px;height:18px;border-radius:4px;border:1px solid #ccc;vertical-align:middle;background:${v};margin-left:6px;'></span></div>`;
      } else {
        out += `<div style='font-weight:bold; margin-left:1em; margin-bottom:0.2em;'>${k}: <span style='font-weight:normal;'>${typeof v === 'string' ? v : v}</span></div>`;
      }
    });
    out += `</div>`;
  });
  out += '</div>';
  preview.innerHTML = out;
  preview.style.fontSize = '1em';
  preview.style.overflowX = 'auto';
  preview.style.maxHeight = 'none';
  preview.style.height = 'auto';
  preview.style.width = '100%';
}

// --- Função para trocar a ordem das camadas ---
function moveLayer(fromIdx, toIdx) {
  if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= layers.length || toIdx >= layers.length) return;
  const [moved] = layers.splice(fromIdx, 1);
  layers.splice(toIdx, 0, moved);
  renderLayerList();
  renderStylePanel();
  layers.forEach(layerObj => {
    map.removeLayer(layerObj.leafletLayer);
    layerObj.leafletLayer.addTo(map);
  });
}

// --- Adiciona drag-and-drop na lista de camadas ---
function enableLayerDragDrop() {
  const ul = document.getElementById('layerList');
  ul.querySelectorAll('li').forEach((li, idx) => {
    li.draggable = true;
    li.ondragstart = (e) => {
      e.dataTransfer.setData('layerIdx', idx);
    };
    li.ondragover = (e) => {
      e.preventDefault();
      li.classList.add('bg-yellow-100');
    };
    li.ondragleave = () => {
      li.classList.remove('bg-yellow-100');
    };
    li.ondrop = (e) => {
      li.classList.remove('bg-yellow-100');
      const fromIdx = parseInt(e.dataTransfer.getData('layerIdx'));
      moveLayer(fromIdx, idx);
    };
  });
}
const originalRenderLayerList = renderLayerList;
renderLayerList = function() {
  originalRenderLayerList();
  enableLayerDragDrop();
};
