import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GESTURE_PRIORITY_TOGGLE } from 'ionic-angular/umd/gestures/gesture-controller';
/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var google:any;

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  @ViewChild('map') mapRef:ElementRef;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.DisplayMap();
  }

  DisplayMap(){
    const location = new google.maps.LatLng('10.7202','122.5621');

    const options = {
      center:location,
      zoom: 10  
    };

    const map = new google.maps.Map(this.mapRef.nativeElement, options);

  }

}
