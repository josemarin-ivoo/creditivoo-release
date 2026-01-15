import * as yup from 'yup';
import {validateEmail} from './emailValidation';

export const loginSchema = yup.object().shape({
  username: yup
    .string()
    .email('El email no es válido')
    .required('El correo electrónico es obligatorio'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(20, 'La contraseña debe tener menos de 20 caracteres'),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  lastname: yup
    .string()
    .required('El apellido es obligatorio')
    .min(3, 'El apellido debe tener al menos 3 caracteres'),
  document: yup.string().required('La cédula de identidad es obligatoria'),
  email: yup
    .string()
    .required('El email es obligatorio')
    .test(
      'email-format',
      'El formato del email no es válido',
      function (value) {
        if (!value) {
          return false;
        }
        const validation = validateEmail(value, true);
        if (!validation.isValid && validation.error) {
          return this.createError({message: validation.error});
        }
        return validation.isValid;
      },
    )
    .transform(value => (value ? value.trim() : value)),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /[A-Z]/,
      'La contraseña debe contener al menos una letra mayúscula',
    )
    .matches(
      /[a-z]/,
      'La contraseña debe contener al menos una letra minúscula',
    )
    .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
    .matches(
      /[!@#$%^&*()_+{}[\]:;?]/,
      'La contraseña debe contener al menos un carácter especial',
    ),
  confirmPassword: yup
    .string()
    .required('La confirmación de la contraseña es obligatoria')
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir'),
});
