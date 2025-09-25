import { Coords } from "@shared/types/coords";
import { Metrics } from "@shared/types/metrics";
import { IsArray, IsDateString, IsNumber, IsUUID } from "class-validator";

export class QueryRequestDto {

    @IsUUID("4")
    projectId: string

    @IsArray()
    coords: Coords[]

    @IsDateString()
    to: string

    @IsDateString()
    from: string

    @IsNumber()
    aggregation: number

    @IsArray()
    metrics: Metrics[]

    @IsUUID()
    userId: string
}