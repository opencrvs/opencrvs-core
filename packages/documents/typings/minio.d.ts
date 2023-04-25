type Request = {
  headers: {
    host: string
  }
  protocol: string
  method: string
  path: string
}

declare module 'minio/dist/main/signing' {
  export function presignSignatureV4(
    request: Request,
    accessKey: string,
    secretKey: string,
    sessionToken?: string,
    region: string,
    requestDate: Date,
    expires: number
  ): string
}
