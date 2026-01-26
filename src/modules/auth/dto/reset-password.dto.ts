import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token de recuperación de contraseña',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        type: String,
    })
    @IsString({ message: 'El token debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El token es obligatorio' })
    token: string;

    @ApiProperty({
        description: 'Nueva contraseña del usuario',
        example: 'NuevaContraseñaSegura123!',
        type: String,
    })
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    @IsStrongPassword(
        {  minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1  },
        { message: 'La nueva contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un símbolo' }
    )
    newPassword: string;

    @ApiProperty({
        description: 'Confirmación de la nueva contraseña del usuario',
        example: 'NuevaContraseñaSegura123!',
        type: String,
    })
    @IsString({ message: 'La confirmación de la nueva contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La confirmación de la nueva contraseña es obligatoria'
    })
    confirmPassword: string;
}
