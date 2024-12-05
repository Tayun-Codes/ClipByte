var getClips = document.getElementById('clipButton').addEventListener("click", addWaiting);

function addWaiting(e) {
  const form = document.getElementById('uploadForm')
  const waiting = document.createElement('p')
  waiting.innerText = 'test'
  form.appendChild(waiting)
}