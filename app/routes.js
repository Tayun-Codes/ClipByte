module.exports = function (app, passport, db) {
  const multer = require('multer')
  const upload = multer({})
  //where do I put this? ^^ 
  
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // upload routes ===============================================================

  // UPLOAD  =========================
  app.get('/upload', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('upload.ejs', {
        user: req.user,
      })
    })
  });

  // needs to go to amazon s3
  // error bc buffer is too large 
  //RangeError [ERR_OUT_OF_RANGE]: The value of "offset" is out of range. It must be >= 0 && <= 17825792. Received 32911416
  app.post('/upload', upload.single('video'), (req, res) => {
    console.log(req, 'REQ')
    console.log(req.file, 'REQFILE')
    db.collection('upload').save({ title: req.body.title, src: req.file.buffer }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/loading')
    })
  })

  //LOADING =========================
  //loads after file is succesfully loaded to the amazon s3 database
  app.get('/loading', function (req, res) {
    res.render('loading.ejs');
  });
  
  //loads after receiving a status from the remotion api on successful completion
  app.get('/completed', function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('completed.ejs', {
        user: req.user,
        clips: result
      })
    })
  });






  app.delete('/delete', (req, res) => {
    db.collection('clips').findOneAndDelete({/*tbd need to look at remotion endpoints*/ }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })







  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/upload', // redirect to the secure upload section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/upload', // redirect to the secure upload section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/upload');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
