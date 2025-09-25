import { CopernicusModule } from "@copernicus/copernicus.module";
import { Module } from "@nestjs/common";
import { CoreController } from "./core.controller";
import { AuthGuard } from "@shared/guards/auth.guard";

@Module({
    controllers: [CoreController],
    imports: [CopernicusModule],
    providers: [AuthGuard]
})
export class CoreModule {}