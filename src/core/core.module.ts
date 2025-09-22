import { CopernicusModule } from "@copernicus/copernicus.module";
import { Module } from "@nestjs/common";
import { CoreController } from "./core.controller";

@Module({
    controllers: [CoreController],
    imports: [CopernicusModule]
})
export class CoreModule {}