import { Component, OnInit } from '@angular/core';
import { AgoraService } from '../services/agora.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit {
  apiMessages = '';
  uid = Math.floor(Math.random() * 1000);
  channel = '127de39f-7241-49f4-86cc-2bb76255bc64';

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
}