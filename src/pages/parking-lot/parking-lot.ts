import { Component } from '@angular/core';
// import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IonicPage, NavController} from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ReserveParkingPage } from '../reserve-parking/reserve-parking';
/**
 * Generated class for the ParkingLotPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-parking-lot',
  templateUrl: 'parking-lot.html',
})
export class ParkingLotPage {

  constructor(private navCtrl: NavController, private alertCtrl: AlertController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParkingLotPage');
  }

  openPrompt1() {
    let alert = this.alertCtrl.create({
      title: 'Confirmation',
      message: 'Do you want to reserve space?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Reserve',
          handler: () => {
            // console.log('Buy clicked');
            this.navCtrl.push(ReserveParkingPage);
          }
        }
      ]
    });
    alert.present();
  }

}
