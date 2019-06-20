const express = require("express");
const cors = require("cors");

const recipe_function = db => {
  const app = express();
  app.use(cors({ origin: true }));

  app.post("/insert", (req, res) => {
    //var obj = JSON.parse(req.body);
    var obj = req.body;

    let data = {
      title: obj.title,
      subtitle: obj.subtitle,
      ingredients: obj.ingredients,
      steps: obj.steps,
      notes: obj.notes,
      created_by: obj.created_by
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

  app.post("/getrecipes", (req, res) => {
    const user_id = req.body.user_id;

    const userRef = db.collection("users").doc(req.body.user_id);
    userRef
      .get()
      .then(doc => {
        return doc.data();
      })
      .then(data => {
        let isUpToDate = new Set(data.isUpToDate);
        let device_id = req.headers.authorization
          .split(" ")[1]
          .replace(/"/g, "");
        if (isUpToDate.has(device_id)) {
          console.log("Device up to date");
          res.send("Device up to date");
          return "Device up to date";
        } else {
          userRef.set(
            {
              isUpToDate: [...isUpToDate]
            },
            { merge: true }
          );
          return getRecipes(res, user_id);
        }
      })
      .catch(error => {
        console.log("Error occurred:", error);
        res.send("Error occurred:" + error);
        return "Error occurred:" + error;
      });
  });

  function getRecipes(res, user_id) {
    const recipes = [];
    let collectionGroup = db
      .collection("recipes")
      .where("created_by", "==", user_id);
    collectionGroup
      .get()
      .then(collectionSnapshot => {
        collectionSnapshot.forEach(doc => {
          const d = doc.data();
          d.id = doc.id;
          console.log(d);
          recipes.push(d);
        });
        res.send(recipes);
        return recipes;
      })
      .catch(err => {
        const e = "Error getting recipes:" + err;
        console.log(e);
        res.send(e);
        return e;
      });
  }

  return app;
};

module.exports = recipe_function;
