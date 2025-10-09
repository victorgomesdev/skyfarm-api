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

  let rgb;
  if (ndvi < -0.5) rgb = [0.05, 0.05, 0.05];
  else if (ndvi < -0.2) rgb = [0.75, 0.75, 0.75];
  else if (ndvi < -0.1) rgb = [0.86, 0.86, 0.86];
  else if (ndvi < 0) rgb = [0.92, 0.92, 0.92];
  else if (ndvi < 0.025) rgb = [1, 0.98, 0.8];
  else if (ndvi < 0.05) rgb = [0.93, 0.91, 0.71];
  else if (ndvi < 0.075) rgb = [0.87, 0.85, 0.61];
  else if (ndvi < 0.1) rgb = [0.8, 0.78, 0.51];
  else if (ndvi < 0.125) rgb = [0.74, 0.72, 0.42];
  else if (ndvi < 0.15) rgb = [0.69, 0.76, 0.38];
  else if (ndvi < 0.175) rgb = [0.64, 0.8, 0.35];
  else if (ndvi < 0.2) rgb = [0.57, 0.75, 0.32];
  else if (ndvi < 0.25) rgb = [0.5, 0.7, 0.28];
  else if (ndvi < 0.3) rgb = [0.44, 0.64, 0.25];
  else if (ndvi < 0.35) rgb = [0.38, 0.59, 0.21];
  else if (ndvi < 0.4) rgb = [0.31, 0.54, 0.18];
  else if (ndvi < 0.45) rgb = [0.25, 0.49, 0.14];
  else if (ndvi < 0.5) rgb = [0.19, 0.43, 0.11];
  else if (ndvi < 0.55) rgb = [0.13, 0.38, 0.07];
  else if (ndvi < 0.6) rgb = [0.06, 0.33, 0.04];
  else rgb = [0, 0.27, 0];

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
            "width": 512,
            "height": 512,
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
