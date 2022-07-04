const {deleteUploadFile} = require('./s3.js')
var Record = require("./models/record");
var File = require("./models/file");
require('dotenv').config()


setInterval(async ()=>{
    
    try{
       let record  = await Record.find({});
       if(record){

            for(let i=0;i<record.length;i++){
                
                if( record[i].age >= 432000000){
                    let files = await File.find({record:record[i].id});
    
                    if(files){
                        for(let j=0;j<files.length;j++){

                            const result = await deleteUploadFile(files[j].key);
                            await File.findByIdAndRemove(files[j]._id)
                            console.log('File deleted'+ result)
                        }
                    }    
                }
                
            } 
            
       }    
    }    
     catch(e){
       console.log(e)
   }

},900000)

