#!/usr/bin/env node
var express = require('express');
var app = express.createServer();
var mongo = require('mongoskin');
var ent = require('ent');

var root = require('./views/index');

root.add_function('short', function(input, args){
    return input.substr(0, (args[0]||60) - 3) + ((input.length > (args[0]||60)) ? '...' : '');
});
root.add_function('e', function(input, args){
    return ent.encode(input);
});

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.static(__dirname+'/public'));

var shit = mongo.db('localhost:27017/thisisshit').collection('shit');

app.get('/', function(req, res){
    shit.find().sort({count: -1}).limit(10).toArray(function(er,results){
        root.create_child({shits: results}).render('index.html', function(error, data){
            res.send(data);
        });
    });
});

app.get('/shit', function(req, res){
    if(typeof req.param('url') == 'undefined'){
        console.log('muzt b haqrz'); 
        res.send(400);
        return;
    }
    console.log('User Requesting: '+ req.param('url'))
    shit.find({url: req.param('url')}, function(er,sh){
        if(er) {
            res.send(500);
            console.log('Mongo Error: '+ er.message);
            return;
        }
        sh.toArray(function(er, data){
            if(er) {
                res.send(500);
                console.log('Mongo Error: '+ er.message);
                return;
            }
            res.json({urls: data });
        });
    });
});

app.post('/shit', function(req, res){
    url = req.param('url');
    if(url){
        console.log('User thinks '+ url + ' is shit info');
            doc = { url: url, count: 0 }
            shit.save(doc, {upsert: true}, function(er,sh){
            if(er) {
                res.send(500)
                console.log('Mongo Error: '+ er.message);
                return;
            }
            shit.findAndModify({url: url}, {}, { $inc: { count: 1 }}, function(er,sh){
                if(er) {
                    console.log('Mongo Error: '+ er.message);
                    return;
                }
                res.json(doc);
                console.log('Successfully Incrimented: '+ url);
            });
        });
    }
});
app.listen(8085, '127.0.0.1');

