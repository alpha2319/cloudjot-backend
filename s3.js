var AWS = require("aws-sdk");
var fs = require('fs')
require('dotenv').config();

// Enter copied or downloaded access ID and secret key here for accessing amazon S3
const ID = process.env.AWS_ACCESS_KEY
const SECRET = process.env.AWS_SECRET_KEY
const region = process.env.AWS_BUCKET_REGION
const bucket = process.env.AWS_BUCKET_NAME


AWS.config.update({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: region
})

var s3 = new AWS.S3();


//upload a file to s3
function uploadFile(file){
   
    const uploadParams ={
        Bucket:bucket,
        Body:file.data,
        Key:Date.now() +"-"+ file.name,
        ContentType:file.mimetype
    }

    return s3.upload(uploadParams).promise()
}

exports.uploadFile = uploadFile


//download a file from s3
function getUploadFile(fileKey){

    const downloadParams = {
        Bucket :bucket,
        Key: fileKey
    }

    return s3.getObject(downloadParams).promise()
}

exports.getUploadFile = getUploadFile

function getDownloadUrl(fileKey){
    const downloadParams = {
        Bucket :bucket,
        Key: fileKey
    }

    return s3.getSignedUrl("getObject",downloadParams);
}
exports.getDownloadUrl = getDownloadUrl;

//delete file from s3
function deleteUploadFile(filekey){

    const deleteParams = {
        Bucket : bucket,
        Key: filekey
    }
    
    return s3.deleteObject(deleteParams).promise();
}

exports.deleteUploadFile = deleteUploadFile
