import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
// import { User } from '../../models/user';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  logOut() {
    this.afAuth.auth.signOut().then();
    this.navCtrl.setRoot('LoginPage');
  }

}
