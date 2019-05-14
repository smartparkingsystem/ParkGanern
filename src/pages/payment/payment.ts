import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../../models/user';
import { Reservation } from '../../models/reservation';
import * as moment from 'moment';

/**
 * Generated class for the PaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
  user = {} as User;
  reservation = {} as Reservation;

  constructor(private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {
  }

  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad PaymentPage');
  // }

  ionViewDidLoad() {
    this.afAuth.authState.take(1).subscribe(auth => {
      // const userRef: firebase.database.Reference = this.afDatabase.database.ref(`/users/${auth.uid}`);
      // userRef.on('value', userSnapshot => {
      //   this.user = userSnapshot.val();
      //   this.user.firstname;
      // });
      this.afDatabase.database.ref(`/users/${auth.uid}`).on('value', userSnapshot => {
        this.user = userSnapshot.val();
        console.log(this.user)
      })
  
      this.afDatabase.database.ref(`/users/${auth.uid}/reservation`).on('value', userSnapshot => {
        userSnapshot.forEach(snapshot => {
          this.reservation = snapshot.val()
        })
        console.log(this.reservation);
        console.log(this.reservation.end)
      })
    });  
  }

  homePage(){
    this.navCtrl.push('MenuPage');
  }

}
