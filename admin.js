document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");
  const postContainer = document.querySelector(".post-container");

  // Switch between tabs
  tabLinks.forEach((link) => {
    link.addEventListener("click", () => {
      tabLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      tabContents.forEach((content) => {
        content.style.display =
          content.id === link.dataset.tab ? "block" : "none";
      });
    });
  });

  // Initialize Quill editor
  const quill = new Quill("#editor-container", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        ["image", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
      ],
    },
  });

  // Handle post creation
  const postButton = document.getElementById("post");
  let files = [];

  const makePost = () => {
    const title = document.querySelector("#title").value;
    const content = quill.root.innerHTML.trim();

    console.log(title, content, files);

    if (!title || !content) {
      alert("Both title and content are required");
      return;
    }
    if (files.length === 0) {
      alert("Please select media files");
      return;
    }

    
    

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", content);

    files.forEach((file) => formData.append("mediaFiles", file));

    fetch("https://mkay.onrender.com/addPost", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jmn"),
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          window.location.href = "admin.html";
        }
        return response.json();
      })
      .then((data) => {
        alert("Post created successfully!");
        console.log("Success:", data);
        // Optionally, clear the editor and file input after successful post
        quill.root.innerHTML = "";
        document.querySelector(".title").value = "";
        document.getElementById("fileInput").value = "";
        document.getElementById("preview").innerHTML = "";
        files = [];
      })
      .catch((error) => console.error("Error:", error));
  };

  postButton.addEventListener("click", makePost);

  // Handle file upload and preview
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const uploadArea = document.querySelector(".upload-area");

  fileInput.addEventListener("change", handleFileSelect);
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("drop", handleDrop);

  function handleFileSelect(event) {
    handleFiles(event.target.files);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    handleFiles(event.dataTransfer.files);
  }

  function handleFiles(selectedFiles) {
    files = [...selectedFiles];
    preview.innerHTML = "";
    files.forEach((file) => {
      const previewItem = document.createElement(
        file.type.startsWith("image/") ? "img" : "video"
      );
      previewItem.src = URL.createObjectURL(file);
      previewItem.classList.add("preview-item");
      if (file.type.startsWith("video/"))
        previewItem.setAttribute("controls", "");
      preview.appendChild(previewItem);
    });
  }

  // Fetch and display posts
  const getPosts = () => {
    fetch("https://mkay.onrender.com/getPost", { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        postContainer.innerHTML = "";
        data.forEach((post) => {
          const card = createCard(post);
          postContainer.appendChild(card);
        });
      })
      .catch((err) => console.error(err));
  };

  const createCard = (post) => {
    const card = document.createElement("div");
    card.classList.add("card");

    let mediaElement;
    if (post.media && post.media.startsWith("image/")) {
      mediaElement = document.createElement("img");
      mediaElement.src = post.mediaURL[0];
      mediaElement.alt = post.title;
    } else {
      mediaElement = document.createElement("video");
      mediaElement.src = post.mediaURL[0];
      mediaElement.controls = true;
    }

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const title = document.createElement("p");
    title.classList.add("title");
    title.textContent = post.title;

    const content = document.createElement("p");
    content.classList.add("content");
    content.textContent =
      post.body.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50) + "...";

    const readMore = document.createElement("button");
    readMore.classList.add("read-more");
    readMore.href = "#";
    readMore.textContent = "Delete";

    cardContent.appendChild(title);
    cardContent.appendChild(content);
    cardContent.appendChild(readMore);

    card.appendChild(mediaElement);
    card.appendChild(cardContent);

    return card;
  };

  getPosts();
});
