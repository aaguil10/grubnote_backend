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
  return app;
};

module.exports = recipe_function;