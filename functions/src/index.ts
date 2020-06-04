import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firebase = admin.initializeApp();
const inc = admin.firestore.FieldValue.increment(1);
const dec = admin.firestore.FieldValue.increment(-1);
const db = firebase.firestore();
const statsRef = db.collection("movies").doc("--stats--");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
exports.deleteFiles = functions.firestore
  .document("/movies/{movieId}")
  .onDelete(async (snapshot) => {
    const data = await snapshot.data();
    if (data) {
      const bucket = firebase.storage().bucket();
      data.screens.map((screen: any) => {
        const paths = [];
        if (screen.path) {
          paths.push(screen.path);
        }
        if (screen.name) {
          paths.push(
            `screens/${screen.name}`,
            `screens/thumbs/${screen.name}_500x500`
          );
        }
        paths.map((p) => bucket.file(p).delete());
      });
      statsRef.update({ totalAmount: dec }).catch((e) => console.log(e));
    }
  });

exports.incrementMovieAmount = functions.firestore
  .document("/movies/{movieId}")
  .onCreate(() => {
    return statsRef.update({ totalAmount: inc }).catch((e) => console.log(e));
  });
