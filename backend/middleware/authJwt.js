// Minimal authJwt middleware stub so routes that import it don't crash the app.
// Replace with real token verification logic when available.

function verifyToken(req, res, next) {
  // If you want to enforce auth, check Authorization header here.
  // For now we allow all requests through so Swagger and routes work locally.
  return next();
}

module.exports = { verifyToken };
