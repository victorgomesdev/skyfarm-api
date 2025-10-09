import { InternalServerErrorException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";

export async function createArea(
    sp: SupabaseClient,
    name: string,
    project_id: string,
    coordinates: string,
    datefrom: string,
    dateto: string
): Promise<any> {

    let coordsArray: number[][] = JSON.parse(coordinates);

    if (
        coordsArray.length > 0 &&
        (coordsArray[0][0] !== coordsArray[coordsArray.length - 1][0] ||
            coordsArray[0][1] !== coordsArray[coordsArray.length - 1][1])
    ) {
        coordsArray.push([...coordsArray[0]]);
    }

    const coords = {
        type: "Polygon",
        coordinates: [coordsArray]
    };

    try {
        const { data, error } = await sp
            .from('areas')
            .insert([
                {
                    name,
                    project_id,
                    coords,
                    datefrom,
                    dateto
                }
            ])
            .select();

        if (error) {
            throw new InternalServerErrorException('Erro ao criar a área');
        }

        return data[0];
    } catch (err) {
        throw new InternalServerErrorException('Erro ao criar a área');
    }
}
