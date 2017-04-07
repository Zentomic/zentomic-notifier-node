/*
  This is the class for core function checkin checkout and notify
  Author: Tony Nguyen
  Zentomic
*/
// load up the user model
var Agent       = require('../models/Agent');
var Notifier       = require('../models/notifier');
var SMS        = require('../twilioClient');
//===========================================================================================================
//===========================================================================================================
//===========================================================================================================

var CONST_TIMEOUT = 10*1000; // 30 seconds
//--------------------------------------------------------
var CoreFunc = function(){
  this.listID = {};
};

CoreFunc.prototype.Checkin = function(email, callback, timeout){
  console.log(email + " check in!");

  var idObj = this.listID[email];
  var TIMEOUT  = timeout || CONST_TIMEOUT;

  // clear current time out of this email
  if(idObj) clearTimeout(idObj);

  timeObj = setTimeout(()=>{
    if(callback) callback(this.idObj);
    clearTimeout(this.idObj);
    delete this.listID[email]; // remove out of listID;
  }, TIMEOUT);

  this.listID[email] = timeObj;

  //console.log(this.listID);

}

/*
Check out means delete all timer of this email
*/
CoreFunc.prototype.Checkout = function(email, callback){
  console.log(email + " check out!");
  var idObj = this.listID[email];
  // clear current time out of this email
  if(idObj) {
    clearTimeout(idObj);
    delete this.listID[email];
  }
}


/*
this function will notify by send sms to list of fone numbers
*/
CoreFunc.prototype.Notify = function(fromemail, message, callback){
  // get user from mail.
    this.Notifier().Read(fromemail,   function(rs) {
      var notifiers = rs.data;
      var counter=0;
        if(notifiers)
        {
          for (var i=0;i<notifiers.length;i++)
          {
            var notifier = notifiers[i];
              console.log("Notify sms " + fromemail + " -> "+ notifier.Info.Email);
              // send sms
              var tofone = notifier.Info.Fone;
              if(tofone)
              {
                  SMS.sendSms(tofone, message, null);
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
}

// CRUD notifier

CoreFunc.prototype.Notifier  = function() {
  console.log(this.Notifier_Func);
  var Notifier_Func = {
    // create and update
    Create: function(fromuser, fullname, fone, email, type, callback)
    {
        var notifier = new Notifier();
        notifier.FromAgent = fromuser;
        notifier.Info.Fullname  = fullname;
        notifier.Info.Fone    =fone;
        notifier.Info.Email   = email;
        notifier.Type = type;

        // find and remove
        Notifier.findOneAndRemove({ 'FromAgent' :  fromuser, 'Info.Email':email}, function(err){
          if(err) throw err;
          // save notifier
          notifier.save(function(err){
              if (err) throw err;
              console.log('notifier created!');
              if(callback) callback();
          });
        });
      },
      Update: function(oldemail, fullname, fone, email, type, callback)
      {
          // find and remove
          Notifier.findOne({'Info.Email':oldemail}, function(err, notifier){
            if(err) throw err;

            notifier.Info.Fullname  = fullname;
            notifier.Info.Fone    = fone;
            notifier.Info.Email   = email;
            notifier.Type = type;

            // save notifier
            notifier.save(function(err){
                if (err) throw err;
                console.log('notifier created!');
                if(callback) callback();
            });
          });
        },
      Read: function(fromuser, callback)
      {
          Notifier.find(
              { 'FromAgent' :  fromuser},
              function(err, notifier) {
                    //custom code here
                  if(err) throw err;
                  var rs = {email: fromuser, data: notifier};
                  if(callback) callback(rs);
                }
          );
      },
      Delete : function (infoemail, callback)
      {
        Notifier.findOneAndRemove({'Info.Email':infoemail},function(err){
          if(callback) callback(err);
        });
      },
      Delete_FromAgent : function(agentemail, callback)
      {
        Notifier.find({'FromAgent':agentemail}, function(err, agent){
          agent.remove(callback(err));   // delete all notifer of agent
        });
      }
  }; // crud notifier

  return Notifier_Func;
};

// CRUD Agent
CoreFunc.prototype.Agent = function()
{
  return {
    Read: function(localemail, callback)
    {
      Agent.findOne(
      { 'local.email' : localemail },function(err, agent){
        if(callback) callback(err, agent);
      });
    },
    Update: function(email, fullname, password, callback)
    {
      Agent.findOne(
      { 'local.email' : email },function(err, agent){
        if(err) throw err;
        agent.local.email  = email;
        agent.local.fullname  = fullname;
        agent.local.password  = agent.generateHash(password);
        agent.save(function(err){
          if(callback) callback(err, agent);
        });
      });
    },
    Delete: function(email, callback)
    {
      // remove agent
      Agent.findOneAndRemove({'local.email':email},function(err){
        if(callback) callback(err);
      });
    },

  };
}
// export module
module.exports = CoreFunc;
