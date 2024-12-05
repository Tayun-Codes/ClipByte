alert('hello')
// const aws = require("../middleware/aws");
// import aws from './../middleware/aws.js'
// const s3 = new aws.S3(); //older sdk syntax

// var getClips = document.getElementById('clipButton').addEventListener("click", addWaiting);

function addWaiting(e) {
  const form = document.getElementById('uploadForm')
  const waiting = document.createElement('p')
  waiting.innerText = 'test'
  form.appendChild(waiting)
}

// //copied from ejs
// var bucketName = 'clipbyte-test';
// const credentials = new aws.Credentials({
//   accessKeyId: accessKeyId,
//   secretAccessKey: secretAccessKeyId
// });
// aws.config.update({
//   region: 'us-east-2',
//   credentials: credentials
// });

// var s3 = new aws.S3({
//   params: { Bucket: bucketName }
// });

// function s3upload() {
//   var files = document.getElementById('fileUpload').files; //not copied over
//   if (files) {
//       var file = files[0];
//       var fileName = file.name;
//       var filePath = 'clipbyte-test/' + fileName;
//       var params = {
//           Key: filePath,
//           Body: file,
//       };
//       fetch ('/uploading')
//       // s3.upload(params, function (err, data) {
//       //     if (err) {
//       //         console.error('Upload Error:', err);
//       //         alert('Failed to upload file.');
//       //         return;
//       //     }
//       //     alert('Successfully Uploaded! File URL: ' + data.Location);
//       // }).on('httpUploadProgress', function (progress) {
//       //     var uploaded = parseInt((progress.loaded * 100) / progress.total);
//       //     document.querySelector("progress").value = uploaded;
//       //     console.log('Upload Progress:', uploaded + '%');
//       // });
//   } else {
//       alert('No file selected.');
//   }
// };







// var thumbUp = document.getElementsByClassName("fa-thumbs-up");
// var thumbDown = document.getElementsByClassName("fa-thumbs-down");
// let del = document.getElementsByClassName("del");


// Array.from(thumbUp).forEach(function (element) {
//   element.addEventListener('click', function () {
//     const name = this.parentNode.parentNode.childNodes[1].innerText
//     const msg = this.parentNode.parentNode.childNodes[3].innerText
//     const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//     // console.log(`name: '${name}', msg: '${msg}', thumbDown: '${thumbDown}'`)
//     fetch('addOneLike', {
//       method: 'put',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         'name': name,
//         'msg': msg,
//         'thumbUp': thumbUp
//       })
//     })
//       .then(response => {
//         if (response.ok) return response.json()
//       })
//       .then(data => {
//         console.log(data)
//         window.location.reload()
//       })
//   });
// });

// Array.from(thumbDown).forEach(function (element) {
//   element.addEventListener('click', function () {
//     const name = this.parentNode.parentNode.childNodes[1].innerText
//     const msg = this.parentNode.parentNode.childNodes[3].innerText
//     const thumbDown = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//     console.log(`name: '${name}', msg: '${msg}', thumbDown: '${thumbDown}'`)
//     fetch('removeOneLike', {
//       method: 'put',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         'name': name,
//         'msg': msg,
//         'thumbDown': thumbDown
//       })
//     })
//       .then(response => {
//         if (response.ok) return response.json()
//       })
//       .then(data => {
//         console.log(data)
//         window.location.reload()
//       })
//   });
// });

// Array.from(del).forEach(function (element) {
//   element.addEventListener('click', function () {
//     const name = this.parentNode.childNodes[1].innerText
//     const msg = this.parentNode.childNodes[3].innerText
//     console.log('name:', name, 'msg:', msg)
//     console.log(this.parentNode)
//     fetch('delete', {
//       method: 'delete',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         'name': name,
//         'msg': msg
//       })
//     }).then(data => {
//       console.log(data)
//       window.location.reload()
//     })
//   });
// });