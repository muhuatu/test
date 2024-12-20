import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  constructor(private http: HttpClient) {}

  // read
  getApi(url: string) {
    return this.http.get(url);
  }

  // Add
  postApi(url: string, postData: any) {
    return this.http.post(url, postData);
  }

  // renew
  putApi(url: string, postData: any) {
    return this.http.put(url, postData);
  }

  // delete
  delApi(url: string, postData: any) {
    return this.http.delete(url);
  }
}
