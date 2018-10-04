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


/*var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "jNxA7ju": "http://www.facebook.com"
};
*/

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


const users = {
  "abcdef": {
    id: "abcdef",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "123456": {
    id: "123456",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "a12b3d": {
    id: "a12b3d",
    email: "alissa.balge@gmail.com",
    password: "1234"

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
  var userToken = req.cookies.user_id;
  let templateVars = {urls: urlDatabase, userObject: users[userToken].email}; //need to fix this to .email
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});

//login form post
app.post("/login", (req, res) => {
  //res.cookie("user_id", randomID);

  function findUserEmail () {
    var found = false;
     for (var key in users) {
      if (users[key].email === req.body.email) {
        found = true;
        return found;
      }
    }
  };

  function findUserPassword () {
    var match = false;
     for (var info in users) {
      console.log("this the password saved ", users[info].password)
      console.log("this is my password ", req.body.password)
      if (users[info].password === req.body.password) {
        match = true;
        return match;
     }
    }

  };
    var emailFound = findUserEmail();
    var passwordFound = findUserPassword();

    if (emailFound === false) {
      es.status(403);
      res.send("Email not found");
    } else {
      if (passwordFound === false) {
        res.status(403);
        res.send("Password does not match email");
      } else {
          for (var key in users) {
            if (users[key].email === req.body.email) {
              res.cookie("user_id", key)
              res.redirect("/urls");
            }
          }
        }
      }
  });


//logout button
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//registration page render
app.get("/register", (req, res) => {
var userToken = req.cookies.user_id;
let templateVars = {userObject: users[userToken]}; //need to fix this to .email???
  res.render("register", templateVars);
});


//login page render
app.get("/login", (req, res) => {
var userToken = req.cookies.user_id;
let templateVars = {userObject: users[userToken]}; //need to fix this to .email???
  res.render("login", templateVars);
});

//registration page submisson
app.post("/register", (req, res) => {

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
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('Please enter an email and password');
  } else if (match === true) {
      res.status(400);
      res.send('Email is already register');
  } else {
    var randomID = generateRandomString();
    users[randomID]= {};
    users[randomID].id = randomID;
    users[randomID].email = req.body.email;
    users[randomID].password = req.body.password;
    console.log(users);
    res.cookie("user_id", randomID)
    res.redirect("/urls");
  }
});


//page that allows a new url to be submitted
app.get("/urls/new", (req, res) => {
  var userToken = req.cookies.user_id;
  if (userToken === undefined) {
    res.redirect("/login");
  } else {
  let templateVars = {userObject: users[userToken].email}; //need to fix this to .email
  //console.log("this is new", templateVars);
  res.render("urls_new", templateVars);
  }
});

app.post("/urls/new", (req, res) => {
var userToken = req.cookies.user_id;
var tiny = generateRandomString()
urlDatabase[tiny] = {};
urlDatabase[tiny].fullURL = req.body.longURL;
urlDatabase[tiny].userID = userToken;
console.log(urlDatabase);
res.redirect("/urls/" + tiny);
})

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//when tinyURL is entered into the broswer, it will redirect to the full url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//DELETE button removes url from hompage
app.post("/urls/:id/delete", (req, res) => {
  var userToken = req.cookies.user_id;
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

//EDIT user can type new url and it will update it, and redirect to the homepage
app.post("/urls/:id/change", (req, res) => { //changen URL
  var userToken = req.cookies.user_id;
  if (userToken === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].fullURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("this is not your url");
  }

});

//displays the tiny url and full url when unique id is entered into
app.get('/urls/:id', function(req, res) {
  var userToken = req.cookies.user_id;
  res.render('urls_shows', {tinyURL: req.params.id, URL: urlDatabase[req.params.id].fullURL, userObject:users[userToken].email}); //need to fix this to .email
});


app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`)
});
