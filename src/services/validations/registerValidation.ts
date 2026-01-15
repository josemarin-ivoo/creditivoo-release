import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  name: yup.string().required('El nombre es obligatorio'),
  lastname: yup.string().required('El apellido es obligatorio'),
  email: yup
    .string()
    .email('Debe ser un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  phone: yup.string().required('El teléfono es obligatorio'),
  contractNumber: yup.string(), // Optional field
  dob: yup.date().required('La fecha de nacimiento es obligatoria'),
  document: yup.string().required('El documento es obligatorio'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(20, 'La contraseña debe tener menos de 20 caracteres'),
});
