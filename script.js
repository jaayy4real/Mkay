// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCRc08svWmareHp8gZXvWo26A5b2zhTF-M",
    authDomain: "blog-51fe5.firebaseapp.com",
    projectId: "blog-51fe5",
    storageBucket: "blog-51fe5.appspot.com",
    messagingSenderId: "294772367786",
    appId: "1:294772367786:web:e392625626e98e129a8bd3",
    measurementId: "G-ENJF7MNVFL"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);