const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const app = express();
const dat = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/todolistDb", {useNewUrlParser : true});
mongoose.set('strictQuery', false);

const itemsSchema = new mongoose.Schema({
    name : String
});

const listSchema = new mongoose.Schema({
    name : String,
    item : [itemsSchema]
});

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name : "Welcome to ToDo list"
});
const item2 = new Item({
    name : "Hit the + button to add new item"
});
const item3 = new Item({
    name : "<--- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res){

    Item.find({}, function(err, items){
        if(items.length === 0){
            Item.insertMany(defaultItems, function(err){});
            res.redirect("/");
        }else{
            res.render('list', {today : "Today", element : items});     
        }
    });
});

app.post("/", function(req, res){
    const itemTask = req.body.task;
    const itemTitle = _.capitalize(req.body.button);

    const itemNew = new Item({
        name : itemTask
    });
    if(itemTitle === "Today"){
        itemNew.save();
        res.redirect("/");
    }else{
        List.findOne({name : itemTitle}, function(err, lst){
            lst.item.push(itemNew);
            lst.save();
            res.redirect("/" + itemTitle);
        });
    }
});

app.post('/delete', function(req, res){
    const checkedItem = req.body.checkbox;
    const title = req.body.heading;
    if(title === "Today"){
        Item.deleteOne({_id : checkedItem}, (err) => {
            if(!err)
                res.redirect("/");
        });
    }else{
        List.findOneAndUpdate({ name: title }, { $pull: { item : {_id: checkedItem} } }, function(err, foundList){
            if(!err){
                res.redirect("/" + title);
            }
        });
    }
})

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName}, function(err, items){
        if(!err){
            if(!items){
                const lst = new List({
                    name : customListName,
                    item : defaultItems
                });
                lst.save();
                res.redirect("/" + customListName);
            }else{
                res.render("list", {today : items.name, element : items.item})
            }
        }
    })
})

app.get('/about', function(req, res){
    res.render('about', {});
})

app.listen(3000, function(){
    console.log("Port started at 3000");
});