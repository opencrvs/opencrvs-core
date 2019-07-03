export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled'
}

// TODO: need to remove demo
export const roleScopeMapping = {
  FIELD_AGENT: ['declare', 'demo'],
  REGISTRATION_CLERK: ['register', 'performance', 'certify', 'demo'],
  LOCAL_REGISTRAR: ['register', 'performance', 'certify', 'demo'],
  LOCAL_SYSTEM_ADMIN: ['sysadmin', 'demo'],
  NATIONAL_SYSTEM_ADMIN: ['sysadmin', 'demo'],
  PERFORMANCE_OVERSIGHT: ['performance', 'demo'],
  PERFORMANCE_MANAGEMENT: ['performance', 'demo']
}
