import { InternalServerErrorException } from "@nestjs/common";
import { Metrics } from "@shared/types/metrics";
import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadImage(sp: SupabaseClient, projectId: string, areaId: string, metric: Metrics, imageBuffer: Buffer<ArrayBuffer>): Promise<void> {
    const { error } = await sp
        .storage
        .from('projects')
        .upload(`${projectId}/${areaId}/${metric}.png`, imageBuffer, { contentType: 'image/png', upsert: true })

    if (error) throw new InternalServerErrorException()
}