import { CopernicusService } from "@copernicus/copernicus.service";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { QueryRequestDto } from "@shared/dtos/query-request.dto";

@Controller({
    path: 'api'
})
export class CoreController {

    constructor(private copernicus: CopernicusService) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('query')
    async processQuery(@Body() body: QueryRequestDto) {
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