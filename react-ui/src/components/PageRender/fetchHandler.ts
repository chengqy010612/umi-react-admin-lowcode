import axios, {AxiosRequestConfig} from 'axios';
import { RuntimeOptionsConfig } from '@alilc/lowcode-datasource-types';


export function createAxiosFetchHandler(config?: Record<string, unknown>) {
  return async function(options: RuntimeOptionsConfig) {
    const requestConfig:AxiosRequestConfig = {
      ...options,
      url: options.uri,
      method: options.method as AxiosRequestConfig['method'],
      data: options.params,
      headers: options.headers,
      ...config,
    };
    const response = await axios(requestConfig);
    return response;
  };
}
