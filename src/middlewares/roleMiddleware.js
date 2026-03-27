function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !allowedRoles.includes(role)) {
      console.log('[ROLE] Acceso denegado para rol:', role);
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

module.exports = {
  allowRoles
};
