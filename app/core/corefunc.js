/*
  This is the class for core function checkin checkout and notify
  Author: Tony Nguyen
  Zentomic
*/
// load up the user model
var Agent = require('../models/Agent');
var AgentSetting = require('../models/AgentSetting');
var Notifier = require('../models/notifier');
var NotifierSetting = require('../models/NotifierSetting');
var Transaction = require('../models/transaction');
var SMS = require('../twilioClient');
var User = require('../models/user');
var Business = require('../models/business');
var Check = require('../models/check');
var PushToken = require('../models/pushToken');

//===========================================================================================================
//===========================================================================================================
//===========================================================================================================

var CONST_TIMEOUT = 10 * 1000; // 30 seconds
//--------------------------------------------------------
var CoreFunc = function () {
  this.listID = {};
};

CoreFunc.prototype.Checkin = function (email, callback, timeout) {
  console.log(email + " check in!");

  var idObj = this.listID[email];
  var TIMEOUT = timeout || CONST_TIMEOUT;

  // clear current time out of this email
  if (idObj) clearTimeout(idObj);

  timeObj = setTimeout(() => {
    if (callback) callback(this.idObj);
    clearTimeout(this.idObj);
    delete this.listID[email]; // remove out of listID;
  }, TIMEOUT);

  this.listID[email] = timeObj;

  //console.log(this.listID);

};

/*
Check out means delete all timer of this email
*/
CoreFunc.prototype.Checkout = function (email, callback) {
  console.log(email + " check out!");
  var idObj = this.listID[email];
  // clear current time out of this email
  if (idObj) {
    clearTimeout(idObj);
    delete this.listID[email];
  }
};


/*
this function will notify by send sms to list of fone numbers
*/
CoreFunc.prototype.Notify = function (fromemail, message, callback) {
  // get user from mail.
  var $thiscorefunc = this;
  this.Notifier().Read(fromemail, function (rs) {
    var notifiers = rs.data;
    var counter = 0;
    if (notifiers) {
      for (var i = 0; i < notifiers.length; i++) {
        var notifier = notifiers[i];
        console.log("Notify sms " + fromemail + " -> " + notifier.Info.Email);
        // send sms
        var tofone = notifier.Info.Fone;
        if (tofone) {
          SMS.sendSms(tofone, message, null);
          //-----------------------------------
          // write transaction table
          $thiscorefunc.Transaction().Create(fromemail, notifier.Info.Email, message);
          //----------------------------
          counter++;
        }
      }
    }
    // callback
    if (callback) {
      callback(counter);
    }
  });
  //  ----------------------------
};

// CRUD notifier

CoreFunc.prototype.Notifier = function () {
  console.log(this.Notifier_Func);
  var Notifier_Func = {
    // create and update
    Create: function (fromuser, firstname, middlename, lastname, fone, email, password, type, callback) {
      var notifier = new Notifier();
      notifier.FromAgent = fromuser;
      notifier.Info.firstname = firstname;
      notifier.Info.middlename = middlename;
      notifier.Info.lastname = lastname;
      notifier.Info.Fone = fone;
      notifier.Info.Email = email;
      notifier.Info.Password = password;
      notifier.local.email = email;
      notifier.local.password = password;
      notifier.Type = type;

      // find and remove
      Notifier.findOneAndRemove({ 'FromAgent': fromuser, 'Info.Email': email }, function (err) {
        if (err) throw err;
        // save notifier
        notifier.save(function (err) {
          if (err) throw err;
          console.log('notifier created!');
          if (callback) callback();
        });
      });
    },
    Update: function (oldemail, firstname, middlename, lastname, fone, email, password, type, callback) {
      // find and remove
      Notifier.findOne({ 'Info.Email': oldemail }, function (err, notifier) {
        if (err) throw err;

        notifier.Info.firstname = firstname;
        notifier.Info.middlename = middlename;
        notifier.Info.lastname = lastname;
        notifier.Info.Fone = fone;
        notifier.Info.Email = email;
        notifier.Type = type;
        notifier.Info.Password = password;
        notifier.local.email = email;
        notifier.local.password = password;

        // save notifier
        notifier.save(function (err) {
          if (err) throw err;
          console.log('notifier created!');
          if (callback) callback(err, notifier);
        });
      });
    },
    Read: async function (fromuser, callback) {
      try {
        let notifier = await Notifier.find({ 'FromAgent': fromuser });
        if (!notifier) {
          var rs = { email: fromuser, data: notifier };
          if (callback) callback(rs);
        }
      } catch (e) {
        throw e;
      }
    },
    Delete: async function (infoemail, callback) {
      try {
        let notifer = await Notifier.findOneAndRemove({ 'Info.Email': infoemail });
        if (callback) callback(notifer);
      } catch (e) {
        throw e;
      }
    },
    Delete_FromAgent: function (agentemail, callback) {
      Notifier.find({ 'FromAgent': agentemail }, function (err, agent) {
        agent.remove(callback(err));   // delete all notifer of agent
      });
    }
  }; // crud notifier

  return Notifier_Func;
};

// CRUD Agent
CoreFunc.prototype.Agent = function () {
  return {
    Read: function (localemail, callback) {
      Agent.findOne(
        { 'local.email': localemail }, function (err, agent) {
          if (callback) callback(err, agent);
        });
    },
    Update: function (email, firstname, middlename, lastname, password, callback) {
      Agent.findOne(
        { 'local.email': email }, function (err, agent) {
          if (err) throw err;
          agent.local.email = email;
          agent.local.firstname = firstname;
          agent.local.middlename = middlename;
          agent.local.lastname = lastname;
          agent.local.password = agent.generateHash(password);
          agent.save(function (err) {
            if (callback) callback(err, agent);
          });
        });
    },
    Delete: function (email, callback) {
      // remove agent
      Agent.findOneAndRemove({ 'local.email': email }, function (err) {
        if (callback) callback(err);
      });
    },

  };
}
  ;
