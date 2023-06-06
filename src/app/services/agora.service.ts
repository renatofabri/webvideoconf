import { Injectable } from '@angular/core';
import { environment } from "../../envs/environment.dev";
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AgoraService {
  constructor(private _http: HttpClient) {}

  getHeaders() {
    const plainCredential = `${environment.agora.customerKey}:${environment.agora.customerSecret}`;
    var encodedCredential = btoa(plainCredential);
    console.log('record:credential', encodedCredential);
    return {
        Authorization: `Basic ${encodedCredential}`,
        "Content-Type": "application/json",
      }
  }

  acquireResourceId(): Observable<any> {
    const url: string = `https://api.agora.io/v1/apps/${environment.agora.appId}/cloud_recording/acquire`;
    const body = {
      cname: environment.agora.channel,
      uid: 80085,
      clientRequest: {
        region: "NA",
        "resourceExpiredHour": 24
      }
    }
    return this._http.post(url, body, { headers: this.getHeaders() });
  }

  startRecording(channelName: string, resourceId: string, mode="mix"): Observable<any> {
    const url: string = `https://api.agora.io/v1/apps/${environment.agora.appId}/cloud_recording/resourceid/${resourceId}/mode/${mode}/start`;
    const body = {
      cname: channelName,
      uid: 80085,
      clientRequest: {
        token: environment.agora.rtcToken,
        recordingConfig: {
          maxIdleTime: 30,
          streamTypes: 0, // only audio
          channelType: 0,
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
    return this._http.post(url, body, { headers: this.getHeaders() });
  }

  stopRecording(channelName: string, resourceId: string, sid: string, mode="mix"): Observable<any> {
    const url: string = `https://api.agora.io/v1/apps/${environment.agora.appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/${mode}/stop`;
    const body = {
      cname: channelName,
      uid: 80085,
      clientRequest: {
        token: environment.agora.rtcToken,
      }
    }
    return this._http.post(url, body, { headers: this.getHeaders() });
  }
}
