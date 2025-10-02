import { CopernicusService } from "@copernicus/copernicus.service";
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Headers } from "@nestjs/common";
import { QueryRequestDto } from "@shared/dtos/query-request.dto";
import { AuthGuard } from "@shared/guards/auth.guard";
import { CoreService } from "./core.service";
import { ProjectDto } from "@shared/dtos/project-dto";

@UseGuards(AuthGuard)
@Controller({
    path: 'api'
})
export class CoreController {

    constructor(private copernicus: CopernicusService, private core: CoreService) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('area/create')
    async createArea(@Body() body: any, ) {
        //return await this.copernicus.processQuery(body)

        console.log(body)
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('project/create')
    async createProject(@Body() body: ProjectDto, @Headers() h: any) {

        return await this.core.createProject(body.name, h['authorization'])
    }

}