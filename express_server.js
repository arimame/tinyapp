var express = require("express");
var app = express();
var PORT = 8080;
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs");


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//creates random URL
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


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("<hmtl><body>hello <b>world</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//homepage, lists all urls with edit and delete button
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//login form
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls");
});

//logout button
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//registration page render
app.get("/register", (req, res) => {
let templateVars = {username: req.cookies["username"]};
  res.render("register", templateVars);
});

//registration page submisson
app.post("/register", (req, res) => {
  if (req.body.email === undefined || req.body.password === undefined) {
    res.status(400);
    res.send('Please enter a password');
} else {
    var randomID = generateRandomString();
    users[randomID]= {};
    users[randomID].id = randomID;
    users[randomID].email = req.body.email;
    users[randomID].password = req.body.password;
//console.log(users);
res.cookie("user_id", randomID)
res.redirect("/urls");
}


});


//page that allows a new url to be submitted
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//when tinyURL is entered into the broswer, it will redirect to the full url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//delete button removes url from hompage
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//edit button redirects to unqiue tinyURL page, where user can change the URL
app.get("/urls/:id/edit", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});

//user can type new url and it will update it, and redirect to the homepage
app.post("/urls/:id/change", (req, res) => { //changen URL
  urlDatabase[req.params.id] = req.body.longURL;
  //console.log("req", req.body.longURL);
res.redirect("/urls");
});

//displays the tiny url and full url when unique id is entered into
app.get('/urls/:id', function(req, res) {
  res.render('urls_shows', {tinyURL: req.params.id, URL: urlDatabase[req.params.id], username: req.cookies["username"]});
});


app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`)
});
