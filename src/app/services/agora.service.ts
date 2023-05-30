import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../envs/environment.dev";
import { env } from 'process';

@Injectable({ providedIn: 'root' })
export class AgoraService {
  constructor(private _http: HttpClient) {}

  startRecording(channelName: string) {
    const url: string = `https://api.agora.io/v1/apps/${environment.agora.appId}/cloud_recording/acquire`;
    const body = {
      cname: channelName,
      uid: 80085,
      clientRequest: {
        token: environment.agora.rtcToken,
        recordingConfig: {
          maxIdleTime: 30,
          streamTypes: 2,
          channelType: 1,
          videoStreamType: 0,
          transcodingConfig: {
            height: 640,
            width: 360,
            bitrate: 500,
            fps: 15,
            mixedVideoLayout: 1,
            backgroundColor: "#FF0000",
          },
          subscribeVideoUids: [],
          subscribeAudioUids: [],
        },
        recordingFileConfig: {
          avFileType: ["hls"],
        },
        storageConfig: {
          vendor: 1, // S3
          region: 0, // US_EAST_1
          bucket: environment.s3.bucket,
          accessKey: environment.s3.accessKey,
          secretKey: environment.s3.secretKey,
        }
      }
    }
    this._http.post(url, body).subscribe((res) => {
      console.log(res);
    });

  }
  stopRecording() {}
}
