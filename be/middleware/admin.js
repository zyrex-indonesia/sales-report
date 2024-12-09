const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // Extract username and password from headers
    const { username, password } = req.headers;

    if (!username || !password) {
      console.log('Admin check failed: Missing username or password');
      return res.status(403).json({ message: 'Not authenticated. Please provide username and password.' });
    }

    // Fetch user from the database
    const user = await User.findOne({ where: { username } });

    // Validate user existence, password, and role
    if (!user || user.password !== password || user.role !== 'admin') {
      console.log('Access denied: User is not an admin or invalid credentials');
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    console.log('Admin access granted:', user.username);

    // Attach user data to the request for further use
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error('Error checking admin privileges:', err.message);
    res.status(500).json({ message: 'Error checking admin privileges' });
  }
};

module.exports = adminMiddleware;