// CRUD AgentSetting
CoreFunc.prototype.AgentSetting = function () {
  return {
    Create: function (agentmail, duration, message, type, callback) {
      AgentSetting.findOne(
        { 'AgentEmail': agentmail },
        function (err, agentsetting) {
          //custom code here
          var result = { err: null, data: null };
          // if there are any errors, return the error
          if (!err) {
            // check to see if theres not already a user with that email
            if (!agentsetting) {
              agentsetting = new AgentSetting();
            }
            // set the agent setting
            agentsetting.AgentEmail = agentmail;
            agentsetting.Setting.Duration = duration;
            agentsetting.Setting.Message = message;
            agentsetting.Setting.Type = type;
            // save the agentsetting
            agentsetting.save(function (err) {
              if (err) throw err;
              result.data = agentsetting;
              if (callback) callback(result);
            });

          }
          else {
            result.err = err;
            if (callback) callback(result);
          }

          // responed;
        }
      );
    },
    Read: function (agentemail, callback) {
      AgentSetting.findOne(
        { 'AgentEmail': agentemail }, function (err, agentsetting) {
          if (callback) callback(err, agentsetting);
        });
    },
    Update: function (agentemail, duration, message, type, callback) {
      AgentSetting.findOne(
        { 'AgentEmail': agentemail }, function (err, agentsetting) {
          if (err) throw err;
          agentsetting.Setting.Duration = duration;
          agentsetting.Setting.Message = message;
          agentsetting.Setting.Type = type;
          agentsetting.save(function (err) {
            if (callback) callback(err, agentsetting);
          });
        });
    },
    Delete: function (email, callback) {
      // remove agent
      AgentSetting.findOneAndRemove({ 'AgentEmail': email }, function (err) {
        if (callback) callback(err);
      });
    },

  };
}
  ;
// CRUD Transaction
CoreFunc.prototype.Transaction = function () {

  var Transaction_Func = {
    // create and update
    Create: function (fromuser, touser, message, atdatetime, callback) {
      var transaction = new Transaction();
      transaction.FromUser = fromuser;
      transaction.ToUser = touser;
      transaction.Message = message;
      if (atdatetime) transaction.AtDateTime = atdatetime;
      // save transaction
      transaction.save(function (err) {
        if (err) throw err;
        console.log('transaction created!');
        if (callback) callback();
      });
    },
    Read: function (fromuser, touser, callback) {
      var filter = {};
      filter = !touser ? { 'FromUser': fromuser } : { 'FromUser': fromuser, 'ToUser': touser };

      Transaction.find(
        filter,
        function (err, transaction) {
          //custom code here
          if (err) throw err;
          var rs = { email: fromuser, data: transaction };
          if (callback) callback(rs);
        }
      );
    }
  }; // crud notifier

  return Transaction_Func;
};

// CRUD Notifier Setting
CoreFunc.prototype.NotifierSetting = function () {
  return {
    Create: function (notifiermail, enablemms, callback) {
      NotifierSetting.findOne(
        { 'NotifierEmail': notifiermail },
        function (err, notifiersetting) {
          //custom code here
          var result = { err: null, data: null };
          // if there are any errors, return the error
          if (!err) {
            // check to see if theres not already a user with that email
            if (!notifiersetting) {
              notifiersetting = new NotifierSetting();
            }
            // set the notifier setting
            notifiersetting.NotifierEmail = notifiermail;
            notifiersetting.Setting.EnableMMS = enablemms;

            // save the notifiersetting
            notifiersetting.save(function (err) {
              if (err) throw err;
              result.data = notifiersetting;
              if (callback) callback(result);
            });

          }
          else {
            result.err = err;
            if (callback) callback(result);
          }

          // responed;
        }
      );
    },
    Read: function (notifieremail, callback) {
      NotifierSetting.findOne(
        { 'NotifierEmail': notifieremail }, function (err, notifiersetting) {
          if (callback) callback(err, notifiersetting);
        });
    },
    Update: function (notifieremail, enablemms, callback) {
      NotifierSetting.findOne(
        { 'NotifierEmail': notifieremail }, function (err, notifiersetting) {
          if (err) throw err;
          if (!notifiersetting)
            notifiersetting = new NotifierSetting();

          notifiersetting.Setting.EnableMMS = enablemms;

          notifiersetting.save(function (err) {
            if (callback) callback(err, notifiersetting);
          });

        });
    },
    Delete: function (email, callback) {
      // remove notifier
      NotifierSetting.findOneAndRemove({ 'NotifierEmail': email }, function (err) {
        if (callback) callback(err);
      });
    },

  };
}
  ;

CoreFunc.prototype.PushToken = () => {
  return {
    Create: (userId, pushToken, cb) => {
      let push_token = new PushToken();
      let result = {
        error: null,
        data: null
      }

      push_token.userId = userId;
      push_token.pushToken = pushToken;

      push_token.save((err) => {
        result.data = push_token;
        if (err) result.error = err;
        if (cb) cb(result);
      })
    }
  }
}



//==============================================================================
// export module
module.exports = CoreFunc;
