import { InternalServerErrorException } from "@nestjs/common";
import { Metrics } from "@shared/types/metrics";
import { SupabaseClient } from "@supabase/supabase-js";

export async function saveMetrics(sp: SupabaseClient, areaId: string, name: Metrics, value: any) {

    try {
        const { error } = await sp.schema('public')
            .from('metrics')
            .insert({
                name: name,
                value: value,
                area_id: areaId
            })

        if (error) throw new InternalServerErrorException("Erro ao salvar as métricas.")
    } catch (err) {
        throw new InternalServerErrorException("Erro ao salvar as métricas.")
    }
}