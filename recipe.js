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
    let user_id = req.body.user_id;

    addDevceIdToUser(req);

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

  function addDevceIdToUser(req) {
    var userRef = db.collection("users").doc(req.body.user_id);
    userRef
      .get()
      .then(doc => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
        return doc.data();
      })
      .then(data => {
        let isUpToDate = new Set(data.isUpToDate);
        let device_id = req.headers.authorization
          .split(" ")[1]
          .replace('"', "")
          .replace('"', "");
        isUpToDate.add(device_id);
        var setWithMerge = userRef.set(
          {
            isUpToDate: [...isUpToDate]
          },
          { merge: true }
        );
        return setWithMerge;
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  return app;
};

module.exports = recipe_function;
