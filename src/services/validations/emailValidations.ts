import * as yup from "yup";

export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email("El correo electrónico no es válido")
    .required("El correo electrónico es obligatorio"),
});
