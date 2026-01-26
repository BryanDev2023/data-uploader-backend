import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class SignUpDto {
    @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre completo es requerido' })
    @MaxLength(50, { message: 'El nombre completo no debe exceder los 50 caracteres' })
    fullName: string;

    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    email: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @IsStrongPassword(
        { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
        { message: 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un símbolo' }
    )
    password: string;

    @IsOptional()
    @IsIn(['admin', 'user'], { message: 'El rol debe ser admin o user' })
    role?: 'admin' | 'user';
}
