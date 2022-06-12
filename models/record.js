const mongoose = require("mongoose");
const dateTime = require("luxon");  //*

const record = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true
    },

    createTime: {
        type: Date,
        default: new Date(),
    }
})

record.virtual("age").get(function(){
    
    return this.createTime.getTime();
})

record.virtual("key").get(function(){
    return this._id;
})

module.exports = mongoose.model("record",record);