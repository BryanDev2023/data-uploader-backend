import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Email del usuario que ha olvidado su contraseña',
        example: 'usuario@ejemplo.com',
        type: String,
    })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
    email: string;
}
