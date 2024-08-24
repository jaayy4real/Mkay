const express = require('express')
// const { getAnalytics } = require('firebase/analytics')
const firebase = require('firebase/app')
const { getFirestore, collection, addDoc } = require("firebase/firestore");
require('firebase/firestore')
require('firebase/storage')
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
// require('firebase/analytics')
const app = express()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(cors());

const corsOptions = {
  origin: "http://127.0.0.1:5500", // Replace with the allowed origin(s)
  methods: ["GET", "POST"], // Allowed methods
  //   allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));

const firebaseConfig = {
  apiKey: "AIzaSyBCRVniqoHi-2xTaW1Qs1bGDymNlPyuYps",
  authDomain: "mkay-29e5a.firebaseapp.com",
  projectId: "mkay-29e5a",
  storageBucket: "mkay-29e5a.appspot.com",
  messagingSenderId: "398123537742",
  appId: "1:398123537742:web:2690958816323b50e47a1f",
  measurementId: "G-8BPN05MCHN",
};


const firebaseApp = firebase.initializeApp(firebaseConfig)
// const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

const upload = multer({storage: multer.memoryStorage()})

app.post("/addPost", upload.array('mediaFiles') ,async (req, res) => {
 


  
  try {
     const { title, body } = req.body;
     const mediaURL = [];
     console.log(req.body.mediaFile0);
     console.log(req.files);
     console.log(req.body);
     
     

    for (let i = 0; i< req.files.length; i++){
        const file = req.files[i]
        const storageRef = ref(storage, `uploads/${file.originalname}`)
        const uploadTask = uploadBytesResumable(storageRef, file.buffer)
        // const downloadURL = snapshot.ref.getDownloadURL()
        // mediaURL.push(downloadURL)
        await new Promise((resolve, reject)=>{
            uploadTask.on(
                'state_changed',
                null,
                (error) =>{console.error(error);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                        mediaURL.push(downloadURL);
                        resolve();
                    } catch (error) {
                        console.error(error);
                        
                        reject(error)
                    }
                }
            )
        })
        
    }

    console.log(mediaURL);
    
    const docRef = await addDoc(collection(db, "posts"), {
      title,
      body,
      mediaURL,
    //   created: fir

    });
    res.status(201).send(`User added with ID: ${docRef.id}`);
  } catch (error) {
    res.status(400).send(`Error adding user: ${error.message}`);
  }
});

app.listen(3000, ()=>{
    console.log("listening or running at port 3000");
    
})

// firebase.
