import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {registerSchema} from '@app-services/validations/authValidations';

export interface SignUpFormData {
  name: string;
  lastname: string;
  document: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useSignUpForm = () => {
  return useForm<SignUpFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onSubmit',
  });
};
