import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../../models/user';
import * as firebase from 'firebase/app';

/**
 * Generated class for the NotifuserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notifuser',
  templateUrl: 'notifuser.html',
})
export class NotifuserPage {

  user = {} as User;
  notification = [];
  userId;

  constructor(public navCtrl: NavController, public navParams: NavParams, private afAuth: AngularFireAuth, public afDatabase: AngularFireDatabase) {
    this.userId = this.afAuth.auth.currentUser.uid;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotifuserPage');
    // this.afAuth.authState.take(1).subscribe(auth => {
    //   const userRef: firebase.database.Reference = this.afDatabase.database.ref(`/users/${auth.uid}/notifications`);
      
    //   userRef.on('value', userSnapshot => {
    //     this.user = userSnapshot.val();
    //     this.notification = userSnapshot.val();
    //   });
    // }); 

    // this.afAuth.authState.take(1).subscribe(auth => {
    //   const userRef: firebase.database.Reference = this.afDatabase.database.ref(`/users/${auth.uid}/notifications`);
    //   userRef.on('value', userSnapshot => {
    //     this.user = userSnapshot.val();
    //   });
    // }); 

    firebase.database().ref('/users/'+this.userId+'/notifications').on('value', notifRef => {
      var notif = notifRef.val();

      // for clear
      this.notification=[];
      for (var i in notif) {
        this.notification.push(notif[i]);
      }
      // console.log(this.notification);
    });

  }


}
