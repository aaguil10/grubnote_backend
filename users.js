const express = require("express");
const cors = require("cors");

const users_function = db => {
  const users = express();
  users.use(cors({ origin: true }));

  users.post("/getUser", async (req, res) => {
    var obj = req.body;

    let querySnapshot = await db
      .collection("users")
      .where("subs", "array-contains", obj.sub)
      .get();
    let search_results = [];
    querySnapshot.forEach(doc => {
      const user_obj = doc.data();
      user_obj.id = doc.id;
      search_results.push(user_obj);
    });
    if (search_results.length === 0) {
      await createUser(obj);
      const snapshot = await db
        .collection("users")
        .where("subs", "array-contains", obj.sub)
        .get();
      const user_obj = snapshot.docs[0].data();
      user_obj.id = snapshot.docs[0].id;
      res.send(user_obj);
    } else {
      res.send(search_results[0]);
      return false;
    }
  });

  let createUser = obj => {
    let data = null;
    let provider = obj.sub.split("|")[0];
    if (provider === "google-oauth2" || provider === "facebook") {
      data = {
        first_name: obj.given_name,
        last_name: obj.family_name,
        user_name: obj.nickname,
        email: obj.email,
        picture: obj.picture,
        isUpToDate: [],
        subs: [obj.sub]
      };
    }
    if (provider === "auth0") {
      data = {
        first_name: obj.nickname,
        last_name: "",
        user_name: obj.nickname,
        email: obj.email,
        picture: obj.picture,
        isUpToDate: [],
        subs: [obj.sub]
      };
    }
    return db.collection("users").add(data);
  };

  users.post("/addUser", (req, res) => {
    //var obj = JSON.parse(req.body);
    var obj = req.body;

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

  return users;
};

module.exports = users_function;
