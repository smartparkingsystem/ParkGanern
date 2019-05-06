import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController} from 'ionic-angular';
import { ReserveParkingPage } from '../reserve-parking/reserve-parking';

/**
 * Generated class for the StatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-status',
  templateUrl: 'status.html',
})
export class StatusPage {

  constructor(private navCtrl: NavController, private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StatusPage');
  }

  viewPage(){
    this.navCtrl.push(ReserveParkingPage);
  }

  openPrompt2() {
    let alert = this.alertCtrl.create({
      title: 'Confirmation',
      message: 'Are you Sure?',
      buttons: [
        {
          text: 'No',
          role: 'no',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Buy clicked');
          }
        }
      ]
    });
    alert.present();
  }

}
