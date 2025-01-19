const jwt = require('jsonwebtoken');

// function we will use in endpoints that require user authentication
function authenticateJWT(req, res, next) {
  const token = req.cookies.token;

  // if there is no token or token is wrong we will redirect to /login route
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/login');
    }

    req.user = user; // storing user data in req
    console.log(`User authenticated: ${user.username || user.email || user.id}`);

    next();
  });
}

module.exports = { authenticateJWT };
