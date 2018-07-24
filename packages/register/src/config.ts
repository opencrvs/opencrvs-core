const unsafeConfig = {
  API_GATEWAY_URL: process.env.REACT_APP_API_GATEWAY_URL,
  LANGUAGE: process.env.REACT_APP_LANGUAGE,
  LOCALE: process.env.REACT_APP_LOCALE,
  LOGIN_URL: process.env.REACT_APP_LOGIN_URL,
  CONFIG_TOKEN_EXPIRY: process.env.REACT_APP_CONFIG_TOKEN_EXPIRY
}

Object.entries(unsafeConfig).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(
      `Hey, there's a configuration value (REACT_APP_${key}) missing from the enviroment variables this app was build with`
    )
  }
})

export const config: { [key: string]: string } = {}

Object.entries(unsafeConfig).forEach(([key, value]) => {
  config[key] = unsafeConfig[key] || ''
})
