module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) { 
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error", "Please log in first!");
    return res.redirect("/login");
  }
  next(); 
};
