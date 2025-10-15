const IMAGE_EVAL = `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B11", "B12", "dataMask"] }],
    output: { id: "default", bands: 4, sampleType: "AUTO" }
  };
}

function evaluatePixel(sample) {
  const ti = (sample.B11 - sample.B12) / (sample.B11 + sample.B12);

  const palette = [
    [-1.0, 0x0000FF], // azul - mais frio
    [0.0,  0xFFFF00], // amarelo - intermediário
    [0.5,  0xFF8000], // laranja - quente
    [1.0,  0xFF0000], // vermelho - muito quente
  ];

  function interp(val, low, high, lowColor, highColor) {
    const f = (val - low) / (high - low);
    return [
      lowColor[0] + f * (highColor[0] - lowColor[0]),
      lowColor[1] + f * (highColor[1] - lowColor[1]),
      lowColor[2] + f * (highColor[2] - lowColor[2])
    ];
  }

  function hexToRgb(hex) {
    return [(hex >> 16 & 255)/255, (hex >> 8 & 255)/255, (hex & 255)/255];
  }

  let rgb;
  for (let i = 0; i < palette.length - 1; i++) {
    if (ti >= palette[i][0] && ti <= palette[i + 1][0]) {
      rgb = interp(
        ti, palette[i][0], palette[i + 1][0],
        hexToRgb(palette[i][1]), hexToRgb(palette[i + 1][1])
      );
      break;
    }
  }
  if (!rgb) rgb = hexToRgb(palette[palette.length - 1][1]);

  return [...rgb, sample.dataMask];
}
`;

const STAT_EVAL = `
//VERSION=3
function setup() {
  return {
    input: ["B11", "B12", "dataMask"],
    output: [
      { id: "default", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1, sampleType: "UINT8" }
    ]
  };
}

function evaluatePixel(sample) {
  let ti = (sample.B11 - sample.B12) / (sample.B11 + sample.B12);

  if (isNaN(ti) || !isFinite(ti)) ti = -1;

  return {
    default: [ti],
    dataMask: [sample.dataMask]
  };
}
`;

export function tempBuilder(coords: string, from: string, to: string, aggregation: number) {
  let parsed = JSON.parse(coords);

  if (!Array.isArray(parsed[0][0])) parsed = [parsed];

  const first = parsed[0][0];
  const last = parsed[0][parsed[0].length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) parsed[0].push([...first]);

  const image = {
    "input": {
      "bounds": { "geometry": { "type": "Polygon", "coordinates": parsed } },
      "data": [
        {
          "type": "sentinel-2-l2a",
          "dataFilter": {
            "timeRange": { "from": from, "to": to }
          }
        }
      ]
    },
    "output": {
      "width": 640,
      "height": 640,
      "responses": [{ "identifier": "default", "format": { "type": "image/png" } }]
    },
    evalscript: IMAGE_EVAL
  };

  const stats = {
    "input": {
      "bounds": { "geometry": { "type": "Polygon", "coordinates": parsed } },
      "data": [{ "type": "sentinel-2-l2a" }]
    },
    "aggregation": {
      "timeRange": { "from": from, "to": to },
      "aggregationInterval": { "of": `P${aggregation}D` },
      "evalscript": STAT_EVAL
    },
    "output": [
      {
        "id": "tempStats",
        "type": "statistical",
        "bands": [{ "band": 0, "statistics": ["min", "max", "mean", "stddev"] }]
      }
    ]
  };

  return { image, stats };
}
