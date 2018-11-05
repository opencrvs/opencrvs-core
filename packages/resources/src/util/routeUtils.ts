export const replaceParamsInRoute = (
  route: string,
  params: string[]
): string => {
  return route.replace(/%(\d+)/g, (_, n) => params[+n - 1])
}
