const express = require("express");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");

var MongoDB = "";   //*

mongoose.connect(MongoDB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
db.on("error",console.error.bind("MongoDB connection error"));

const port = (process.env.port || 3000);

const app = express();

app.use(bodyParser.json());

app.post("/records/:key",(req,res)=>{
    console.log("This function is not implemented yet ...");    //*
})

app.post("/records",(req,res)=>{
    console.log("This function is not implemented yet ...");    //*
})

app.use((req,res,next)=>{
    return next(createError(404));
})

app.listen(port,(req,res)=>{
    console.log("Server running at port -"+port);
})