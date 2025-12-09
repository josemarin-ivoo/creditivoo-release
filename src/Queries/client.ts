import {ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

let _client: ApolloClient<any>;

export async function getApolloClient(): Promise<ApolloClient<any>> {
  if (_client) {
    return _client;
  }

  const httpLink = createHttpLink({
    // uri: 'http://server1.heliosdemo.com:8443/graphql',

    //UAT
  //  uri: 'https://uat.nuweapp.com/graphql', //todo change this for UAT

    //uri: 'https://new.nuweapp.com/graphql',

    //Producation
    uri: 'https://www.nuweapp.com/graphql', //todo change this for Prod

    useGETForQueries: true,
  });

  const authLink = setContext(async (_, {headers}) => {
    const value = await AsyncStorage.getItem('persist:ivo-app');
    var token = '';

    if (value !== null) {
      const localStorage = JSON.parse(value).commonReducer;
      token = JSON.parse(localStorage).token;
      console.log('________APP token', token);
    }

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });
  // console.log('________APPauthLink', authLink);

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
    },
  });

  _client = client;

  return client;
}
