// load up the user model
var User = require('../app/models/Agent');
var Notifier = require('../app/models/notifier');
var SMS = require('../app/twilioClient');
var VoiceCall = require('../app/twilioCall');
var ReqParam = require('../config/ReqParam');
var CoreFunc = require('../app/core/corefunc.js');
var Mailer = require('../app/core/mail.js');
var PushToken = require('../app/models/pushToken');

var corefunc = new CoreFunc();

module.exports = function(app, passport) {

    /* =====================================
    // HOME PAGE (with login links) ========
    // =====================================*/
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });



    /*
      Login local
    */
    app.get('/Auth/Local', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                var rs = {
                    'login': false,
                    'data': null
                };
                return res.send(rs);
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }

                // succes login
                console.log(req.flash('loginMessage'));
                var message = req.flash('loginMessage').toString();

                var rs = {
                    'login': true,
                    'data': user
                };

                return res.send(rs);
            });
        })(req, res, next);
    });

    app.get('/Auth/Google', passport.authenticate('google'), function(req, res) {
        console.log(" google router calback");
        var rs = {
            'login': true,
            'data': req.user
        };
        res.send(rs);
    });
    //------------------------------------------------------------------------------------------------------------------------------

    //--------------------------------------------------------------

    // --------------------AGENT------------------------------------
    /*
      Get Agent
    */
    app.get('/Agent/Read', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var email = ReqParam(req, 'email');
        //-------------------------------------------
        corefunc.Agent().Read(email, function(err, agent) {
            result.err = err;
            result.data = agent;
            res.send(result);
        });
    });
    /*
      create agent
    */
    app.post('/Agent/Create', function(req, res) {

        var result = {
            err: null,
            data: null
        };

        var email = ReqParam(req, 'email');
        var password = ReqParam(req, 'password');
        var firstname = ReqParam(req, 'firstname');
        var middlename = ReqParam(req, 'middlename');
        var lastname = ReqParam(req, 'lastname');

        User.findOne({
                'local.email': email
            },
            function(err, user) {
                //custom code here
                // if there are any errors, return the error
                if (!err) {
                    // check to see if theres already a user with that email
                    if (user) {
                        result.data = "email already registered " + user;
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.local.email = email;
                        newUser.local.firstname = firstname;
                        newUser.local.middlename = middlename;
                        newUser.local.lastname = lastname;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.activation.activationKey =newUser.generateHash(email + Math.random());
                        newUser.activation.activated = false;
                        // save the user
                        newUser.save(function(err) {
                            if (err) throw err;
                            result.data = newUser;
                            //-------------------------------------
                            // send email with links
                            //(to, subject, activationKey, html)
                            var sender = new Mailer();
                            sender.Send(email, "Zentomic Activate Mail", newUser.activation.activationKey, "<p>Zentomic</p>" );
                        });
                    }
                } else result.err = err;

                res.send(result);
                // responed;
            }


        );



    });
    /*
      Update Agent
    */
    app.put('/Agent/Update', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var email = ReqParam(req, 'email').trim();
        var password = ReqParam(req, 'password');
        var firstname = ReqParam(req, 'firstname').trim();
        var middlename = ReqParam(req, 'middlename').trim();
        var lastname = ReqParam(req, 'lastname').trim();
        //-------------------------------------------
        corefunc.Agent().Update(email, firstname, middlename, lastname, password, function(err, agent) {
            result.err = err;
            result.data = agent;
            res.send(result);
        });
    });
    /*
      Delete Agent
    */
    app.delete('/Agent/Delete', function(req, res) {
        var localemail = ReqParam(req, "email");
        console.log(localemail);
        corefunc.Agent().Delete(localemail, function(err) {
            var resdata = {
                email: localemail,
                error: err
            };
            res.send(resdata);
        });
    });

    /*Send ResendActivationLink*/
    app.post('/Agent/ResendActivationLink', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var email = ReqParam(req, 'email');

        corefunc.Agent().Read(email, function(err, user){
          //-------------------------------------------
          if(user.activation)
          {
            user.activation.activationKey = user.generateHash(email + Math.random());
            user.activation.activated = false;
          }

          // save the user
          user.save(function(err) {
              if (err) throw err;
              result.data = user;
              //-------------------------------------
              // send email with links
              //(to, subject, activationKey, html)
              var sender = new Mailer();
              sender.Send(email, "Zentomic Activate Mail", user.activation.activationKey, "<p>Zentomic</p>" );
              res.send(result);
          });
        });

    });

    /*Send ResendActivationLink*/
    app.get('/Agent/Activate', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var agentemail = ReqParam(req, 'agentemail');
        var activationkey = ReqParam(req, 'activationkey');

        corefunc.Agent().Read(agentemail, function(err, user){
          //-------------------------------------------
          if (err) throw err;
          if(user.isVerified(activationkey))
          {
            result.err = true;
            result.data = {message:"is verified", user: user};
            res.send(result);
          }
          else {
            user.activation.activated = true;
            // save the user
            user.save(function(err) {
                if (err) throw err;
                result.data = {message: "activated", user: user};
                //-------------------------------------
                res.send(result);
            });
          }
        });

    });
    //-------------------------------------------------------------------------------------------------------------------------------

    /*
      Create notifier
    */
    app.post('/Notifier/Create', function(req, res) {
        console.log('create_notifier');
        var fromuser = ReqParam(req, 'fromuser');
        var firstname = ReqParam(req, 'firstname');
        var middlename = ReqParam(req, 'middlename');
        var lastname = ReqParam(req, 'lastname');

        var fone = ReqParam(req, 'fone');
        var email = ReqParam(req, 'email');
        var pass = ReqParam(req, 'password');
        var type = ReqParam(req, 'type');


        var $res = res;
        corefunc.Notifier().Create(fromuser, firstname, middlename, lastname, fone, email, password, type, function() {
            var rs = {
                email: fromuser,
                status: 'create notifier'
            };
            $res.send(rs);
        });



    });
    /*
      Get Notifier
    */
    app.get('/Notifier/Read', function(req, res) {

        var fromuser = ReqParam(req, "fromuser");

        console.log(fromuser);
        corefunc.Notifier().Read(fromuser, function(rs) {
            res.send(rs);
        });
    });
    /*
      Update Agent
    */
    app.put('/Notifier/Update', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var oldemail = ReqParam(req, 'oldemail');
        var email = ReqParam(req, 'email');
        var fullname = ReqParam(req, 'fullname');
        var fone = ReqParam(req, 'fone');
        var type = ReqParam(req, 'type');

        //-------------------------------------------
        corefunc.Notifier().Update(oldemail, fullname, fone, email, type, function(err, notifier) {
            result.err = err;
            result.data = notifier;
            res.send(result);
        });
    });
    /*
      Delete Notifier
    */
    app.delete('/Notifier/Delete', function(req, res) {

        var infoemail = ReqParam(req, "email");
        console.log(infoemail);
        corefunc.Notifier().Delete(infoemail, function(err) {
            var resdata = {
                email: infoemail,
                error: err
            };
            res.send(resdata);
        });

    });

    //-----------------------------------------------------------------------------------
    app.get('/SMS', function(req, res) {
        var tofone = ReqParam(req, 'tofone');
        var message = ReqParam(req, 'message');
        if (tofone) {
            SMS.sendSms(tofone, message, function(err, data) {
                var resdata = {
                    err: err,
                    data: data
                };
                res.send(resdata); // for responding on web
            });
            //----------------------------
        }
    });

    app.get('/VoiceCall', function(req, res) {
        var to = '';
        var message = '';
        VoiceCall.sendCall(to, message, function (err, data) {
            var resdata = {
                err: err,
                data: data
            };
            res.send(resdata); // for responding on web
        });
    });

    // check in check out funciton
    app.get('/Transaction/Checkin', function(req, res) {
        console.log('check in');
        var email = ReqParam(req, 'email');
        var lat = ReqParam(req, 'lat');
        var long = ReqParam(req, 'long');
        var customerinfo = ReqParam(req, 'customerinfo');
        // auth here if need

        corefunc.Checkin(email, function(idobj) {
            // get message from database here
            var message = "Message from " + email + "[Lat: " + lat + " Long:" + long + "]" + Date();
            console.log(message);

            // read agent
            corefunc.Agent().Read(email, function(err, user){
              // read agent Setting
              corefunc.AgentSetting.Read(email, function(err, agentsetting){
                if(agentsetting)
                {
                  message = email ;
                  message += agentsetting.Setting.Message;
                  message += "map http://maps.google.com/?q=<lat>,<lng>";
                  message = message.split("<lat>").join(lat).split("<lng>").join(long);
                }

                // send SMS
                corefunc.Notify(email, message, function(resdata) {
                    console.log(" check in notified to numbers: " + resdata);
                });

              });// read agent setting
            });// end read agent



        });
        var rs = {
            email: email,
            status: 'checkin'
        };
        res.send(rs);
    });
    /*
    check out
    */
    app.get('/Transaction/Checkout', function(req, res) {
        console.log('');
        var email = ReqParam(req, 'email');
        corefunc.Checkout(email, function() {
            console.log(" check out callback " + email);

        });
        var rs = {
            email: email,
            status: 'checkout'
        };
        res.send(rs);
    });
    /* Transaction read */
    app.get('/Transaction/Read', function(req, res) {
        var fromuser = ReqParam(req, "fromuser");
        var touser = ReqParam(req, "touser");
        corefunc.Transaction().Read(fromuser, touser, function(rs) {
            res.send(rs);
        });
    });
    /* Transaction Create */
    app.post('/Transaction/Create', function(req, res) {
        console.log('create_notifier');
        var fromuser = ReqParam(req, 'fromuser');
        var touser = ReqParam(req, 'touser');
        var message = ReqParam(req, 'message');
        var atdatetime = ReqParam(req, 'atdatetime');
        var $res = res;
        corefunc.Transaction().Create(fromuser, touser, message, atdatetime, function() {
            var rs = {
                email: fromuser,
                status: 'create Transaction'
            };
            $res.send(rs);
        });
    });
    //====================================================================
    // --------------------AgentSetting------------------------------------
    /*
      Get AgentSetting
    */
    app.get('/AgentSetting/Read', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var email = ReqParam(req, 'agentemail');
        //-------------------------------------------
        corefunc.AgentSetting().Read(email, function(err, agentsetting) {
            result.err = err;
            result.data = agentsetting;
            res.send(result);
        });
    });
    /*
      create AgentSetting
    */
    app.post('/AgentSetting/Create', function(req, res) {

        var agentmail = ReqParam(req, 'agentmail');
        var duration = ReqParam(req, 'duration');
        var message = ReqParam(req, 'message');
        var type = ReqParam(req, 'type');
        // create agent Setting
        corefunc.AgentSetting().Create(agentmail, duration, message, type, function(result) {
            res.send(result);
        });
    });
    /*
      Update Agent
    */
    app.put('/AgentSetting/Update', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var agentmail = ReqParam(req, 'agentmail');
        var duration = ReqParam(req, 'duration');
        var message = ReqParam(req, 'message');
        var type = ReqParam(req, 'type');
        //-------------------------------------------
        corefunc.AgentSetting().Update(agentmail, duration, message, type, function(err, agentsetting) {
            result.err = err;
            result.data = agentsetting;
            res.send(result);
        });
    });

    // --------------------NotifierSetting------------------------------------
    /*
      Get NotifierSetting
    */
    app.get('/NotifierSetting/Read', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var email = ReqParam(req, 'notifieremail');
        //-------------------------------------------
        corefunc.NotifierSetting().Read(email, function(err, notifiersetting) {
            result.err = err;
            result.data = notifiersetting;
            res.send(result);
        });
    });
    /*
      create NotifierSetting
    */
    app.post('/NotifierSetting/Create', function(req, res) {

        var notifiermail = ReqParam(req, 'notifiermail');
        var enablemms = ReqParam(req, 'enablemms');

        // create notifier Setting
        corefunc.NotifierSetting().Create(notifiermail, enablemms, function(result) {
            res.send(result);
        });
    });
    /*
      Update Notifier
    */
    app.put('/NotifierSetting/Update', function(req, res) {
        var result = {
            err: null,
            data: null
        };

        var notifiermail = ReqParam(req, 'notifiermail');
        var enablemms = ReqParam(req, 'enablemms');

        //-------------------------------------------
        corefunc.NotifierSetting().Update(notifiermail, enablemms, function(err, notifiersetting) {
            result.err = err;
            result.data = notifiersetting;
            res.send(result);
        });
    });

    /* ********************************************************************
     *
     *      Push Tokens - Routes
     * 
     * ******************************************************************** 
     */ 
    app.post('/PushToken/Create', function(req, res) {
        let userId = ReqParam(req, 'userId');
        let pushToken = ReqParam(req, 'pushToken');

        corefunc.PushToken().Create(userId, pushToken, (result) => {
            res.send(result);
        });
    });


};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
