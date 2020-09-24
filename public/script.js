console.log(location)
const socket=io('/',{transports: ['websocket']});
const videoGrid =document.getElementById('video-grid');
let myStream;

var peer = new Peer({
	host: location.hostname,
	port: location.port || (location.protocol === 'https:' ? 443 : 80),
	path: '/peerjs'
})
const myVideo=document.createElement('video');
myVideo.muted=true;
let peers={}
navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then(stream =>{
  myStream=stream;
    addVideoStream(myVideo,stream);
    peer.on('call',call=>{
      call.answer(stream);
      const video=document.createElement('video');
      call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream);
      })
    })

    socket.on('user-connected',userId=>{
       connectToNewUser(userId,stream);
    })
});
socket.on('user-disconnected',userId=>{
  if(peers[userId])peers[userId].close()
})
peer.on('open',id=>{
     socket.emit('join-room',ROOM_ID,id);
})



const connectToNewUser=(userId,stream)=>{
  const call=peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream',userVideoStream=>{
       addVideoStream(video,userVideoStream);
  })
  call.on('close',()=>{
    video.remove()
  })
  peers[userId]=call
}




const addVideoStream=(video,stream)=>{
     video.srcObject=stream
     video.addEventListener('loadedmetadata',()=>{
       video.play()
     })
     videoGrid.append(video)
}

let text=$('input');
$('html').keydown((e)=>{
   if(e.which==13 && text.val().length>0){
     socket.emit('message',ROOM_ID,text.val());
     text.val('');
   }
});

socket.on('new-message',(message)=>{
      console.log('message received '+message);
     $('ul').append(`<li class='message'><b>User</b> <br>${message}</li>`)
     let objDiv =$('.main_chat_window')
     objDiv.scrollTop(objDiv.prop("scrollHeight"));
});


const muteUnmute  = ()=>{
    let enabled=myStream.getAudioTracks()[0].enabled;
    if(enabled){
      myStream.getAudioTracks()[0].enabled=false;
      setUnmuteButton();
    }else{
      myStream.getAudioTracks()[0].enabled=true;
      setMuteButton();
    }
}
const setMuteButton=()=>{
  let html='<i class="fas fa-microphone"></i><span>Mute</span>'
  $('.main_mute_button').html(html);
}
const setUnmuteButton=()=>{
  let html='<i class="unmute fas fa-microphone-slash"></i><span>UnMute</span>'
  $('.main_mute_button').html(html);
}

const stopPlay =()=>{
  let enabled=myStream.getVideoTracks()[0].enabled;
  if(enabled){
    myStream.getVideoTracks()[0].enabled=false;
    setPlayVideo();
  }else{
    myStream.getVideoTracks()[0].enabled=true;
    setStopVideo();
  }
}
const setPlayVideo=()=>{
   let html='<i class="unmute fas fa-video-slash"></i>  <span>Play Video</span>'
  $('.main_video_button').html(html);
}
const setStopVideo=()=>{
    let html='<i class="fas fa-video"></i>  <span>Stop Video</span>'
    $('.main_video_button').html(html);
}
