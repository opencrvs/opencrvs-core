const unsafeConfig = {
  LOCALE: process.env.REACT_APP_LOCALE,
  AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL,
  REGISTER_APP_URL: process.env.REACT_APP_REGISTER_APP_URL
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
