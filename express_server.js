var express = require("express");
var app = express();
var PORT = 8080;

app.set("view engine", "ejs");


// var urlDatabase = [

// {tinyURL: "b2xVn2", URL: "http://www.lighthouselabs.ca"},
// {tinyURL: "9sm5xK", URL: "http://www.google.com"},

// ];


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get('/urls/:id', function(req, res) {
  res.render('urls_shows', {tinyURL: req.params.id, URL: urlDatabase[req.params.id]});
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
