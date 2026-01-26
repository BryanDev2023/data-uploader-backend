import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class UserPreferencesDto {
    @IsOptional()
    @IsString({ message: 'El tema debe ser una cadena de texto' })
    @IsEnum(['system', 'light', 'dark'], { message: 'El tema debe ser system, light o dark' })
    theme?: "system" | "light" | "dark";
}

export class CreateUserDto {
    @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre completo es requerido' })
    fullName: string;

    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    email: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;

    @IsOptional()
    @IsObject({ message: 'Las preferencias deben ser un objeto válido' })
    preferences?: UserPreferencesDto;
}
