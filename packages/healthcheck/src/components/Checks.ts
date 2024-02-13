export async function login() {
  try {
    const response = await fetch('http://127.0.0.1:4040/authenticate', {
      body: JSON.stringify({ username: 'k.mweene', password: 'test' }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
    })

    if (response.ok) {
      const data = await response.json()

      if (data.token) {
        return data
      } else if (data.statusCode === 401) {
        throw new Error(data.error)
      } else {
        throw new Error('Unexpected response format')
      }
    } else {
      throw new Error(`Request failed with status: ${response.status}`)
    }
  } catch (error) {
    console.error('An error occurred:', error)
    throw error // Rethrow the error to handle it elsewhere if needed
  }
}
