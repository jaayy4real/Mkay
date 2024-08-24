const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const uploadButton = document.getElementById("uploadButton");
const uploadArea = document.querySelector(".upload-area");

let files = [];

fileInput.addEventListener("change", handleFileSelect);
uploadArea.addEventListener("dragover", handleDragOver);
uploadArea.addEventListener("drop", handleDrop);
uploadButton.addEventListener("click", handleUpload);

function handleFileSelect(event) {
  const selectedFiles = event.target.files;
  handleFiles(selectedFiles);
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
}

function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  const droppedFiles = event.dataTransfer.files;
  handleFiles(droppedFiles);
}

function handleFiles(selectedFiles) {
  files = [...selectedFiles];
  preview.innerHTML = "";
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.classList.add("preview-item");
      preview.appendChild(img);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.classList.add("preview-item");
      video.setAttribute("controls", "");
      preview.appendChild(video);
    }
  });
}

function handleUpload() {
  if (files.length === 0) {
    alert("Please select files to upload.");
    return;
  }

  // Here you would typically send the files to a server
  // For this example, we'll just log the file names
  console.log("Uploading files:");
  files.forEach((file) => {
    console.log(file.name);
  });

  alert("Upload simulation complete. Check console for details.");
}
