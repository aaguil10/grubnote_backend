const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


const app = express();
app.use(cors({ origin: true }));

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();


app.get('/', function (req, res) {
  res.send('It Worked!')
});

app.post('/insert', (req, res) => {


	var obj = JSON.parse(req.body);

	let data = {
	  id: obj.id,
	  title: obj.title,
	  subtitle: obj.subtitle,
	  ingredients: obj.ingredients,
	  steps: obj.steps,
	  notes: obj.notes
	};


	var setDoc = db.collection('recipes').doc(obj.id).set(data);

  	res.send(data);  
});


app.get('/getrecipes', function (req, res) {
	const recipes = [];
	let collectionGroup = db.collectionGroup('recipes');
	collectionGroup.get().then(
		function(collectionSnapshot) {
  		collectionSnapshot.forEach(function(doc) {
	   		recipes.push(doc.data())
  		});
  		res.send(recipes);
   		return true;
	}).catch(err => {
		console.log('Error getting document', err);
		res.send('Error getting document');
	});
	
});

exports.recipe = functions.https.onRequest(app);