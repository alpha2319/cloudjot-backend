//References - https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
//References - https://attacomsian.com/blog/uploading-files-nodejs-express

//References - https://anikislam.medium.com/setting-up-aws-s3-bucket-and-uploading-and-getting-files-using-express-js-part-2-b418b61c5739

//We also have to implement Single Origin call (for only our front-end app)
//We also have to implement a method which deletes files from both MongoDB and amazon S3 after 5 days

require('dotenv').config()

var express = require("express");
var fileUpload = require("express-fileupload");

const app = express();
app.use(fileUpload());

//make database connection
var mongoose = require("mongoose");

const MongoDB = process.env.DB_URL

mongoose.connect(MongoDB,{useNewUrlParser:true, useUnifiedTopology: true})

var db = mongoose.connection;
db.on('error',console.error.bind(console,"Connection Error"))


const {uploadFile,getUploadFile,deleteUploadFile} = require('./s3.js')
var Record = require("./models/record");
var File = require("./models/file");


const port = (process.env.port || 3001);

//import the micriservice
require('./microService')


app.use(express.json())
app.use(express.urlencoded(
   { extended:false}
))

app.get("/",(req,res)=>{
    console.log('heellloooo')
    res.send('<h1>hello dost</h1>')
    res.end()
})


app.post("/records", async (req,res,next)=>{

    try{
        
        if(!req.files){
            res.status(401).json({
                error: "No file Found in request"
            })
        }

        else{

            
            var record = new Record({
                ipAddress: req.ip
            })

            let data = await record.save();

            var recordKey = data.key;     //*
            console.log(data.key)
            //get files from request
            var fileKey = Object.keys(req.files);

            fileKey.forEach((async (key)=>{
                
                console.log(req.files[key])
                const result = await uploadFile(req.files[key])
                console.log(result)
                //upload file on the database
                const file = new File({
                    location:result.Location,
                    key:result.Key,
                    record:recordKey,
                    name:result.Key
                })

                await file.save()

                console.log(result)

            }))

            //send response back to the reciever
            res.status(201).json({key:recordKey})
                    
        
        }
    } catch (error){
        
        res.status(500).json({error:error});
    }
})


app.get("/records/:key", async (req,res,next)=>{

    Record.findById(req.params.key)
    .exec(function(err,record){

        if(err){
            return next(err);
        }

        if(record==null){
            var err = new Error("Record not found");
            err.status = 404;
            return next(err);
        }

        if(record.age>=process.env.MAX_TIME){
            res.status(404).send("Record deleted");
        }

        else{

            File.find({record:record.key})
            .exec(async function(err,files){
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

                    const result = await getUploadFile(files[i].key);
                    responseFiles.push({file:files[i].location, name:files[i].name})
                    console.log(result)
                }
                
                res.status(200).json({files: responseFiles});
               
            })
        } 
    })
})



app.use((req,res,next)=>{
    return next(createError(404));
})

// error handler
app.use(function(err, req, res, next) {
    res.status(500).json({error:err.message})
  });

app.listen(port,(req,res)=>{
    console.log("Server running at port -"+port);
})
