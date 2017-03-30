/*
  This is the class for core function checkin checkout and notify
  Author: Tony Nguyen
  Zentomic
*/
// load up the user model
var User       = require('../models/user');
var Notifier       = require('../models/notifier');
var SMS        = require('../twilioClient');
//===========================================================================================================
//===========================================================================================================
//===========================================================================================================

var CONST_TIMEOUT = 10*1000; // 30 seconds
//--------------------------------------------------------
var CoreFunc = function(){
  this.listID = {};
  this.Notifier_Func = {
    Create  : function(fromuser, fullname, fone, email, type, callback) {
                var notifier = new Notifier();
                notifier.FromUser = fromuser;
                notifier.Info.Fullname  = fullname;
                notifier.Info.Fone    =fone;
                notifier.Info.Email   = email;
                notifier.Type = type;

                // delete last information
                Notifier.findOneAndRemove({'FromUser':fromuser}, function(err){
                    if(err) throw err;
                    console.log('delete old notifier');
                    //
                    notifier.save(function(err){
                        if (err) throw err;
                        console.log('notifier created!');
                        if(callback) callback();
                    });
                });


              }

  }; // crud notifier

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

CoreFunc.prototype.Checkout = function(email, callback){
  console.log(email + " check out!");
  var idObj = this.listID[email];
  // clear current time out of this email
  if(idObj) {
    clearTimeout(idObj);
    delete this.listID[email];
  }

//  console.log(this.listID);
}

CoreFunc.prototype.Notify = (fromemail, message, callback)=>{
  // get user from mail.
  Notifier.findOne(
      { 'FromUser' :  fromemail },
          function(err, notifier) {
            console.log("Notify " + fromemail + notifier );
              //custom code here
              if(err) console.log(err);
              if(notifier)
              {
                // send to notifier sendSms
                var tofone = notifier.Info.Fone;
                if(tofone)
                {
                    SMS.sendSms(tofone, message, function(err, data){
                        var resdata = {err, data};
                        if(callback) callback(resdata);
                    });
                    //----------------------------
                }

              }
          }
      );
}

// CRUD notifier

CoreFunc.prototype.Notifier  = function() {
  console.log(this.Notifier_Func);
  return this.Notifier_Func;
};

// export module
module.exports = CoreFunc;
