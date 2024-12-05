attempts to move client side functions that upload videos to aws bucket
files changed: views/upload.ejs, public/main.js, routs/main.js, controllers/upload.js
incomplete d/t solution being multer but multer proposes a security risk -- need to find workaround, if any

# ClipByte
A program to help content creators diversify their platforms by automating short-form clips from long videos.

# Inspiration
As a friend to many content creators and as a content creator myself, the most difficult part of growing your platform is getting new people to see it. Algorithm this, algorithm that, what I have found in my research is that the key to growing on any platform is consistency.

Consistency requires that you have and prepare content to be published on a schedule. With the rise of short-form content clips have to be interesting from the get-go and you need to be publishing a lot for the platform to push your content to an audience. Most people start content creation as a fun hobby and pouring full-time hours to make extra content just to play the numbers game is a luxury that very few can afford when bills have to be paid. This is where my application fills the gap.

Using OpenAI to analyze long-form content, whether it's a podcast, livestream, or video essay, it will identify exciting moments of your stream and return them back for you. Long gone are the days of scrubbing through a 5 hour stream at 4x speed.

# How It's Made:
ClipByte is built using the following technologies:

- **Amazon S3**: Used as the database to store and access user uploads of large video files. The core functionality is implemented on the server side using CRUD (Create, Read, Update, Delete) operations, enabling the handling of video data. On the client side, event listeners are employed. Users initiate CRUD functions by clicking buttons on the interface to upload videos, manipulate and download clips.
- **Node.js**: Utilized for server-side development.
- **JavaScript (JS)**: Employed for both client and server-side functionality.

**Key Packages Used**:

- **express**: Provides a framework for building the web application.
- **aws**: 
- **multer-s3**: Easily uploads and retrieves media data, specifically for Amazon S3; similar to multer

# What I Learned
- Multer to store user and movie specific data
- Code Organization to clearly route client and server side data

# Have fun!
Interact and play with this full-stack app [here]!

# Instructions for if you would like to download my code

## Install
`npm install`

## Things to add

- Create a `.env` file in config folder and add the following as `key = value`
  - PORT = 2121 (can be any port example: 3000)
  - DB_STRING = `your database URI`
  - ACCESS_KEY = `your AWS access key`
  - SECRET_ACCESS_KEY = `your AWS secret access key`
  - REGION = `your AWS region`

## Run

`npm start`