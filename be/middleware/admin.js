const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    console.log("Session data:", req.session); // Log session data for debugging
    
    if (!req.session || !req.session.userId) {
      return res.status(403).json({ message: 'Access denied. Please log in.' });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    
    next();
  } catch (err) {
    console.error("Error checking admin privileges:", err.message);
    res.status(500).json({ message: 'Error checking admin privileges' });
  }
};

module.exports = adminMiddleware;
