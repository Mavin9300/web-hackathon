export const extractAuthToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        req.authToken = authHeader.substring(7);
    }
    
    next();
};
