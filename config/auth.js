module.exports = {

    'facebookAuth' : {
        'clientID'      : '403859436646565', // your App ID
        'clientSecret'  : '62dd4bd81934cd21b721e8d2cb6fb741', // your App Secret
        'callbackURL'   : 'http://localhost:9000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};