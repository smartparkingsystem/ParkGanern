import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../../models/user';
// import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})

export class ProfilePage {
  user = {} as User;
  firstname = null;
  lastname = null;
  userForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private alertCtrl: AlertController, private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {
    this.userForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      license: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{1}\\d{2}\\s{1}\\d{2}\\s{1}\\d{6}$')])],
      mobilenum: ['', Validators.compose([Validators.required, Validators.pattern('^(0)(9)\\d{9}$')])],
      platenum: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{3}\\s{1}\\d{3,4}$')])],
      birthday: ['', Validators.required]
    });
  }

  ionViewDidLoad() {
    this.afAuth.authState.take(1).subscribe(auth => {
      const userRef: firebase.database.Reference = this.afDatabase.database.ref(`/users/${auth.uid}`);
      userRef.on('value', userSnapshot => {
        this.user = userSnapshot.val();
        this.user.birthday = moment(this.user.birthday,"YYYY-MM-DD").format('MM/DD/YYYY')
      });
    });  
  }

  ionViewWillLoad() { 
  }

  alert(message: string){
    this.alertCtrl.create({
      title: "Notice",
      message: message,
      buttons: ['OK'],
      mode: "ios"
    }).present();
  }

  validate(): boolean {
    if (this.userForm.valid) {
      return true;
    }

    let errorMsg = '';

    let control = this.userForm.controls['platenum'];
    let control2 = this.userForm.controls['license'];
    let control3 = this.userForm.controls['mobilenum'];
    if (!control.valid) {
      if (control.errors.pattern) {
        errorMsg = 'Plate number must follow this format: AAA 123 or AAA 1234';
        this.alert(errorMsg);
        console.log(control.errors.pattern);
        console.log(this.userForm.value['platenum']);
      }
    }
    if (!control2.valid) {
      if (control2.errors.pattern) {
        errorMsg = 'License number must follow this format: A01 23 456789';
        this.alert(errorMsg);
        console.log(control.errors.pattern);
        console.log(this.userForm.value['license']);
      }
    }
    if (!control3.valid) {
      if (control3.errors.pattern) {
        errorMsg = 'Mobile number must follow this format: 09876543210';
        this.alert(errorMsg);
        console.log(control.errors.pattern);
        console.log(this.userForm.value['mobilenum']);
      }
    }
    return false;
  }

  createProfile(user: User){
    if (this.validate()){
      try {
        this.afAuth.authState.take(1).subscribe(auth => {
          const userRef: firebase.database.Reference = this.afDatabase.database.ref(`users/${auth.uid}`);
          userRef.update(user).then (auth => {
            this.alert('Sucess! You\'re registered!');
            this.navCtrl.setRoot('MenuPage');
          })
        })
      }catch(error){
        this.alert(error.message)
      }
    }    
  }    
}
