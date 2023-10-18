import { trimTrailingSlash } from 'src/misc/utils';
import { ClashAPIConfig } from 'src/types';
import { LogsAPIConfig } from 'src/types';

const headersCommon = { 'Content-Type': 'application/json' };

function genCommonHeaders({ secret }: { secret?: string }) {
  const h = { ...headersCommon };
  if (secret) {
    h['Authorization'] = `Bearer ${secret}`;
  }
  return h;
}
function buildBaseUrl(baseURL: string){
  if(baseURL.startsWith("/")){
    return new URL(baseURL, document.baseURI).href
  }
  return baseURL
}
function buildWebSocketURLBase(baseURL: string, params: URLSearchParams, endpoint: string) {
  const qs = '?' + params.toString();
  const url = new URL(baseURL,document.baseURI);

  url.protocol === 'https:' ? (url.protocol = 'wss:') : (url.protocol = 'ws:');
  return `${trimTrailingSlash(url.href)}${endpoint}${qs}`;
}

export function getURLAndInit({ baseURL, secret }: ClashAPIConfig) {
  const headers = genCommonHeaders({ secret });
  return {
    url: buildBaseUrl(baseURL),
    init: { headers },
  };
}

export function buildWebSocketURL(apiConfig: ClashAPIConfig, endpoint: string) {
  const { baseURL, secret } = apiConfig;
  const params = new URLSearchParams({
    token: secret,
  });

  return buildWebSocketURLBase(baseURL, params, endpoint);
}

export function buildLogsWebSocketURL(apiConfig: LogsAPIConfig, endpoint: string) {
  const { baseURL, secret, logLevel } = apiConfig;
  const params = new URLSearchParams({
    token: secret,
    level: logLevel,
  });

  return buildWebSocketURLBase(baseURL, params, endpoint);
}
