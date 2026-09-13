export function hasRequiredRole(user, allowedRoles) {
  return Boolean(user && allowedRoles.includes(user.role));
}

export function roleHomePath(user) {
  return user?.role === "AGENT" ? "/agent" : "/customer";
}
