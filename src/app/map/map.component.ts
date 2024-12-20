import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { GoogleMapsService } from '../http-service/GoogleMapsService';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None, // 設置為 None，讓樣式全局生效
})
export class MapComponent implements AfterViewInit {
  private mode: 'map' | 'list' = 'map'; // 當前模式
  private center = { lat: 22.99651782738241, lng: 120.2034743572298 };

  constructor(private googleMapsService: GoogleMapsService) {}

  ngAfterViewInit(): void {
    const mapElement = document.getElementById('map')!;
    const modeToggle = document.getElementById(
      'mode-toggle'
    ) as HTMLSelectElement;
    const typeSelect = document.getElementById(
      'place-type'
    ) as HTMLSelectElement;
    const searchInput = document.getElementById(
      'search-box'
    ) as HTMLSelectElement;

    this.initService();

    // 模式切換
    modeToggle.addEventListener('change', (event) => {
      this.mode = (event.target as HTMLSelectElement).value as 'map' | 'list';
      this.initService();
    });

    // 切換地點類型
    typeSelect.addEventListener('change', (event) => {
      const type = (event.target as HTMLSelectElement).value;
      this.updatePlaces(type, searchInput.value);
    });

    // 搜尋
    searchInput.addEventListener('input', () => {
      const type = typeSelect.value; // 類型選擇
      const keyword = searchInput.value; // 搜尋框關鍵字
      this.updatePlaces(type, keyword); // 更新地點列表
    });
  }

  // 初始化地圖或清單
  private initService(): void {
    const mapElement = document.getElementById('map')!;
    const placeList = document.getElementById('place-list')!;

    if (this.mode === 'map') {
      // 地圖模式，隱藏列表
      mapElement.style.display = 'block';
      placeList.style.display = 'none';

      this.googleMapsService.initMap(mapElement, this.center);
    } else {
      // 列表模式，隱藏地圖
      placeList.style.display = 'block';
      mapElement.style.display = 'none';
      this.googleMapsService.initList();
    }

    this.updatePlaces('tourist_attraction', ''); // 預設顯示旅遊景點
  }

  // 更新地點列表或標記
  private updatePlaces(type: string, keyword: string): void {
    const placeList = document.getElementById('place-list')!;
    placeList.innerHTML = '';

    const location = new google.maps.LatLng(this.center.lat, this.center.lng);

    this.googleMapsService.searchPlaces(type, location, keyword, (results) => {
      this.googleMapsService.clearMarkers();

      // console.log(results); // 抓資料用ㄉ

      if (this.mode === 'map' && results.length > 0) {
        // 假設搜尋有結果，則將地圖中心移動到第 1 個結果的經緯度
        this.center = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        this.googleMapsService.initMap(
          document.getElementById('map')!,
          this.center
        ); // 更新地圖中心
      }

      // 限制搜尋結果為 20 次以內
      results.forEach((place) => {
        // 列表模式
        if (this.mode === 'list') {
          // 一張張卡片呈現
          const card = document.createElement('div');
          card.classList.add('place-card');

          // 圖片
          const imageUrl = this.getPhotoUrl(place);
          const imageElement = document.createElement('img');
          imageElement.src = imageUrl;
          imageElement.alt = place.name;
          imageElement.classList.add('place-image');
          card.appendChild(imageElement);

          // 景點名稱
          const title = document.createElement('h3');
          title.textContent = place.name;
          card.appendChild(title);

          // 評分，要有星星
          const ratingContainer = document.createElement('p');
          ratingContainer.textContent = '評分：';
          const ratingStars = this.createStarRating(place.rating || 0); // 獲取星星
          ratingContainer.appendChild(ratingStars);
          card.appendChild(ratingContainer);

          // 地址
          const address = document.createElement('p');
          address.textContent = `地址：${place.vicinity || '無地址'}`;
          card.appendChild(address);

          // 點選卡片會有詳細資料
          card.addEventListener('click', () => {
            alert('這邊會連到詳情的dialog');
          });
          placeList.appendChild(card); // 將卡片添加到列表中
        }
        // 地圖模式
        else if (this.mode === 'map') {
          this.googleMapsService.addMarker(place);
        }
      });
    });
  }

  // 創造星星
  private createStarRating(rating: number): HTMLElement {
    const ratingContainer = document.createElement('span'); // 裝星星的容器
    const fullStar = '★'; // 全星
    const halfStar = '☆'; // 半星

    const fullStars = Math.floor(rating); // 全星
    const hasHalfStar = rating % 1 >= 0.5; // 半星
    const emptyStars = 5 - Math.ceil(rating); // 空星：5顆星 - 全星跟半星

    // 全星
    for (let i = 0; i < fullStars; i++) {
      ratingContainer.innerHTML += fullStar;
    }

    // 半星
    if (hasHalfStar) {
      ratingContainer.innerHTML += fullStar;
    }

    // 空星
    for (let i = 0; i < emptyStars; i++) {
      ratingContainer.innerHTML += halfStar;
    }

    // 添加數字評分
    const ratingText = document.createElement('span');
    ratingText.textContent = `(${rating.toFixed(1)})`; // 顯示到小數點後1位
    ratingContainer.appendChild(ratingText);

    return ratingContainer;
  }

  // 根據地點的照片來獲取圖片 URL
  private getPhotoUrl(place: any): string {
    if (place.photos && place.photos.length > 0) {
      const photo = place.photos[0];
      return photo.getUrl({ maxWidth: 400, maxHeight: 400 }); // 圖片最大值
    }
    return 'path/to/default-image.jpg'; // 若沒有圖片，顯示預設圖片
  }
}
