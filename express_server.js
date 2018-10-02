var express = require("express");
var app = express();
var PORT = 8080;

app.set("view engine", "ejs");


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:id', function(req, res) {
  res.render('urls_shows', {tinyURL: req.params.id, URL: urlDatabase[req.params.id]});
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
