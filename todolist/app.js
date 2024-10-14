const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://hameemshah:hameem-123@hameemcluster.sjw0g5p.mongodb.net/todolistDB", { useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
    name : String
});

const Item = mongoose.model("Item", itemsSchema);

const defaultItems = [{name : "Welcome to your to do list !"},
                            {name : "Hit the + button to add a new item."},
                            {name : "<-- Hit this to delete an item."}
                        ];

const listSchema = {
    name : String,
    items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const day = "Today";

app.get('/', function (req, res) {

    Item.find({}, function(err, docs){
        if(err) return console.log(err);
        else {
            if (docs.length === 0){
                Item.insertMany(defaultItems, function (err
                    ){
                    if (err) return console.log(err);
                    console.log("Sucessfully saved the items to the database.");
                    res.redirect("/");
                });
            }
            else {
                res.render("list", { listTitle: day, newListItem: docs});  
            }
        }
    });
});

app.get('/:customListName', function(req, res) {
    const title = _.capitalize(req.params.customListName);
    
    List.findOne({name : title}, function(err, docs){
        if (docs) {
           res.render("list", {listTitle : docs.name, newListItem : docs.items});
        }
        else{
            const list = new List({
                name : title,
                items : defaultItems
            });
            list.save();
            res.redirect("/" + title);
        }
    });
});

app.get('/about', function(req, res) {
    res.render("about");
})

app.post('/', function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name : itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name : listName}, function(err, docs){
            if (err)  return console.log(err);
            docs.items.push(item);
            docs.save();
            res.redirect("/" + listName);
        });
    }
});

app.post('/delete', function (req, res){

    const deleteId = req.body.check;
    const deleteList = req.body.list;

    if (deleteList === day){
        Item.findByIdAndRemove(deleteId, function(err){
            if (!err) {
                console.log("Item deleted successfully.");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name : deleteList}, {$pull : {items : {_id: deleteId}}},function (err, docs) {
            if (!err) {
                res.redirect("/" + deleteList);
            }
        });
    }
});

app.listen(port, function () {
    console.log(`Server satarted at port ${port}`);
});