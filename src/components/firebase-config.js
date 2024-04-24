import { initializeApp } from "firebase/app";
import { getAuth ,GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCmRrWKmJ2mIsYIwBVEN6I8gl9piBYgtTM",
    authDomain: "forms-e3ec1.firebaseapp.com",
    projectId: "forms-e3ec1",
    storageBucket: "forms-e3ec1.appspot.com",
    messagingSenderId: "103558052498",
    appId: "1:103558052498:web:6dc7e1edb3399e5d2b844b",
    measurementId: "G-S4LJXSZT33"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);

export { auth, googleProvider , database };
console.log(database);
