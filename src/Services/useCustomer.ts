import { useLazyQuery, ApolloError } from '@apollo/client';
import {
  GetCustomerDataType,
  GET_CUSTOMER,
} from '../Queries/getCustomer';

interface Result {
  getCustomer(): void;
  data: GetCustomerDataType | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}

export const useCustomer = (): Result => {
  const [
    getCustomer,
    { data, loading, error },
  ] = useLazyQuery<GetCustomerDataType>(GET_CUSTOMER,{ errorPolicy: 'all' });

  return {
    getCustomer,
    data,
    loading,
    error,
  };
};
