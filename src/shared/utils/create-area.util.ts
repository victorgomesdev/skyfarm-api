import { InternalServerErrorException } from "@nestjs/common";
import { Coords } from "@shared/types/coords";
import { SupabaseClient } from "@supabase/supabase-js";

export async function createArea(sp: SupabaseClient, projectId: string, coords: Coords[], from: string, to: string): Promise<string> {

    const { error, data } = await sp.rpc('create_area', {
        project_id: projectId,
        coords: {
            type: "Polygon",
            coordinates: coords
        },
        dateFrom: from,
        dateTo: to
    });

    if (error) throw new InternalServerErrorException()

    return data as string
}