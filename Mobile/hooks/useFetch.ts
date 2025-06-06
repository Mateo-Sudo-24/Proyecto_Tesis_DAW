import axios, { AxiosResponse } from 'axios';
import Toast from 'react-native-toast-message';

type HttpMethod = 'POST' | 'GET';

interface FetchResponse {
  msg?: string;
  [key: string]: any;
}

export default function useFetch() {
  const fetchDataBackend = async (url: string, form: any = null,method: HttpMethod = 'POST'): Promise<FetchResponse> => {
    try {
      let response: AxiosResponse<FetchResponse>;

      if (method === 'POST') {
        response = await axios.post(url, form);
      } else {
        response = await axios.get(url);
      }

      if (response.data?.msg) {
        Toast.show({
          type: 'success',
          text1: 'Éxito',
          text2: response.data.msg,
          position: 'bottom',
        });
      }

      return response.data;

    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || 'Error desconocido';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
        position: 'bottom',
      });
      throw new Error(errorMsg);
    }
  };

  return { fetchDataBackend };
}
