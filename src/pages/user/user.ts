import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../../models/user';
import * as moment from 'moment';

/**
 * Generated class for the UserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {
  user = {} as User;
  showFields = false;

  constructor(private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {
  }
  
  ionViewDidLoad() {
    this.afAuth.authState.take(1).subscribe(auth => {
      const userRef: firebase.database.Reference = this.afDatabase.database.ref(`/users/${auth.uid}`);
      userRef.on('value', userSnapshot => {
        this.user = userSnapshot.val();
        this.user.birthday = moment(this.user.birthday,"YYYY-MM-DD").format('MMMM DD, YYYY')
      });
    });  
  }

  // editProfile(){
  //   this.showFields = true;
  // }

  editPage(){
    this.navCtrl.push('EditPage');
  }

  saveProfile(user: User){
    this.afAuth.authState.take(1).subscribe(auth => {
      const userRef: firebase.database.Reference = this.afDatabase.database.ref(`/users/${auth.uid}`);
      userRef.update(user);
    });
  }
}
