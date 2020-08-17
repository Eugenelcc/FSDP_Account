const moment = require('moment');
const User = require('../models/User');
module.exports = {
    formatDate: function (date, targetFormat) {
        return moment(date).format(targetFormat);
    },
    //radioCheck
    radioCheck: function (value, radioValue) {
        if (value != radioValue) {
            return "";
        }
        return 'checked';
    },
    //replaceCommas note : value == string
    replaceCommas: function (value) {
        if (value == '') { // empty string
            return 'None'
        }
        else {
            return value.replace(/,/g, ' | ')
        }
    },
    adminCheck: function (value)
    {
        console.log("LOGIN AS AN ",value)
        if (value == 'admin')
        {
            return "";
        }
        else
        {
            return ('display:none');
        }
        }

    

  
    
};