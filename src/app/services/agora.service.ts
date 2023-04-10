import { Injectable } from '@angular/core';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { Subject } from 'rxjs';
import { environment } from 'src/envs/environment';

interface ChannelParameters {
  localAudioTrack: any;
  remoteAudioTrack: any;
  remoteUid: any;
}

@Injectable({ providedIn: 'root' })
export class AgoraService {
  constructor() {}

  message = new Subject<string>();

  agoraEngine: any = null;

  channelParameters: ChannelParameters = {
    localAudioTrack: null,
    remoteAudioTrack: null,
    remoteUid: null,
  };

  async startBasicCall() {
    console.log("Starting basic call");
    // Create an instance of the Agora Engine
    this.agoraEngine = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Listen for the "user-published" event to retrieve an AgoraRTCRemoteUser object.
    this.agoraEngine.on('user-published', async (user: any, mediaType: any) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event.
      await this.agoraEngine.subscribe(user, mediaType);
      console.log('subscribe success');

      // Subscribe and play the remote audio track.
      if (mediaType == 'audio') {
        this.channelParameters.remoteUid = user.uid;
        // Get the RemoteAudioTrack object from the AgoraRTCRemoteUser object.
        this.channelParameters.remoteAudioTrack = user.audioTrack;
        // Play the remote audio track.
        this.channelParameters.remoteAudioTrack.play();
        this.message.next('Remote user connected: ' + user.uid);
      }

      // Listen for the "user-unpublished" event.
      this.agoraEngine.on('user-unpublished', (user: any) => {
        console.log(user.uid + 'has left the channel');
        this.message.next('Remote user has left the channel');
      });
    });
  }

  async startVideoCall() {
    // https://docs.agora.io/en/video-calling/develop/product-workflow?platform=web
  }

  generateRtcToken(uid: number, channel: string): string {
    console.log("generating token");
    const priviledgeExpiredTs =
      Math.floor(Date.now() / 1000) + environment.agora.expirationTimeInSeconds;
    const token = RtcTokenBuilder.buildTokenWithUid(
      environment.agora.appId,
      environment.agora.appCertificate,
      channel,
      uid,
      RtcRole.PUBLISHER,
      environment.agora.expirationTimeInSeconds,
      priviledgeExpiredTs
    );
    console.log("token", token);
    return token;
  }

  async join(uid: number, channel: string) {
    // Join a channel.
    console.log("Joining");
    await this.agoraEngine.join(
      environment.agora.appId,
      channel,
      this.generateRtcToken(uid, channel),
      uid
    );
    this.message.next('Joined channel: ' + channel);

    console.log("creating local audio track");
    // Create a local audio track from the microphone audio.
    this.channelParameters.localAudioTrack =
      await AgoraRTC.createMicrophoneAudioTrack();
    // Publish the local audio track in the channel.
    await this.agoraEngine.publish(this.channelParameters.localAudioTrack);
    console.log('Publish success!');
  }

  async leave() {
    this.channelParameters.localAudioTrack.close();
    await this.agoraEngine.leave();
    console.log('You left the channel');
    // Refresh the page for reuse
    // window.location.reload();
  }
}
