/**
Function: fastifyFunction
Signature type: http
LD_LIBRARY_PATH: '/layers/google.nodejs.runtime/node/lib',
FUNCTION_TARGET: 'fastifyFunction',
NODE_OPTIONS: '--max-old-space-size=204',
PWD: '/workspace',
MA_PLATFORM: 'gcp',
HOME: '/root',
DEBIAN_FRONTEND: 'noninteractive',
PORT: '8080',
K_REVISION: 'our-attendance-00030-tec',
K_SERVICE: 'our-attendance',
SHLVL: '1',
 */
const { K_SERVICE } = process.env;

export const isGCP = () => {
  return K_SERVICE;
};

export const createCookieExpiration = (minutes: number) => {
  const cookieExpiration = new Date();
  cookieExpiration.setTime(cookieExpiration.getTime() + minutes * 60 * 1000);
  return cookieExpiration;
};
