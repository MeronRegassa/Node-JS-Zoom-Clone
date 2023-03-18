//get the user media

// const { PeerServer } = require("peer");

// const { connected } = require("process");

// const { Socket } = require("engine.io");
const socket = io('/');

// creating peer connection
const myPeer = new Peer(undefined, {

    path: '/peerjs',
    host: '/',
    port: '443',
});

const peers = {};
//it's a pomise 
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video'); //creates video tag to play the video.
// myVideo.muted = true // mutes the audio
let myVideoStream;

//navigator.mediaDevices.getUserMedia() propmts the user  for permission to use the media input. it returns promise.
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    //answering the  user call
    myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');

        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
       
    });
    //listening
    socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);
    });
    
    let text = $('input');
    //When press enter send message
    $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", message => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
  })

    
});

//gives id for the user that joins the room.(RealTimeCommunication)
myPeer.on('open', (id) => {
  console.log(id);
  //sending join room from frontend
  //
  socket.emit("join-room", ROOM_ID, id);
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) {
        peers[userId].close()
    }
});



// this function  takes video and  stream 
function addVideoStream(video, stream) {
    video.srcObject = stream;
    // when the stream loaded the loadedmetadata triggers
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video); // appends the video inside the div in room.ejs
}
// function that lets as when new user is connected


function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);

    //creates new video tag for the new user
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        
        addVideoStream(video, userVideoStream)
    });

    call.on('close', () => {
        video.remove();
    });
    peers(userId) = call
    console.log('Theo is connected', userId)
}





//accessing the video
const playStop= () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;

  console.log(myVideoStream.getVideoTracks())
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};


// accessing the audio
const muteUnmute = () => {
    
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enableld = true;
    }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}