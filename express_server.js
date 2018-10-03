var express = require("express");
var app = express();
var PORT = 8080;
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs");


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

function generateRandomString() {
  var string = "";
  var alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 7; i++) {
    string += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return string;
};




var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "jNxA7ju": "http://www.facebook.com"
};

app.get("/", (req, res) => {
  res.send("<hmtl><body>hello <b>world</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
res.cookie('username', req.body.username);
console.log(req.body.username);
res.redirect("/urls");

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});

app.post("/urls/:id/change", (req, res) => { //changen URL
  urlDatabase[req.params.id] = req.body.longURL;
  //console.log("req", req.body.longURL);
res.redirect("/urls");
});

app.get('/urls/:id', function(req, res) {
  res.render('urls_shows', {tinyURL: req.params.id, URL: urlDatabase[req.params.id], username: req.cookies["username"],});
});


app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`)
});
