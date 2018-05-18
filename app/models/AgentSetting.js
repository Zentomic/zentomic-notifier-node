// app/models/AgentSettingSchema.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our AgentSettingSchema model
var AgentSettingSchema = mongoose.Schema({
    AgentEmail : String,  // agent id
    Setting        : {
      Duration      : Number, // duration for notifie
      Radius        : Number, 
      Message       : String, // message for sending to notifier
      Type          : String // sms or mms
    }
});
// methods ======================

//-------------------------------------------------------------------------------------------

// create the model for AgentSettingSchemas and expose it to our app
module.exports = mongoose.model('tbl_agentSetting', AgentSettingSchema);
