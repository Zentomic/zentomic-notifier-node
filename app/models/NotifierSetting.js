// app/models/NotifierSettingSchema.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our NotifierSettingSchema model
var NotifierSettingSchema = mongoose.Schema({
    NotifierEmail: String, // notifier id
    Setting: {
        EnableMMS: {
            type: Boolean,
            default: false
        } // sms or mms
    }
});
// methods ======================

//-------------------------------------------------------------------------------------------

// create the model for NotifierSettingSchemas and expose it to our app
module.exports = mongoose.model('tbl_notifierSetting', NotifierSettingSchema);
