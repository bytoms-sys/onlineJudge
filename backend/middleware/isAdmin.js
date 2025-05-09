const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', status: false });
    }
    next();
  };
  module.exports = isAdmin;