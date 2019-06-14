const express = require("express");
const cors = require("cors");

const users_function = db => {
  console.log("Called users_function");
  const users = express();
  users.use(cors({ origin: true }));

  users.post("/getUser", (req, res) => {
    console.log("getUser");
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
          search_results.push(doc.data());
        });
        if (search_results.length === 0) {
          addUser(obj)
            .then(result => {
              db.collection("users")
                .where("subs", "array-contains", obj.sub)
                .get()
                .then(snapshot => {
                  res.send(snapshot.docs[0].data());
                  return true;
                })
                .catch(error => {
                  res.send(error);
                });
              return true;
            })
            .catch(error => {
              res.send(error);
              return true;
            });
          return false;
        } else {
          res.send(querySnapshot.docs[0].data());
          return false;
        }
      })
      .catch(err => {
        res.send(err);
      });
  });

  let addUser = obj => {
    console.log("addUser");
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

  return users;
};

module.exports = users_function;
