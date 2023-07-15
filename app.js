//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose coonecting with database
mongoose.connect("mongodb+srv://askdhruv:9899226875@cluster0.7btlokt.mongodb.net/todolistDB");

//creating a new schema
const itemSchema = ({
  name: String
});

//creating the new model
const Item = mongoose.model("Item", itemSchema);

//creating new values
const item1 = new Item({
  name: "Welcome to your ToDo lists!"
});
const item2 = new Item({
  name: "Hit the + button to new item."
});
const item3 = new Item({
  name: "<-- Hit this checkbox to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  
  Item.find({}).then(function(foundItems){
    
    if(foundItems.length === 0){
      
      Item.insertMany(defaultItems)
          .then(function(){
             console.log(err);
           })
           .catch(function (err) {
             console.log("Succesfully saved default items");
           });
           res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();
  
  res.redirect("/");

});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem)
      .then((removedItem) => {
        // Item successfully removed
        res.redirect("/");
      })
      .catch((error) => {
        // Error occurred during removal
        // Handle the error appropriately
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } }
    )
      .then((foundList) => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        // Handle error
        // Handle the error appropriately
      });
  }
});


app.get("/:postName", function(req,res){
  const customListName = _.capitalize(req.params.postName);

  List.findOne({ name: customListName })
  .then(foundList => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      res.redirect("/" + customListName);
    list.save();
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  })
  .catch(err => {
    console.error(err);
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
