import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          // Al menos 6 caracteres
          if (value.length < 6) {
            return false;
          }

          // Al menos un número
          if (!/\d/.test(value)) {
            return false;
          }

          // Al menos un carácter especial
          if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage() {
          return 'La contraseña debe tener al menos 6 caracteres, incluir al menos un número y un carácter especial';
        },
      },
    });
  };
}
