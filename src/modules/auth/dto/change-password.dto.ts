import { IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsString({ message: "La contraseña actual debe ser una cadena de texto" })
    @IsNotEmpty({ message: "La contraseña actual es requerida" })
    currentPassword: string;

    @IsString({ message: "La nueva contraseña debe ser una cadena de texto" })
    @IsNotEmpty({ message: "La nueva contraseña es requerida" })
    @MinLength(8, { message: "La nueva contraseña debe tener al menos 8 caracteres" })
    @IsStrongPassword(
        { minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
        { message: "La nueva contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un símbolo" }
    )
    newPassword: string;

    @IsString({ message: "El ID de usuario debe ser una cadena de texto" })
    @IsOptional()
    userId?: string;
}
