document.addEventListener("DOMContentLoaded", () => {
  const postContainer = document.querySelector(".post-container");
  const email = document.querySelector(".news-input")
  const button = document.querySelector(".signup")

  button.addEventListener("click",()=>{
     
     if(email == null){

       alert("enter email")

     }else{
       fetch(`http://localhost:3000/subscribe/${email.value}`,{
        method: "POST",
       })
     }
  })


  const getContent = () => {
    fetch("http://localhost:3000/getPost", {
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
  title.textContent = post.title

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
    // localStorage.setItem('postID', post.id)

    window.location.href = "blogpost.html?id=" + post.id;
  })
  return card;
};

  getContent();
});
