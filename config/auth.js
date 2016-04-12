//throw new Error('Not implemented.')
// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {
    facebook: {
        consumerKey: 'YOUR_APP_ID',
        consumerSecret: 'YOUR_APP_SECRET',
        callbackUrl: 'http://socialauthenticator.com:8000/auth/facebook/callback'
    }
}
