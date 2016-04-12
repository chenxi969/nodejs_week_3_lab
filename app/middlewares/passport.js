let passport = require('passport')
let wrap = require('nodeifyit')
let User = require('../models/user')
let LocalStrategy = require('passport-local').Strategy

// Handlers
async function localAuthHandler(email, password) {
  let user = await User.promise.findOne({email})

  if (!user || email !== user.email) {
    return [false, {message: 'Invalid username'}]
  }

  if (!await user.validatePassword(password)) {
    return [false, {message: 'Invalid password'}]
  }
  return user
}

async function localSignupHandler(email, password) {
  console.log("in localsignup handler")
  console.log(email)
  console.log(password)
  email = (email || '').toLowerCase()
  // Is the email taken?
  if (await User.promise.findOne({'local.email': email})) {
    console.log("this email has been taken")
    return [false, {message: 'That email is already taken.'}]
  }

  console.log("email has not taken")
  // create the user
  let user = new User()
  user.local.email = email
  // Use a password hash instead of plain-text
  user.local.password = await user.generateHash(password)
  return await user.save()
}

// 3rd-party Auth Helper
function loadPassportStrategy(OauthStrategy, config, userField) {
  config.passReqToCallback = true
  passport.use(new OauthStrategy(config, wrap(authCB, {spread: true})))

  async function authCB(req, token, _ignored_, account) {
      // 1. Load user from store by matching user[userField].id && account.id
      // 2. If req.user exists, we're authorizing (linking account to an existing user)
      // 2a. Ensure it's not already associated with another user
      // 2b. Link account
      // 3. If req.user !exist, we're authenticating (logging in an existing user)
      // 3a. If Step 1 failed (existing user for 3rd party account does not already exist), create a user and link this account (Otherwise, user is logging in).
      // 3c. Return user
  }
}

function configure(CONFIG) {
  // Required for session support / persistent login sessions
  passport.serializeUser(wrap(async (user) => user._id))
  passport.deserializeUser(wrap(async (id) => {
    return await User.promise.findById(id)
  }))

  /**
   * Local Auth
   */
  let localLoginStrategy = new LocalStrategy({
    usernameField: 'email', // Use "email" instead of "username"
    failureFlash: true // Enable session-based error logging
  }, wrap(localAuthHandler, {spread: true}))
  let localSignupStrategy = new LocalStrategy({
    usernameField: 'email',
    failureFlash: true
  }, wrap(localSignupHandler, {spread: true}))

  passport.use('local-login', localLoginStrategy)
  passport.use('local-signup', localSignupStrategy)

  /**
   * 3rd-Party Auth
   */

  // loadPassportStrategy(LinkedInStrategy, {...}, 'linkedin')
  // loadPassportStrategy(FacebookStrategy, {...}, 'facebook')
  // loadPassportStrategy(GoogleStrategy, {...}, 'google')
  // loadPassportStrategy(TwitterStrategy, {...}, 'twitter')

  return passport
}

module.exports = {passport, configure}
