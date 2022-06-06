//References - https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
//References - https://attacomsian.com/blog/uploading-files-nodejs-express

//References - https://anikislam.medium.com/setting-up-aws-s3-bucket-and-uploading-and-getting-files-using-express-js-part-2-b418b61c5739

//We also have to implement Single Origin call (for only our front-end app)
//We also have to implement a method which deletes files from both MongoDB and amazon S3 after 5 days

var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var fileUpload = require("express-fileupload");
var AWS = require("aws-sdk");

// Enter copied or downloaded access ID and secret key here for accessing amazon S3
const ID = '';
const SECRET = '';

// The name of the bucket that you have created
const bucketName = '';

AWS.config.update({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: process.env.region
})

var s3 = new AWS.S3();      //*



var Record = require("./models/record");
var File = require("./models/file");

var MongoDB = "";

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



app.post("/records/:key",(req,res,next)=>{

    Record.find(req.params.key)
    .exec(function(err,record){
        if(err){
            return next(err);
        }
        if(record==null){
            var err = new Error("Record not found");
            err.status = 404;
            return next(err);
        }
        if(record.age>432,000,000){
            res.status(404).send("Record deleted");
        }

        File.find({record:record.key})
        .exec(function(err,files){
            if(err){
                return next(err);
            }
            if(files==null){
                var err = new Error("Files not found");
                err.status = 404;
                return next(err);
            }

            var responseFiles = [];     //*

            for(var i = 0; i<files.length; i+=1){
                var params = {
                    Bucket: bucketName,
                    Key: files[i].key
                }

                s3.getObject(params,function(err,data){
                    if(err){
                        return next(err);
                    }

                    responseFiles.push({
                        name: files[i].name,
                        key: files[i].key,
                        file: data.body
                    })
                })
            }

            res.send(responseFiles);
        })
    })
})

app.post("/records",(req,res,next)=>{
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

            var recordKey = record.key;     //*

            for (var i = 0; i<req.files.entries.length; i++){
                var fileBuffer = req.files.entries[i];      //*
                
                var file = new File({
                    record:recordKey,
                    name:req.files.entries[i].name
                })

                file.save(function(err){
                    if(err){
                        res.status(500).send(err);
                    }
                })

                var fileKey = file.key;     //*

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
                    //code to extract data.location to link field of the current file database object (I believe it is optional)
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

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.send(err);
  });

app.listen(port,(req,res)=>{
    console.log("Server running at port -"+port);
})