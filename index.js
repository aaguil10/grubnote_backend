const functions = require("firebase-functions");
const admin = require("firebase-admin");

const users_function = require("./users.js");
const recipe_function = require("./recipe.js");

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.recipe = functions.https.onRequest(recipe_function(db));
exports.users = functions.https.onRequest(users_function(db));
