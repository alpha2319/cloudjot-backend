const mongoose = require("mongoose");
const dateTime = require("luxon");  //*

const record = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true
    },

    createTime: {
        type: Date,
        default: new Date.now(),
        required: true
    }
})

record.virtual("age",get(function(){
    const now = new Date.now();
    return now.getTime() - this.createTime.getTime();
}))

record.virtual("key",get(function(){
    return this._id;
}))

module.exports = mongoose.model("record",record);