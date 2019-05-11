import { Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
// import { User } from '../../models/user';
import { AngularFireAuth } from 'angularfire2/auth';
// import { EmailValidator } from '@angular/forms';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {
  // user = {} as User;

  @ViewChild('email') email;
  @ViewChild('password') password;

  constructor(private alertCtrl: AlertController, private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams) {
  }

  alert(message: string){
    this.alertCtrl.create({
      title: "Notice",
      subTitle: message,
      buttons: ['OK'],
      mode: "ios"
    }).present();
  }

  login() {
    if(this.email.value === 'admin@test.com' && this.password.value === 'admin1'){
      this.navCtrl.setRoot('AdminPage');
    }else{
      try{
      // this.afAuth.auth.signInWithEmailAndPassword(this.email.value, this.password.value);

        this.afAuth.auth.signInWithEmailAndPassword(this.email.value, this.password.value)
        .then(data => {
          this.alert('Sucess! You\'re logged in!');
          this.navCtrl.setRoot('MenuPage');
        })
        .catch( (error) => {
              console.log("got an error:", error);
              if (error.code == 'auth/network-request-failed'){
                // wala sya internet connection here
                this.alert('Connection Timeout!');
              }
              else if(error.code == 'auth/wrong-password' || error.code == 'auth/user-not-found' || error.code == 'auth/invalid-email'){
                // invalid login here
                this.alert('Invalid Login!');
              }
        });      
      }catch(error){
        this.alert(error);
      }
    }
  }


  register() {
    this.navCtrl.push('RegisterPage');
  }

  ionViewWillLoad(){

  }

}

