import { Module } from '@nestjs/common'
import { CopernicusService } from './copernicus.service'
import { CopernicusAuth } from '@copernicus/copernicus.auth.provider'
import { SupabaseModule } from '@sb/supabase.module'

@Module({
    providers: [CopernicusService, CopernicusAuth],
    exports: [CopernicusService],
    imports: [SupabaseModule]
})
export class CopernicusModule { }