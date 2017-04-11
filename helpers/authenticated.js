module.exports = {
  isAuthenticated: (req, res, next) => {
      // do any checks you want to in here

      // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
      // you can do this however you want with whatever variables you set up
      if (req.user){
        // res.redirect("/")
        return next();
      }

      // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
      req.flash("success","Please login to continue")
      res.redirect('/admin/login');
  }

}
