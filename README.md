The transcribing progress bar only updates once the entire transcription process is done.
There are attempts to make the transcribing process asynchronous in order to update the progress value whenever the value is received.
Changes made in controllers/transcribe.js, routes/main.js and views/upload.ejs
Not currently working yet but seems possible?

# ClipByte
A program to help content creators diversify their platforms by automating short-form clips from long videos.

# Inspiration
As a friend to many content creators and as a content creator myself, the most difficult part of growing your platform is getting new people to see it. Algorithm this, algorithm that, what I have found in my research is that the key to growing on any platform is consistency.

Consistency requires that you have and prepare content to be published on a schedule. With the rise of short-form content clips have to be interesting from the get-go and you need to be publishing a lot for the platform to push your content to an audience. Most people start content creation as a fun hobby and pouring full-time hours to make extra content just to play the numbers game is a luxury that very few can afford when bills have to be paid. This is where my application fills the gap.

Using OpenAI to analyze long-form content, whether it's a podcast, livestream, or video essay, it will identify exciting moments of your stream and return them back for you. Long gone are the days of scrubbing through a 5 hour stream at 4x speed to find a few choice moments for a clip.

# How It's Made:
ClipByte is built using the following technologies:

- **Amazon S3**: Used as the database to store and access user uploads of large video files. The core functionality is implemented on the server side using CRUD (Create, Read, Update, Delete) operations, enabling the handling of video data. On the client side, event listeners are employed. Users initiate CRUD functions by clicking buttons on the interface to upload videos, manipulate and download clips.
- **Node.js**: Utilized for server-side development.
- **JavaScript (JS)**: Employed for both client and server-side functionality.

**Key Packages Used**:
- **express**: Provides a framework for building the web application.
- **aws-sdk**: Accesses S3 buckets for cloud storage and manipulation of large video files
- **fluent-ffmpeg**: Command-line conversion of mp4 to wav files. Used for Remotion's transcribe function which requires wav files.
- **@remotion/install-whisper-cpp**: Use of transcribe to retrieve a transcription of the user's video in order to be analyzed by OpenAI for clippable moments.
- **OpenAI**
- **remotion packages incoming**

# What I Learned
- Model, Views, Controller (MVC) framework to organize code for easier readability, clearly routing client and server side data
- How to access and manipulate Amazon Web Services S3 cloud storage buckets
- That I need to read documentation more thoroughly before jumping into a project that accesses multiple APIs and a complex storage system.

# Current drawbacks
- Remotion transcribe is slow. A test on a 16 minute and 38 second video file containing two speakers with constant chatter took 772601.19ms (12 minutes and 52 seconds).
- I am using the Remotion's medium.en model for transcription. For clear audio it performs very well. For audio with clashing background sound or speakers that may be far away it performs quite poorly. You can upgrade the model using remotions many models that can be found in their documentation here : https://www.remotion.dev/docs/install-whisper-cpp/transcribe#inputpath
- Redundancy is file storage: There is no point in uploading files to S3 when they need to be downloaded locally to be converted into audio files for transcription. This was done to familiarize myself with AWS S3.

# If you would like to use this codebase
Run at your own risk!
There are a lot of missing components due to file size.

This program is also quite CPU intensive. I have an i7-14700K and at times this program eats up to 30% of my CPU.

## Notes before running
### Remotion/Whisper-cpp
Paths must be absolute paths for it to work (I believe this may be due to how I, Tayun, installed whisper.cpp but if your paths in transcribeFile for "inputPath" or "whisperPath" are not working this may be why)

```
//controllers/transcribe.js
const { transcription } = await transcribe({
    inputPath: 'absolutePath.wav'
    whisperPath: 'absolutePath/endswith/whisper.cpp'
```
Whisper.cpp is not included in this codebase because it is very large.
Installation and documentation for whisper.cpp can be found here : https://www.remotion.dev/docs/install-whisper-cpp/install-whisper-cpp

### Fluent ffmpeg
Fluent ffmpeg requires ffmpeg.exe and ffprobe.exe to be downloaded into the root folder so that the command line can be accessed for fluent-ffmpeg to convert mp4 files to wav. These files were too large to be uploaded to Github.
Documentation for node's fluent-ffmpeg can be found here : https://www.npmjs.com/package/fluent-ffmpeg

### Run
`npm start`


# Oh you're at the end!
Brownie points for you :)