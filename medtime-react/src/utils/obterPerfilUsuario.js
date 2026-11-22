
import { jwtDecode } from 'jwt-decode'

export function obterPerfilUsuario(token) {
  if (!token) return null

  try {
    const payload = jwtDecode(token)

    const role = Number(payload.role)

    if (role === 1) return 'cuidador'
    if (role === 2) return 'paciente'

    return null
  } catch {
    return null
  }
}
