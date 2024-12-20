import { AfterViewInit, Component } from '@angular/core';
import { GoogleMapsService } from './http-service/GoogleMapsService';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

}
