import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class CoreService {

    constructor(@Inject('SUPABASE_PROVIDER') private sp: SupabaseClient) { }

    async createProject(projectName: string, user_id: string): Promise<void> {

        const { data, error } = await this.sp.schema('public')
            .from('projects')
            .insert({
                name: projectName,
                user_id: user_id
            })

        if (error) throw new BadRequestException()
        return
    }
}