import { Component, OnInit } from '@angular/core';
import AgoraRTC from 'agora-rtc-sdk-ng';

interface ChannelParameters {
  localAudioTrack: any;
  remoteAudioTrack: any;
  remoteUid: any;
}

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit {

  agoraEngine: any = null;
  message = "";
  options = {
    // Pass your App ID here.
    appId: '',
    // Set the channel name.
    channel: '',
    // Pass your temp token here.
    token: '',
    // Set the user ID.
    uid: Math.round(Math.random() * 10),
  };

  channelParameters: ChannelParameters = {
    // A variable to hold a local audio track.
    localAudioTrack: null,
    // A variable to hold a remote audio track.
    remoteAudioTrack: null,
      // A variable to hold the remote user id.
    remoteUid: null,
  };

  constructor() { }

  ngOnInit(): void {
    this.startBasicCall();
  }

  async startBasicCall() {
    // Create an instance of the Agora Engine
    this.agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    
    // Listen for the "user-published" event to retrieve an AgoraRTCRemoteUser object.
    this.agoraEngine.on("user-published", async (user: any, mediaType: any) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event.
      await this.agoraEngine.subscribe(user, mediaType);
      console.log("subscribe success");

      // Subscribe and play the remote audio track.
      if (mediaType == "audio") {
        this.channelParameters.remoteUid=user.uid;
        // Get the RemoteAudioTrack object from the AgoraRTCRemoteUser object.
        this.channelParameters.remoteAudioTrack = user.audioTrack;
        // Play the remote audio track. 
        this.channelParameters.remoteAudioTrack.play();
        this.showMessage("Remote user connected: " + user.uid);
      }

      // Listen for the "user-unpublished" event.
      this.agoraEngine.on("user-unpublished", (user: any) => {
        console.log(user.uid + "has left the channel");
        this.showMessage("Remote user has left the channel");
      });
    });
  }

  showMessage(text: string){
    this.message = text;
  }

  async join() {
    // Join a channel.
    await this.agoraEngine.join(this.options.appId, this.options.channel, this.options.token, this.options.uid);
    this.showMessage("Joined channel: " + this.options.channel);
    // Create a local audio track from the microphone audio.
    this.channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Publish the local audio track in the channel.
    await this.agoraEngine.publish(this.channelParameters.localAudioTrack);
    console.log("Publish success!");
  }

  async leave() {
    // Destroy the local audio track.
    this.channelParameters.localAudioTrack.close();
    // Leave the channel
    await this.agoraEngine.leave();
    console.log("You left the channel");
    // Refresh the page for reuse
    window.location.reload();
  }
}
