const mongoose = require("mongoose");
const dateTime = require("luxon");  //*

var Schema = mongoose.Schema;

const file = new Schema({
    record: {
        type: Schema.Types.ObjectId,
        ref: 'record',
        required: true
    },

    key: {             //* field specs will be updated as needed with respect to amazon S3
        type: String,
        required:true
    },

    location:{
        type:String,
        required:true
    },

    createTime: {
        type: Date,
        default: new Date()
    },

    name: {
        type: String,
        required: true
    }
})

file.virtual("age").get(function(){
    
    return this.createTime.getTime();
})

file.virtual("id").get(function(){
     return this._id;
})

file.virtual('keyName').get(function(){
    return this.key;
})

module.exports = mongoose.model("file",file);