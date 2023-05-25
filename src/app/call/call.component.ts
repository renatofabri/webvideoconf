import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import AgoraRTC from 'agora-rtc-sdk-ng';

interface ChannelParameters {
  localAudioTrack: any;
  localVideoTrack: any;
  connectedUsers: ConnectedUser[];
  screenTrack: any;
}

interface AudioData {
  track: any;
  channels: any[];
}

interface ConnectedUser {
  uid: number;
  audioTrack: any;
  videoTrack: any;
  videoContainer: ElementRef;
}

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit {

  saveAsProject(){
    this.writeContents(this.audioData?.channels, 'sample'+'.txt', 'text/plain');
  }
  writeContents(content: any, fileName: string, contentType:string) {
    var a = document.createElement('a');
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  @ViewChild("localVideoContainer", { static: false }) localVideoContainer!: ElementRef;
  @ViewChild("screenSharingContainer", { static: false }) screenSharingContainer!: ElementRef;

  @ViewChild("participantsWrapper", { static: false }) participantsWrapper!: ElementRef;
  @ViewChild("remoteVideoContainer", { static: false }) remoteVideoContainer!: ElementRef;

  channelParameters: ChannelParameters = {
    localAudioTrack: null,
    localVideoTrack: null,
    connectedUsers: [],
    screenTrack: null,
  };

  message = '';
  uid = Math.floor(Math.random() * 1000);

  isSharingScreen = false;
  isMuteVideo = false;
  inCall = false;

  audioData: AudioData= {track: null, channels: []};

  agoraEngine: any;


  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.message = '';

    this.agoraEngine = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    this.agoraEngine.on('user-published', async (user: any, mediaType: any) => {
      console.log("someone joined");
      await this.agoraEngine.subscribe(user, mediaType);
      console.log('subscribe success');

      if (mediaType == 'audio') {
        let userIdx = this.channelParameters.connectedUsers.findIndex((user) => user.uid === user.uid);
        if (userIdx === -1) {
          let newLength = this.channelParameters.connectedUsers.push({
            uid: user.uid,
            audioTrack: user.audioTrack,
            videoTrack: null,
            videoContainer: this.renderer.createElement('div'),
          });
          userIdx = newLength - 1;
          console.log("console", this.channelParameters.connectedUsers);
          this.participantsWrapper.nativeElement.appendChild(this.channelParameters.connectedUsers[userIdx].videoContainer);
        } else {
          this.channelParameters.connectedUsers[userIdx].audioTrack = user.audioTrack;
        }

        this.channelParameters.connectedUsers[userIdx].audioTrack.play();
        this.message = 'Remote user connected: ' + user.uid;
      }

      if (mediaType == 'video') {
        let userIdx = this.channelParameters.connectedUsers.findIndex((user) => user.uid === user.uid);
        if (userIdx === -1) {
          console.error("User not found");
        }
        this.channelParameters.connectedUsers[userIdx].videoTrack = user.videoTrack;
        this.channelParameters.connectedUsers[userIdx].videoTrack.play(this.channelParameters.connectedUsers[userIdx].videoContainer);
        this.message = 'Remote user connected: ' + user.uid;
      }

      this.agoraEngine.on('user-unpublished', (user: any) => {
        console.log(user.uid + 'has left the channel');
        this.message = 'Remote user has left the channel';
      });
    });
  }

  async join() {
    this.inCall = true;
    console.log('Joining channel: ' + this.channel);
    await this.agoraEngine.join(
      this.appId,
      this.channel,
      this.rtcToken,
      this.uid);
    console.log('joined');

    this.channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack().then(
      (track) => {
        // get raw data
        this.audioData.track = track;
        this.audioData.track.setAudioFrameCallback((buffer: any) => {
          for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
            const currentChannelData = buffer.getChannelData(channel);
            console.log("PCM data in channel", channel, currentChannelData);
            this.audioData.channels.push(currentChannelData);
          }
        });
      }
    );

    await this.agoraEngine.publish([
      this.channelParameters.localAudioTrack,
    ]);

    this.channelParameters.connectedUsers.forEach((user) => {
      user.videoTrack?.play(user.videoContainer?.nativeElement);
    });
  }
  async joinVideo() {
    console.log('Joining video: ' + this.channel);
    this.channelParameters.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    this.channelParameters.localVideoTrack.play(this.localVideoContainer.nativeElement);

    await this.agoraEngine.publish([
      this.channelParameters.localVideoTrack,
    ]);
  }

  async leave() {
    console.log("leave");
    this.audioData.track?.setAudioFrameCallback(null);
    console.log("setAudioFrameCallback");
    this.audioData.track?.close();
    console.log("track close");
    var sine = [];
    for (var i=0; i<10000; i++) {
      sine[i] = 128+Math.round(127*Math.sin(i/5));
    }
    console.log("pcm sine generated", sine);
    console.log("pcm", this.audioData?.channels);
    console.log("pcm", Array.from(this.audioData.channels));
    new (pcm as any)({channels: 1, rate: 8000, depth: 8}).toWav(sine).play()
    console.log("pcm played");
    this.inCall = false;
    this.channelParameters.localAudioTrack?.close();
    this.channelParameters.localVideoTrack?.close();
    this.channelParameters.connectedUsers.forEach((user) => {
      user.audioTrack?.close();
      user.videoTrack?.close();
      user.videoContainer?.nativeElement.remove();
    });
    this.channelParameters.screenTrack?.close();
    await this.agoraEngine.leave();
    console.log('You left the channel');
  }

  async shareScreen() {
    this.isSharingScreen = !this.isSharingScreen;
    if (this.isSharingScreen) {
      this.channelParameters.screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '720p_3' });
      this.channelParameters.screenTrack.play(this.screenSharingContainer.nativeElement);
      this.agoraEngine.unpublish([this.channelParameters.localVideoTrack]);
      this.agoraEngine.publish([this.channelParameters.screenTrack]);
      await this.channelParameters.localVideoTrack.replaceTrack(this.channelParameters.screenTrack, true);
    } else {
      this.agoraEngine.unpublish([this.channelParameters.screenTrack]);
      this.channelParameters.screenTrack.close();
      this.agoraEngine.publish([this.channelParameters.localVideoTrack]);
      await this.channelParameters.localVideoTrack.replaceTrack(this.channelParameters.localVideoTrack, true);
    }
  }

  localAudioVolume(val: any) {
    console.log(val);
  }
  remoteAudioVolume(val: any) {
    console.log(val);
  }
}
