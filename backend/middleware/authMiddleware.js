const jwt = require('jsonwebtoken');

const EVENT_MANAGER_ROLES = ['Event Organizer', 'Faculty Lead', 'Club Admin', 'Admin', 'Super Admin'];
const PLATFORM_ADMIN_ROLES = ['Admin', 'Super Admin'];
const FINANCE_ROLES = ['Finance Officer', 'Admin', 'Super Admin'];

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token not found. Access denied.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  next();
};

module.exports = protect;
module.exports.protect = protect;
module.exports.authorizeRoles = authorizeRoles;
module.exports.EVENT_MANAGER_ROLES = EVENT_MANAGER_ROLES;
module.exports.PLATFORM_ADMIN_ROLES = PLATFORM_ADMIN_ROLES;
module.exports.FINANCE_ROLES = FINANCE_ROLES;