import { CopernicusService } from "@copernicus/copernicus.service";
import { Body, Controller, Post } from "@nestjs/common";
import { QueryRequestDto } from "@shared/dtos/query-request.dto";

@Controller({
    path: 'api'
})
export class CoreController {

    constructor(private copernicus: CopernicusService) {

    }

    @Post('query')
    processQuery(@Body() body: QueryRequestDto) {
        return this.copernicus.processQuery(body)
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