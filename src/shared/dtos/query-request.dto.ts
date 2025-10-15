import { Metrics } from "@shared/types/metrics";
import { IsArray, IsDateString, IsNumber, isString, IsString, IsUUID } from "class-validator";

export class QueryRequestDto {

    @IsUUID("4")
    project_id: string

    @IsString()
    name: string

    @IsString()
    coords: string

    @IsDateString()
    dateto: string

    @IsDateString()
    datefrom: string

    @IsNumber()
    aggregation: number

    @IsArray()
    metrics: Metrics[]

}