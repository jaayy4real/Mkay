const express = require('express')
// const { getAnalytics } = require('firebase/analytics')
const firebase = require('firebase/app')
const { getFirestore, collection, addDoc, getDocs, doc, getDoc } = require("firebase/firestore");
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

// let media
app.post("/addPost", upload.array('mediaFiles') ,async (req, res) => {
 
 const media = req.files[0].mimetype;

  
  try {
     const { title, body } = req.body;
     const mediaURL = [];
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
      media
      
    //   media
    //   created: fir

    });
    res.status(201).send(`post created: ${req.files}`);
  } catch (error) {
    res.status(400).send(`Error creating post: ${error.message}`);
  }
});
// console.log(media);


app.get('/getPost', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "posts"),)
        const posts = []

        for (const doc of querySnapshot.docs){
            const postData = doc.data()

            if (postData.mediaURL && Array.isArray(postData.mediaURL)){
                const fileURL = await Promise.all(
                    postData.mediaURL.map(async (filePath)=>{
                        const fileRef = ref(storage, filePath)
                        const downloadURL = await getDownloadURL(fileRef)
                        return downloadURL;
                    })
                )
                postData.mediaURL = fileURL
            }
            posts.push({id:doc.id, ...postData})
        }
        res.status(200).json(posts)
        
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Error fetching posts: " + error.message);
    }
})

app.get("/getPost/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).send("Post not found");
    }

    const postData = docSnap.data();
    const mediaURLs = [];

    for (const mediaFile of postData.mediaURL) {
      const storageRef = ref(storage, mediaFile);
      const downloadURL = await getDownloadURL(storageRef);
      mediaURLs.push(downloadURL);
    }

    res.status(200).json({ ...postData, mediaURLs });
  } catch (error) {
    console.error("Error retrieving post: ", error);
    res.status(500).send(`Error retrieving post: ${error.message}`);
  }
});



app.listen(3000, ()=>{
    console.log("listening or running at port 3000");
    
})

// firebase.
