var express = require("express");
var app = express();
var PORT = 8080;
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.set('trust proxy', 1);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["key1"]
}));


//creates random URL and random userID
function generateRandomString() {
  var string = "";
  var alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 7; i++) {
    string += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return string;
};

//Database of users
var urlDatabase = {
  "b2xVn2": {
    fullURL: "http://www.lighthouselabs.ca",
    userID: "a12b3d"
  } ,
  "9sm5xK": {
    fullURL: "http://www.google.com",
    userID: "123456"
  },
  "jNxA7ju": {
    fullURL: "http://www.facebook.com",
    userID: "abcdef"
  },
  "G29kx2": {
    fullURL: "http://wwww.reddit.com",
    userID: "a12b3d"
  }
};

//Database of urls
const users = {
  "abcdef": {
    id: "abcdef",
    email: "user@example.com",
    password: "$2b$10$TQ3a7ZP303NCxQaAqgElv.ZldZLHVhloFPtPsFYaWQcGivmTh351i"
  },
 "123456": {
    id: "123456",
    email: "user2@example.com",
    password: "$2b$10$szPv93KEanJAcaAnZqK8B.F0mUakbnpUlmV3DtViu2Wu2LR3j67Eq"
  },
  "a12b3d": {
    id: "a12b3d",
    email: "alissa.balge@gmail.com",
    password: "$2b$10$fU7JNvaGnxPzdCz/JYeBL.D4FXK3CZX3pp8QwvhSA3UXOUMtHuwm."

  }
};

//GET for /
app.get("/", (req, res) => {
  if (req.session.user_id === undefined ) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//MAINPAGE, lists all urls with edit and delete button
app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined ) {
    res.status(403);
    res.send("you are not logged in!");
  } else {
  var userLinks = {};
  var userToken = req.session.user_id;
  //function returns users specific urls
  function urlsForUser() {
    for (var tiny in urlDatabase) {
      if(userToken === urlDatabase[tiny].userID) {
        userLinks[tiny] = {};
        userLinks[tiny].fullURL = urlDatabase[tiny].fullURL;
        userLinks[tiny].userID = urlDatabase[tiny].userID;
      }
    } return userLinks;
  }
  urlsForUser();
  //page renders with user email and user links
  let templateVars = {urls: userLinks, userObject: users[userToken].email};
  res.render("urls_index", templateVars);
  }
});

//LOGIN post, your logs in with email and password
app.post("/login", (req, res) => {
//function checks for matching user email and password, it returns with the users userID
  function userAuth () {
  for (var key in users) {
    if((users[key].email === req.body.email) && (bcrypt.compareSync(req.body.password, users[key].password))) {
      return key;
    }
  }
    res.status(403);
    res.send("wrong email or wrong password");
}
  var foundUserID = userAuth();
  req.session.user_id = foundUserID;
  res.redirect("/urls");

});


//LOGOUT button
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//REGISTRATION page render
app.get("/register", (req, res) => {
  if (req.session.user_id !== undefined ) {
    res.redirect("/urls");
  }
  var userToken = req.session.user_id;
  let templateVars = {userObject: ""};
  res.render("register", templateVars);
});


//LOGIN page render
app.get("/login", (req, res) => {
  if (req.session.user_id !== undefined ) {
    res.redirect("/urls");
  }
  var userToken = req.session.user_id;
  let templateVars = {userObject: ""};
  res.render("login", templateVars);
});

//REGISTRSTION page submisson
app.post("/register", (req, res) => {
//function checks for duplicate emails
 function duplicateEmail () {
    var match = false;
     for (var key in users) {
      if (users[key].email === req.body.email) {
        match = true;
        return match;
      }
    }
  };
  var match = duplicateEmail();
//checks if new user has entered a vaild email and password.
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('please enter an email AND password');
  //returns error if there was an email match
  } else if (match === true) {
      res.status(400);
      res.send('this email is already registered');
  // if the registration info passes all the checks, a new account will be created.
  } else {
    var randomID = generateRandomString();
    users[randomID]= {};
    users[randomID].id = randomID;
    users[randomID].email = req.body.email;
    var realPassword = req.body.password;
    var hashedPassword = bcrypt.hashSync(realPassword, 10);
    users[randomID].password = hashedPassword;
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});


//NEW URL, page that allows a new url to be submitted
app.get("/urls/new", (req, res) => {
  var userToken = req.session.user_id;
  if (userToken === undefined) {
    res.redirect("/login");
  } else {
  let templateVars = {userObject: users[userToken].email};
  res.render("urls_new", templateVars);
  }
});

//CHANGES/UPDATES an exsiting tiny url by editing the long url
app.post("/urls", (req, res) => {
  var userToken = req.session.user_id;
  var tiny = generateRandomString()
  urlDatabase[tiny] = {};
  urlDatabase[tiny].fullURL = req.body.longURL;
  urlDatabase[tiny].userID = userToken;
  res.redirect("/urls/" + tiny);
});


//REDIRECTS TO LONG URL, when tinyURL is entered into the broswer, it will redirect to the long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].fullURL;
  res.redirect(longURL);
});

//DELETE button removes url from /urls
app.post("/urls/:id/delete", (req, res) => {
  var userToken = req.session.user_id;
  if (userToken === urlDatabase[req.params.id].userID) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
  } else {
    res.status(403);
    res.send("this is not your url");
  }
});

//EDIT button redirects to unqiue tinyURL page, where user can change the URL
app.get("/urls/:id/edit", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});

//EDIT user can type new url and it will update it, and redirect to /urls
app.post("/urls/:id", (req, res) => {
  var userToken = req.session.user_id;
  if (userToken === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].fullURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("this is not your url");
  }
});

//ID, displays the tiny url and full url when unique id is entered into the browser
app.get('/urls/:id', function(req, res) {
  var userToken = req.session.user_id;
   if (userToken === undefined) {
    res.status(403);
    res.send("you are not logged in");
  } else if (userToken === urlDatabase[req.params.id].userID) {
    res.render('urls_shows', {tinyURL: req.params.id, URL: urlDatabase[req.params.id].fullURL, userObject:users[userToken].email});
  } else {
   res.status(403);
    res.send("this is not your url");
  }
});


app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});
