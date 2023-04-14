import { Component, OnInit, ViewChild } from '@angular/core';
import { AgoraService } from '../services/agora.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit {

  @ViewChild("localVideo", { static: true }) localVideo: any;
  @ViewChild("remoteVideo", { static: true }) remoteVideo: any;
  @ViewChild("screenVideo", { static: true }) screenVideo: any;

  apiMessages = '';
  uid = Math.floor(Math.random() * 1000);
  channel = '127de39f-7241-49f4-86cc-2bb76255bc64';

  isSharingEnabled = false;
  isMuteVideo = false;

  constructor(private agoraService: AgoraService) {}

  ngOnInit(): void {
    this.agoraService.startBasicCall();

    this.agoraService.message.subscribe((message: string) => {
      this.apiMessages = message;
    });
  }

  showMessage(text: string) {
    this.apiMessages = text;
  }
  token() {
    console.log(this.agoraService.generateRtcToken(this.uid, "channelTest"));
  }

  join() {
    this.agoraService.join(this.uid, this.channel);
  }

  leave() {
    this.agoraService.leave();
  }

  async inItScreen() {
    this.agoraService.initScreen(this.isSharingEnabled);
  }

  muteVideo() {

  }

  localAudioVolume(val: any) {
    console.log(val);
  }
  remoteAudioVolume(val: any) {
    console.log(val);
  }
}
