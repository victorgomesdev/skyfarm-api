import { InternalServerErrorException } from "@nestjs/common";
import { Metrics } from "@shared/types/metrics";
import { SupabaseClient } from "@supabase/supabase-js";

export async function saveMetrics(sp: SupabaseClient, areaId: string, metric: Metrics, value: any) {

    const { error } = await sp.schema('public')
        .from('metrics')
        .update({
            [metric]: value
        }).eq("area_id", areaId)

    if (error) throw new InternalServerErrorException()
}