import { IsString } from "class-validator";

export class ProjectDto {

    @IsString({
        message: 'O nome do projeto é obrigatório.'
    })
    name: string
}