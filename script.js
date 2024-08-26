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
        // Clear the existing content
        postContainer.innerHTML = "";

        // Loop through the fetched data and create blog cards
        data.forEach((post) => {
          // Create a new card div
          const card = document.createElement("div");
          card.classList.add("card");

          // Create the card's image element
          const img = document.createElement("img");
          img.src = post.mediaURL[0]; // Assuming the first image is the primary image
          img.alt = post.title;
          img.classList.add("card-img");

          // Create the card content div
          const cardContent = document.createElement("div");
          cardContent.classList.add("card-content");

          // Create the date paragraph (if needed, you could add the date to the API and display it here)
          const date = document.createElement("p");
          date.classList.add("date");
          date.textContent = new Date().toLocaleDateString(); // Using the current date as a placeholder

          // Create the title element
          const title = document.createElement("h2");
          title.classList.add("title");
          title.textContent = post.title;

          // Create the content paragraph
          const content = document.createElement("p");
          content.classList.add("content");
          content.innerHTML = post.body.substring(0, 100) + "..."; // Limiting content length

          // Create the read more link
          const readMore = document.createElement("a");
          readMore.classList.add("read-more");
          readMore.href = "#"; // Ideally, this should link to the full post
          readMore.textContent = "Read more";

          // Append elements to cardContent
          cardContent.appendChild(date);
          cardContent.appendChild(title);
          cardContent.appendChild(content);
          cardContent.appendChild(readMore);

          // Append img and cardContent to card
          card.appendChild(img);
          card.appendChild(cardContent);

          // Append card to the postContainer
          postContainer.appendChild(card);
        });
      })
      .catch((err) => console.error(err));
  };

  getContent();
});
