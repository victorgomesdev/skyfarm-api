import { CopernicusModule } from "@copernicus/copernicus.module";
import { Module } from "@nestjs/common";
import { CoreController } from "./core.controller";
import { AuthGuard } from "@shared/guards/auth.guard";
import { SupabaseModule } from "@sb/supabase.module";
import { CoreService } from "./core.service";

@Module({
    controllers: [CoreController],
    imports: [CopernicusModule, SupabaseModule],
    providers: [AuthGuard, CoreService]
})
export class CoreModule {}