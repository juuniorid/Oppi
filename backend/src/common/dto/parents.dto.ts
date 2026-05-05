import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ParentDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id!: number;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsOptional()
    @IsString()
    firstName!: string | null;

    @IsOptional()
    @IsString()
    lastName!: string | null;

    @IsOptional()
    @IsString()
    phone!: string | null;

    @IsString()
    @IsNotEmpty()
    role!: string;
}