const IMAGE_EVAL = `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: {
      id: "default",
      bands: 4,
      sampleType: "AUTO"
    }
  };
}

// Cálculo aproximado de LAI (Leaf Area Index) baseado no NDVI
function evaluatePixel(sample) {
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  let lai = 3.618 * Math.exp(6.118 * ndvi) - 1; // Relação empírica

  if (isNaN(lai) || !isFinite(lai)) lai = 0;
  lai = Math.max(0, Math.min(lai, 10)); // limitar para 0–10

  // Escala de cores para o LAI (de marrom seco até verde escuro)
  let rgb;
  if (lai < 0.5) rgb = [0.7, 0.5, 0.3];
  else if (lai < 1) rgb = [0.8, 0.7, 0.4];
  else if (lai < 2) rgb = [0.6, 0.8, 0.3];
  else if (lai < 3) rgb = [0.4, 0.75, 0.25];
  else if (lai < 5) rgb = [0.2, 0.6, 0.2];
  else rgb = [0.1, 0.4, 0.1];

  return [...rgb, sample.dataMask];
}
`;

const STAT_EVAL = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: [
      { id: "default", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1, sampleType: "UINT8" }
    ]
  };
}

function evaluatePixel(sample) {
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  let lai = 3.618 * Math.exp(6.118 * ndvi) - 1;

  if (isNaN(lai) || !isFinite(lai)) lai = 0;
  lai = Math.max(0, Math.min(lai, 10));

  return {
    default: [lai],
    dataMask: [sample.dataMask]
  };
}
`;

export function laiBuilder(coords: string, from: string, to: string, aggregation: number) {
  let parsed = JSON.parse(coords);

  if (!Array.isArray(parsed[0][0])) parsed = [parsed];

  const first = parsed[0][0];
  const last = parsed[0][parsed[0].length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) parsed[0].push([...first]);

  const image = {
    "input": {
      "bounds": { "geometry": { "type": 'Polygon', "coordinates": parsed } },
      "data": [
        {
          "type": 'sentinel-2-l2a',
          "dataFilter": {
            "timeRange": {
              "from": from,
              "to": to
            }
          }
        }
      ]
    },
    "output": {
      "width": 640,
      "height": 640,
      "responses": [{ "identifier": 'default', "format": { "type": 'image/png' } }]
    },
    evalscript: IMAGE_EVAL
  };

  const stats = {
    "input": {
      "bounds": { "geometry": { "type": 'Polygon', "coordinates": parsed } },
      "data": [{ "type": 'sentinel-2-l2a' }]
    },
    "aggregation": {
      "timeRange": {
        "from": from,
        "to": to
      },
      "aggregationInterval": { "of": `P${aggregation}D` },
      "evalscript": STAT_EVAL
    },
    "output": [
      {
        "id": 'laiStats',
        "type": 'statistical',
        "bands": [{ "band": 0, "statistics": ['min', 'max', 'mean', 'stddev'] }]
      }
    ]
  };

  return { image, stats };
}
