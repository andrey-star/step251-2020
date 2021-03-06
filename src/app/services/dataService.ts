/*
 * Copyright 2020 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  private static stringToArrayBuffer(str: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  getProtoData(uri: string): Observable<string> {
    return this.http.get<string>(uri);
  }

  getBinaryProtoData(uri: string): Observable<ArrayBuffer> {
    return this.http.get(uri, {responseType: 'arraybuffer'});
  }

  getLocalProtoData(): Observable<string> {
    return of(window.localStorage.getItem('data'));
  }

  getLocalProtoBinaryData(): Observable<ArrayBuffer> {
    const binaryData = window.localStorage.getItem('binary_data');
    if (!binaryData) {
      return of(undefined);
    }
    return of(DataService.stringToArrayBuffer(binaryData));
  }

  getLocalJsonData(): Observable<string> {
    return of(window.localStorage.getItem('json_data'));
  }
}
