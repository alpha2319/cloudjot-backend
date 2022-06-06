//References - https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
//References - https://attacomsian.com/blog/uploading-files-nodejs-express

const express = require("express");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
var fileUpload = require("express-fileupload");
var AWS = require("aws-sdk");

// Enter copied or downloaded access ID and secret key here for accessing amazon S3
const ID = '';
const SECRET = '';

// The name of the bucket that you have created
const bucketName = '';

var Record = require("./models/record");
var File = require("./models/file");

var MongoDB = "";   //*

mongoose.connect(MongoDB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
db.on("error",console.error.bind("MongoDB connection error"));

const port = (process.env.port || 3000);

const app = express();

app.use(fileUpload);
app.use(bodyParser.json());

app.post("/records/:key",(req,res)=>{
    console.log("This function is not implemented yet ...");    //*
})

app.post("/records",(req,res)=>{
    try{
        if(!req.files){
            res.send({
                status: false,
                message: "No file uploaded"
            })
        }

        else{
            var record = new Record({
                ipAddress: req.ip
            })

            record.save(function(err){
                if(err){
                    res.status(500).send(err);
                }
            })

            var recordKey = record.key;

            for (var i = 0; i<req.files.entries.length; i++){
                var fileBuffer = req.files.entries[i];
                
                var file = new File({
                    record:recordKey
                })

                file.save(function(err){
                    if(err){
                        res.status(500).send(err);
                    }
                })

                var fileKey = file.key;

                var params = {
                    Bucket: bucketName,
                    Key: fileKey,
                    Body: fileBuffer
                }

                s3.upload(params,function(err,data){
                    if(err){
                        throw err;
                    }

                    console.log("File uploaded successfully at "+data.location);
                    //code to extract data.location to link field of the current file database object (I think it should be optional)
                })
            }
        }
    } catch (error){
        res.status(500).send(error);
    }
})

app.use((req,res,next)=>{
    return next(createError(404));
})

app.listen(port,(req,res)=>{
    console.log("Server running at port -"+port);
})