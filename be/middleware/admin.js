const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // Check if the user ID is stored in the session
    if (!req.session || !req.session.userId) {
      return res.status(403).json({ message: 'Access denied. Please log in.' });
    }

    // Fetch the user by primary key (ID) from the session
    const user = await User.findByPk(req.session.userId);
    
    // Check if user exists and has the 'admin' role
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    
    // If the user is an admin, allow the request to proceed
    next();
  } catch (err) {
    console.error("Error checking admin privileges:", err.message);
    res.status(500).json({ message: 'Error checking admin privileges' });
  }
};

module.exports = adminMiddleware;
