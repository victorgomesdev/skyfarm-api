import { Coords } from "@shared/types/coords";

const IMAGE_EVAL = `
        //VERSION=3
        function setup() {
            return {
                input: ["B04", "B08", "dataMask"],
                output: { 
                    bands: 4,
                    sampleType: "AUTO"
                }
            };
        }

        function evaluatePixel(sample) {
            // Calcular NDVI
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            
            // Tratar valores inválidos
            if (isNaN(ndvi) || !isFinite(ndvi)) {
                ndvi = -1;
            }
            
            // Colorizar baseado nos valores NDVI
            let r, g, b;
            
            if (ndvi < -0.2) {
                // Água/solo nu - Azul
                r = 0.0; g = 0.4; b = 0.8;
            } else if (ndvi < 0.1) {
                // Solo exposto - Marrom
                r = 0.6; g = 0.4; b = 0.2;
            } else if (ndvi < 0.3) {
                // Vegetação esparsa - Amarelo/Verde claro
                r = 0.8; g = 0.8; b = 0.2;
            } else if (ndvi < 0.5) {
                // Vegetação moderada - Verde
                r = 0.4; g = 0.7; b = 0.2;
            } else if (ndvi < 0.7) {
                // Vegetação densa - Verde escuro
                r = 0.2; g = 0.6; b = 0.1;
            } else {
                // Vegetação muito densa - Verde muito escuro
                r = 0.0; g = 0.4; b = 0.0;
            }
            
            return [r, g, b, sample.dataMask];
        }
    `

const STAT_EVAL = ``

export function ndviBuilder(coords: Coords[], from: string, to: string) {

    const image = {
        input: {
            bounds: {
                geometry: {
                    type: 'Polygon',
                    coordinates: coords
                }
            },
            data: [
                {
                    type: 'sentinel-2-l2a',
                    dataFilter: {
                        timeRange: {
                            from: from,
                            to: to
                        },
                        maxCloudCoverage: 20
                    }
                }
            ]
        },
        output: {
            width: 512,
            height: 512,
            responses: [
                {
                    identifier: 'default',
                    format: {
                        type: 'image/png'
                    }
                }
            ]
        },
        evalscript: IMAGE_EVAL
    };

    const stats = {}
    return { image, stats }
}
