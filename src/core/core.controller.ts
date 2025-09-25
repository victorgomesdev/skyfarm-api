import { CopernicusService } from "@copernicus/copernicus.service";
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { QueryRequestDto } from "@shared/dtos/query-request.dto";
import { AuthGuard } from "@shared/guards/auth.guard";

//@UseGuards(AuthGuard)
@Controller({
    path: 'api'
})
export class CoreController {

    constructor(private copernicus: CopernicusService) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('query')
    async createArea(@Body() body: QueryRequestDto, @Req() req) {
        return await this.copernicus.processQuery(body)
    }

    createProject() {

    }

    addArea() {

    }

    getProjects() {

    }

    getProjectData() {

    }

    getAreas() {

    }

    getAreaData() {

    }
}