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

function evaluatePixel(sample) {
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  const c = [
    [-1.0, 0x654321], // marrom escuro
    [0.0, 0xFFFF00], // amarelo
    [0.5, 0x00FF00], // verde
    [1.0, 0x004400], // verde escuro
  ];

  // Interpolação de cor contínua
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
  for (let i = 0; i < c.length - 1; i++) {
    if (ndvi >= c[i][0] && ndvi <= c[i + 1][0]) {
      rgb = interp(
        ndvi, c[i][0], c[i + 1][0],
        hexToRgb(c[i][1]), hexToRgb(c[i + 1][1])
      );
      break;
    }
  }
  if (!rgb) rgb = hexToRgb(c[c.length - 1][1]);

  return [...rgb, sample.dataMask];
}


`
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
    let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);

    if (isNaN(ndvi) || !isFinite(ndvi)) {
        ndvi = -1;
    }

    return {
        default: [ndvi],
        dataMask: [sample.dataMask]
    };
}
`;

export function ndviBuilder(coords: string, from: string, to: string, aggregation: number) {
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
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": from,
                            "to": to,
                        }
                    },
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
            "bounds": { "geometry": { "type": "Polygon", "coordinates": parsed } },
            "data": [
                {
                    "type": "sentinel-2-l2a"
                }
            ]
        },
        "aggregation": {
            "timeRange": {
                "from": from,
                "to": to
            },
            "aggregationInterval": {
                "of": `P${aggregation}D`
            },
            "evalscript": STAT_EVAL
        },
        "output": [
            {
                "id": "ndviStats",
                "type": "statistical",
                "bands": [{ "band": 0, "statistics": ["min", "max", "mean", "stddev"] }]
            }
        ]
    };


    return { image, stats };
}
