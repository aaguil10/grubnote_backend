const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

app.post("/insert", (req, res) => {
  //var obj = JSON.parse(req.body);
  var obj = req.body;

  let data = {
    title: obj.title,
    subtitle: obj.subtitle,
    ingredients: obj.ingredients,
    steps: obj.steps,
    notes: obj.notes
  };

  var setDoc = "";
  if (obj.id.includes("new")) {
    setDoc = db.collection("recipes").add(data);
  } else {
    setDoc = db
      .collection("recipes")
      .doc(obj.id)
      .set(data);
  }

  res.send(setDoc);
});

app.get("/getrecipes", (req, res) => {
  const recipes = [];
  let collectionGroup = db.collectionGroup("recipes");
  collectionGroup
    .get()
    .then(collectionSnapshot => {
      collectionSnapshot.forEach(doc => {
        const d = doc.data();
        d.id = doc.id;
        recipes.push(d);
      });
      res.send(recipes);
      return true;
    })
    .catch(err => {
      console.log("Error getting document", err);
      res.send("Error getting document");
    });
});

exports.recipe = functions.https.onRequest(app);

const users = express();
users.use(cors({ origin: true }));

users.post("/getUser", (req, res) => {
  //var obj = JSON.parse(req.body);
  var obj = req.body;
  console.log(obj);
  console.log(obj.sub);

  let subQuery = db
    .collection("users")
    .where("subs", "array-contains", obj.sub);
  let user = subQuery
    .get()
    .then(querySnapshot => {
      let search_results = [];
      querySnapshot.forEach(doc => {
        console.log(doc.id, " => ", doc.data());
        search_results.push(doc.data());
      });
      if (search_results.length === 0) {
        addUser(obj)
          .then(result => {
            db.collection("users")
              .where("subs", "array-contains", obj.sub)
              .get()
              .then(snapshot => {
                console.log(snapshot.docs);
                res.send(snapshot.docs[0].data());
                return true;
              })
              .catch(error => {
                console.log(error);
                res.send(error);
              });
            return true;
          })
          .catch(error => {
            console.log(error);
            return true;
          });
        return false;
      } else {
        console.log("***Real Data***");
        console.log(querySnapshot.docs[0].data());
        res.send(querySnapshot.docs[0].data());
        return false;
      }
    })
    .catch(err => {
      console.log(err);
    });

  // var setDoc = "";
  // if (obj.id.includes("new")) {
  //   setDoc = db.collection("recipes").add(data);
  // } else {
  //   setDoc = db
  //     .collection("recipes")
  //     .doc(obj.id)
  //     .set(data);
  // }
});

let getUserWithSub = sub => {
  return db
    .collection("users")
    .where("subs", "array-contains", sub)
    .get()
    .then(snapshot => {
      console.log(snapshot.docs);
      return snapshot.docs[0];
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};

let addUser = obj => {
  let data = {
    first_name: obj.given_name,
    last_name: obj.family_name,
    user_name: obj.nickname,
    email: obj.email,
    picture: obj.picture,
    subs: [obj.sub]
  };
  return db.collection("users").add(data);
};

users.post("/addUser", (req, res) => {
  //var obj = JSON.parse(req.body);
  var obj = req.body;
  console.log(obj);
  console.log(obj.sub);

  let data = {
    first_name: obj.given_name,
    last_name: obj.family_name,
    user_name: obj.nickname,
    email: obj.email,
    picture: obj.picture,
    subs: [obj.sub]
  };
  db.collection("users").add(data);
  res.send("Added User!");
});

exports.users = functions.https.onRequest(users);
