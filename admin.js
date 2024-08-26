document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");
  const postsContainer = document.querySelector(".posts-container");

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

  // Quill editor initialization
  var quill = new Quill("#editor-container", {
    theme: "snow",
  });

  // Function to get Quill editor content
  function getEditorContent() {
    return quill.root.innerHTML.trim();
  }

  const postButton = document.getElementById("post");
  let files = [];

  // Handle post creation
  const makePost = () => {
    const title = document.querySelector(".title").value.trim();
    const res = getEditorContent();

    if (!title || !res) {
      alert("Both title and content are required");
      return;
    }
    if (files.length === 0) {
      alert("Please select media files");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", res);

    files.forEach((file) => formData.append("mediaFiles", file));

    const link = "http://localhost:3000/addPost";
    fetch(link, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        alert("Post created successfully!");
        console.log("Success:", data);
        // Optionally, refresh the list of posts
        fetchPosts();
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

  // Fetch and display posts in "View All Posts" tab
  const fetchPosts = () => {
    fetch("http://localhost:3000/getPost")
      .then((response) => response.json())
      .then((data) => {
        postsContainer.innerHTML = ""; // Clear previous posts
        data.forEach((post) => {
          const card = createPostCard(post);
          postsContainer.appendChild(card);
        });
      })
      .catch((error) => console.error("Error fetching posts:", error));
  };

  // Function to create a post card
  const createPostCard = (post) => {
    const card = document.createElement("div");
    card.classList.add("post-card");

    const media = document.createElement(
      post.media.startsWith("image/") ? "img" : "video"
    );
    media.src = post.mediaURL[0];
    if (post.media.startsWith("video/")) {
      media.controls = true;
    }
    media.classList.add("post-media");

    const cardContent = document.createElement("div");
    cardContent.classList.add("post-content");

    const title = document.createElement("h3");
    title.textContent = post.title;
    title.classList.add("post-title");

    const body = document.createElement("p");
    body.innerHTML = stripHtml(post.body).substring(0, 100) + "...";
    body.classList.add("post-body");

    const date = document.createElement("p");
    date.textContent = new Date(post.createdAt).toLocaleDateString();
    date.classList.add("post-date");

    const menu = document.createElement("div");
    menu.classList.add("post-menu");
    menu.innerHTML = `<button class="delete-post">Delete</button>`;

    menu.querySelector(".delete-post").addEventListener("click", () => {
      deletePost(post.id);
    });

    cardContent.appendChild(title);
    cardContent.appendChild(date);
    cardContent.appendChild(body);
    cardContent.appendChild(menu);

    card.appendChild(media);
    card.appendChild(cardContent);

    return card;
  };

  // Function to delete a post
  const deletePost = (postId) => {
    const link = `http://localhost:3000/deletePost/${postId}`;
    fetch(link, { method: "DELETE" })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        alert("Post deleted successfully!");
        fetchPosts(); // Refresh the list of posts
      })
      .catch((error) => console.error("Error deleting post:", error));
  };

  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    let tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Initial fetch of posts when the page loads
  fetchPosts();
});
