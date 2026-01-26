import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ConfirmPasswordDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    password: string;
}
