// google-maps.service.ts
import { Injectable } from '@angular/core';

declare var google: any; // 引用 google 作為全局變數

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  private map: any = null; // 地圖實例
  private markers: any[] = []; // 標記清單
  private service: any = null; // PlacesService

  constructor() {}

  // 初始化地圖 (地圖模式)
  initMap(
    mapElement: HTMLElement,
    center = { lat: 22.9965, lng: 120.2034 }
  ): void {
    const mapOptions = {
      center: center,
      zoom: 12,
    };
    this.map = new google.maps.Map(mapElement, mapOptions);
    this.initList();
  }

  // 初始化列表 (列表模式)
  initList(): void {
    if (!this.service) {
      const fakeMap = document.createElement('div'); // 假地圖 DOM
      this.service = new google.maps.places.PlacesService(fakeMap);
    }
  }

  // 搜尋地點，返回結果 (列表 & 地圖模式都可用)
  searchPlaces(
    type: string,
    location: any,
    keyword: string,
    callback: (results: any[]) => void
  ): void {
    // 如果提供了地名關鍵字，則使用 Geocoding API 獲取經緯度
    if (keyword) {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address: keyword }, (results:any, status:any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const location = results[0].geometry.location; // 拿到此地點的經緯度
          this.performNearbySearch(type, location, keyword, callback);
        } else {
          console.error('無法轉換地名為經緯度:', status);
          callback([]);
        }
      });
    } else {
      // 如果沒有提供關鍵字，則使用原來的中心位置來進行搜尋
      this.performNearbySearch(type, location, keyword, callback);
    }
  }


  private performNearbySearch(
    type: string,
    location: any,
    keyword: string,
    callback: (results: any[]) => void
  ): void {
    const request = {
      location: location,
      radius: '5000', // 設定搜尋範圍
      type: type,  // 根據類型來搜尋，如 'restaurant', 'tourist_attraction' 等
      keyword: keyword || type, // 搜尋的關鍵字或類型
    };

    if (!this.service) {
      console.error('PlacesService 未初始化');
      return;
    }

    this.service.nearbySearch(request, (results: any[], status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const limitedResult = results.slice(0,12);  // 限制只抓12筆
        callback(limitedResult);
      } else {
        console.error('搜尋地點失敗:', status);
        if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.warn('沒找到結果，請換個關鍵字');
        }
        callback([]); // 返回空陣列表示無結果
      }
    });
  }


  // 添加標記 (地圖模式)
  addMarker(place: any): void {
    if (!this.map) return;

    const marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      title: place.name,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<h4>${place.name}</h4><p>${place.vicinity || '無地址'}</p>`,
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });

    this.markers.push(marker);
  }

  // 清除標記
  clearMarkers(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }
}
