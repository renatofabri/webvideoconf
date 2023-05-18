import { Component, OnInit, ViewChild } from '@angular/core';
import AgoraRTC from 'agora-rtc-sdk-ng';

interface ChannelParameters {
  localAudioTrack: any;
  localVideoTrack: any;
  remoteAudioTrack: any;
  remoteVideoTrack: any;
  screenTrack: any;
  remoteUid: any;
}
@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit {

  channelParameters: ChannelParameters = {
    localAudioTrack: null,
    localVideoTrack: null,
    remoteAudioTrack: null,
    remoteVideoTrack: null,
    screenTrack: null,
    remoteUid: null,
  };

  @ViewChild("localVideoContainer", { static: true }) localVideoContainer: any;
  @ViewChild("remoteVideoContainer", { static: true }) remoteVideoContainer: any;
  @ViewChild("screenContainer", { static: true }) screenContainer: any;

  message = '';
  uid = Math.floor(Math.random() * 1000);

  isSharingEnabled = false;
  isMuteVideo = false;

  agoraEngine: any;

  constructor() {}

  ngOnInit(): void {
    this.message = '';

    this.agoraEngine = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    this.agoraEngine.on('user-published', async (user: any, mediaType: any) => {
      console.log("someone joined");
      await this.agoraEngine.subscribe(user, mediaType);
      console.log('subscribe success');

      if (mediaType == 'audio') {
        this.channelParameters.remoteUid = user.uid;
        this.channelParameters.remoteAudioTrack = user.audioTrack;
        this.channelParameters.remoteAudioTrack.play();
        this.message = 'Remote user connected: ' + user.uid;
      }

      if (mediaType == 'video') {
        this.channelParameters.remoteUid = user.uid;
        this.channelParameters.remoteVideoTrack = user.videoTrack;
        this.channelParameters.remoteVideoTrack.play('remoteVideoContainer');
        this.message = 'Remote user connected: ' + user.uid;
      }

      this.agoraEngine.on('user-unpublished', (user: any) => {
        console.log(user.uid + 'has left the channel');
        this.message = 'Remote user has left the channel';
      });
    });
  }

  async join() {
    console.log('Joining channel: ' + this.channel);
    await this.agoraEngine.join(
      this.appId,
      this.channel,
      this.rtcToken,
      this.uid);
    console.log('joined');

    this.channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    this.channelParameters.remoteVideoTrack?.play('remoteVideoContainer');

    await this.agoraEngine.publish([
      this.channelParameters.localAudioTrack,
    ]);
  }
  async joinVideo() {
    console.log('Joining video: ' + this.channel);
    this.channelParameters.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    this.channelParameters.localVideoTrack.play('localVideoContainer');

    await this.agoraEngine.publish([
      this.channelParameters.localVideoTrack,
    ]);
  }

  async leave() {
    this.channelParameters.localAudioTrack.close();
    this.channelParameters.localVideoTrack.close();
    this.channelParameters.remoteVideoTrack.close();
    this.channelParameters.screenTrack.close();
    await this.agoraEngine.leave();
    console.log('You left the channel');
  }

  async inItScreen() {
    this.isSharingEnabled = !this.isSharingEnabled;
    if (this.isSharingEnabled) {
      this.channelParameters.screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '720p_3' });
      this.channelParameters.screenTrack.play('screenContainer');
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
