const {uploadFile,getUploadFile,deleteUploadFile} = require('./s3.js')
var Record = require("./models/record");
var File = require("./models/file");
require('dotenv').config()


setInterval(async ()=>{
    try{
       let record  = await Record.find({});
        
       if( record.age >= process.env.MAX_TIME){

            let files = await File.find({record:record.id});

            if(files){

                const result = deleteUploadFile(file.key);
                await File.deleteById(files._id)
                
                console.log('File deleted'+ result)
            }
        }
    }    
     catch(e){
       console.log(e)
   }

},3000)