//References - https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
//References - https://attacomsian.com/blog/uploading-files-nodejs-express

//References - https://anikislam.medium.com/setting-up-aws-s3-bucket-and-uploading-and-getting-files-using-express-js-part-2-b418b61c5739

//We also have to implement Single Origin call (for only our front-end app)
//We also have to implement a method which deletes files from both MongoDB and amazon S3 after 5 days

require('dotenv').config()
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
var express = require("express");
var fileUpload = require("express-fileupload");

const app = express();
app.use(fileUpload());
app.use(cors(corsOptions)) 

//make database connection
var mongoose = require("mongoose");

const MongoDB = "mongodb+srv://m-001-student:m001-mongodb@sandbox.zoqk7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(MongoDB,{useNewUrlParser:true, useUnifiedTopology: true})

var db = mongoose.connection;
db.on('error',console.error.bind(console,"Connection Error"))


const {uploadFile,getUploadFile,getDownloadUrl} = require('./s3.js')
var Record = require("./models/record");
var File = require("./models/file");


const port = (process.env.port || 3001);

//import the micriservice
require('./microService')


app.use(express.json())
app.use(express.urlencoded(
   { extended:false}
))




app.post("/records", async (req,res,next)=>{

    try{
        
        if(!req.files){
            res.status(400).json({
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

            }))

            //send response back to the reciever
            res.status(201).json({key:recordKey})
                    
        
        }
    } catch (error){
        console.log(error)
        res.status(500).json({error:error});
    }
})


app.get("/records/:key", async (req,res)=>{

    try{
        if(req.params.key.length == 24){
            console.log(req.params.key.length)
            const record = await Record.findById(req.params.key)
          
        
            if(record == null){

                res.status(404).json({message:"Record not found"})

            }else{

                if(record.age >= process.env.MAX_TIME){
                    res.status(400).send("Record deleted");
                }
                else{
                    const files = await File.find({record:record.key})
                    if(files==null){
                        res.status(404).json({message:"Files not found"})
                    }
                
                    var responseFiles = [];     //*

                    for(var i = 0; i<files.length; i+=1){
                        const result = await getDownloadUrl(files[i].key);
                        
                        responseFiles.push({file:result, name:files[i].name})
                    }
                    
                    res.status(200).json({files:responseFiles});
        
                }

            } 
        }else{
            res.status(404).json({message:"Invalid Key"})
        }  

    }catch(e){
        console.log(e)
        res.status(500).json({error:error})
    }
    
    
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
