const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // Extract username and password from headers
    const { username, password } = req.headers;

    // Validate that username and password are provided
    if (!username || !password) {
      console.log('Admin check failed: Missing username or password');
      return res.status(401).json({ message: 'Authentication failed. Missing username or password.' });
    }

    // Fetch user from the database
    const user = await User.findOne({ where: { username } });

    // Validate user existence
    if (!user) {
      console.log(`Access denied: User '${username}' not found`);
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    // Validate password
    if (user.password !== password) {
      console.log(`Access denied: Invalid password for user '${username}'`);
      return res.status(401).json({ message: 'Authentication failed. Invalid credentials.' });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      console.log(`Access denied: User '${username}' is not an admin`);
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    console.log(`Admin access granted for user: ${username}`);

    // Attach user data to the request for downstream processing
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Error checking admin privileges:', err.message);
    res.status(500).json({ message: 'Internal server error while checking admin privileges.' });
  }
};

module.exports = adminMiddleware;
