import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StatusPage } from '../status/status'

/**
 * Generated class for the ReserveParkingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reserve-parking',
  templateUrl: 'reserve-parking.html',
})
export class ReserveParkingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReserveParkingPage');
  }

  viewStatus(){
    this.navCtrl.push(StatusPage);
  }

}
