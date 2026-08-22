// Use after authenticate(). Mirrors the frontend's ProtectedRoute, but this
// is the copy that actually matters — the frontend gate is just UX, this
// one is the real authorization boundary.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden — this account does not have access' });
    }
    next();
  };
}
