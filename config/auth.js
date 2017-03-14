module.exports = {

    'facebookAuth' : {
        'clientID'      : '403859436646565', // your App ID
        'clientSecret'  : '62dd4bd81934cd21b721e8d2cb6fb741', // your App Secret
        'callbackURL'   : 'http://zentomic-notifier-node.herokuapp.com/auth_facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://zentomic-notifier-node.herokuapp.com/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '533949658717-bnsj9fg3ncfvjt5o0lcdg0qocjikcmdb.apps.googleusercontent.com',
        'clientSecret'  : '3kPdoay8LaA0ynYYG1wmcccb',
        'callbackURL'   : 'https://zentomic-notifier-node.herokuapp.com/login-google/callback'
    }

};