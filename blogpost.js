document.addEventListener("DOMContentLoaded", () => {
  const postContainer = document.querySelector(".post-container");

  const email = document.querySelector(".news-input");
  const button = document.querySelector(".signup");

  button.addEventListener("click", () => {
    if (email == null) {
      alert("enter email");
    } else {
      fetch(`https://mkay.onrender.com/subscribe/${email.value}`, {
        method: "POST",
      });
    }
  });
  const getContent = () => {
    fetch("https://mkay.onrender.com/getPost", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        // Clear the existing content
        postContainer.innerHTML = "";

        // Create sections to hold pairs of cards
        for (let i = 0; i < data.length; i += 2) {
          const section = document.createElement("section");
          section.classList.add("new");

          // Create two cards for each section
          for (let j = i; j < i + 2 && j < data.length; j++) {
            const post = data[j];
            const card = createCard(post);
            section.appendChild(card);
          }

          postContainer.appendChild(section);
        }
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
      mediaElement.classList.add("card-img");
    } else {
      mediaElement = document.createElement("video");
      mediaElement.src = post.mediaURL[0];
      mediaElement.controls = true;
      mediaElement.classList.add("card-img");
    }

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const date = document.createElement("p");
    date.classList.add("date");
    date.textContent = new Date().toLocaleDateString();

    const title = document.createElement("h2");
    title.classList.add("title");
    title.textContent = post.title;

    // const content = document.createElement("p");
    // content.classList.add("content");
    // content.innerHTML = post.body.substring(0, 20) + "...";

    const readMore = document.createElement("a");
    readMore.classList.add("read-more");
    readMore.href = "#";
    readMore.textContent = "Read more";

    cardContent.appendChild(date);
    cardContent.appendChild(title);
    // cardContent.appendChild(content);
    cardContent.appendChild(readMore);

    card.appendChild(mediaElement);
    card.appendChild(cardContent);

    card.addEventListener("click", () => {
      localStorage.setItem("postID", post.id);

      window.location.href = "blogpost.html?id=" + post.id;
    });
    return card;
  };

  getContent();

const fullPage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postID = urlParams.get("id");
  const otherHalf = document.querySelector(".other-half");

  if (!postID) {
    otherHalf.innerHTML = '<p class="error">No post ID provided.</p>';
    return;
  }

  fetch("https://mkay.onrender.com/getPost/" + postID, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      const content = `
        <div class="full-post">
          <h1 class="post-title">${data.title}</h1>
          <p class="post-date">${new Date(
            data.createdAt
          ).toLocaleDateString()}</p>
          <div class="post-media">
            ${createMediaElements(data.mediaURL)}
          </div>
          <div class="post-body">${data.body}</div>
        </div>
      `;

      otherHalf.innerHTML = content;
    })
    .catch((error) => {
      console.error("Error:", error);
      otherHalf.innerHTML =
        '<p class="error">Failed to load post. Please try again later.</p>';
    });
};

document.addEventListener("DOMContentLoaded", fullPage);

const createMediaElements = (mediaURLs) => {
  if (!Array.isArray(mediaURLs)) {
    console.error("Invalid media data");
    return "";
  }

  return mediaURLs
    .map((url) => {
      const fileExtension = url.split("?")[0].split(".").pop().toLowerCase();

      if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
        return `<img src="${url}" alt="Post image" class="post-image">`;
      } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
        return `<video src="${url}" controls class="post-image"></video>`;
      } else {
        console.warn(`Unsupported file type: ${fileExtension}`);
        return "";
      }
    })
    .join("");
};

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", fullPage);

  fullPage()
});
