const express = require("express");
const firebase = require("firebase/app");
const nodemailer = require("nodemailer");
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
} = require("firebase/firestore");
require("firebase/firestore");
require("firebase/storage");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { log } = require("console");
// const { m } = require("framer-motion");
const pendingCodes = new Map();
const app = express();

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jeffreyekpo54@gmail.com",
    pass: "urdt nivc mgpk zpkd",
  },
});

const firebaseApp = firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const upload = multer({ storage: multer.memoryStorage() });

const generateCode = () =>{
  return crypto.randomInt(100000, 999999).toString().padStart(6, '0');
}

app.post('/request', async (req, res) => {
  const {email} = req.body;

  if(!email){
    return res.status(400).json({ error: "Email is required" });
  }

  const code = generateCode();
  const expiresAt = Date.now() + 15 * 60 * 1000;


  pendingCodes.set(email, {
    code,
    expiresAt
  });

  setTimeout(()=>{
    pendingCodes.delete(email), 15 * 60 * 1000
  })


  try {
     var mailOptions = {
       from: "jeffreyekpo54@gmail.com",
       to: email,
       subject: "Sending Email using Node.js",
       text: `Your code is ${code}`,
     };

      transporter.sendMail(mailOptions, function (error, info) {
       if (error) {
         console.log(error);
       } else {
         console.log("Email sent: " + info.response);
       }
     });

     console.log(pendingCodes);
     

     res.json({message: "Code sent successfully"})
  } catch (error) {
    console.error("Error sending email:", error);
    pendingCodes.delete(email);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

console.log(pendingCodes);

app.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  const verification = pendingCodes.get(email);

  console.log(verification);
  

  if(!verification){
    return res.status(400).send("Verification code not found")
  }

  if(Date.now() > verification.expiresAt){
    pendingCodes.delete(email);
    return res.status(400).send("Verification code expired")
  }

  if(verification.code !== code){
    return res.status(400).send("Invalid verification code")
  }

  pendingCodes.delete(email);

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

const JWT_SECRET =
  "d1eb4725a811c454a32d87d5f18605c924e9e3d237935748e2bb71c20217a3de7ff83243240a1744bfcde63afda256b38880dc0efeadcfeb8ee5a39e3bfa61c0";
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
}

app.post("/subscribe/:email", verifyToken, async (req, res) => {
  try {
    const email = req.params.email;

    const docRef = await addDoc(collection(db, "subscribers"), {
      email,
    });

    var mailOptions = {
      from: "jeffreyekpo54@gmail.com",
      to: email,
      subject: "Sending Email using Node.js",
      text: "That was easy dawg!",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    console.log(docRef.id);

    res.status(200).json(email);
  } catch (error) {
    res.status(400).send(`Error adding user: ${error.message}`);
  }
});

app.post("/addPost", upload.array("mediaFiles"), async (req, res) => {
  const media = req.files[0].mimetype
  try {
    const { title, body } = req.body;
    const mediaURL = [];
    console.log(req.body.mediaFile0);
    console.log(req.files);
    console.log(req.body);

    // const media = req.files.mimetype

    const querySnapshot = await getDocs(collection(db, "subscribers"));
    const subs = [];
    for (const doc of querySnapshot.docs) {
      subs.push(doc.data().email);
    }
    console.log(subs);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const storageRef = ref(storage, `uploads/${file.originalname}`);
      const uploadTask = uploadBytesResumable(storageRef, file.buffer);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.error(error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              mediaURL.push(downloadURL);
              resolve();
            } catch (error) {
              console.error(error);
              reject(error);
            }
          }
        );
      });
    }
    console.log(mediaURL);

    const docRef = await addDoc(collection(db, "posts"), {
      title,
      body,
      mediaURL,
      media
    });

    // Iterate through the subs array and send an email to each subscriber
    for (const email of subs) {
      const mailOptions = {
        from: "jeffreyekpo54@gmail.com",
        to: email,
        subject: "New Blog Post: " + title,
        text: `A new blog post has been added: "${title}"\n\nCheck it out at: http://yourblog.com/post/${docRef.id}`,
        // You can also use HTML for a richer email:
        // html: `<h1>New Blog Post: ${title}</h1><p>A new blog post has been added. <a href="http://yourblog.com/post/${docRef.id}">Check it out here</a>.</p>`
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent to " + email + ": " + info.response);
      } catch (error) {
        console.log("Error sending email to " + email + ": " + error);
      }
    }

    res.status(201).send(`Post added with ID: ${docRef.id}`);
  } catch (error) {
    res.status(400).send(`Error adding post: ${error.message}`);
  }
});

app.get("/getPost", async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const posts = [];

    for (const doc of querySnapshot.docs) {
      const postData = doc.data();

      if (postData.mediaURL && Array.isArray(postData.mediaURL)) {
        const fileURL = await Promise.all(
          postData.mediaURL.map(async (filePath) => {
            const fileRef = ref(storage, filePath);
            const downloadURL = await getDownloadURL(fileRef);
            return downloadURL;
          })
        );
        postData.mediaURL = fileURL;
      }
      posts.push({ id: doc.id, ...postData });
    }
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Error fetching posts: " + error.message);
  }
});

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

app.listen(3000, () => {
  console.log("listening or running at port 3000");
});

// firebase.
