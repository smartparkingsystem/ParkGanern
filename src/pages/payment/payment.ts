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
    this.afAuth.authState.take(1).subscribe(auth => {
      let self = this;
      let space = this.reservation.space;
      this.afDatabase.database.ref(`/users/${auth.uid}/reservation`).remove();
      this.afDatabase.database.ref(`/users/${auth.uid}`).update({hasReserved: false});

      this.afDatabase.database.ref(`reservations/${space}`).orderByKey().on('value', function(snapshot){
        snapshot.forEach(function(data){
          var reservationData = data.val();
          if(reservationData.user === auth.uid){
            self.afDatabase.database.ref(`reservations/${space}/${data.key}`).remove();
          }
        });
      });
    
      // TEST CODE
      this.afDatabase.database.ref(`occupied/${auth.uid}`).orderByKey().on('value', function(snapshot){
        snapshot.forEach(function(data){
          var reservationData = data.val();
          if(reservationData.user === auth.uid){
            self.afDatabase.database.ref(`occupied/${auth.uid}/${data.key}`).remove();
          }
        });
      });
    }); 
    this.navCtrl.push('MenuPage');
  }

}
