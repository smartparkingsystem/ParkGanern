import { Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../../models/user';
import * as firebase from 'firebase/app';
import { FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';

/**
 * Generated class for the EditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {

  user = {} as User;
  userForm: FormGroup;
  firstname = AbstractControl;
  lastname = AbstractControl;

  @ViewChild('fname') fname; 
  @ViewChild('lname') lname;
  @ViewChild('bday') bday;
  @ViewChild('mobilenum') mobilenum;
  @ViewChild('license') license;
  @ViewChild('platenum') platenum;

  userId: string;

  showFields = false;

  constructor(private alertCtrl: AlertController, private formBuilder: FormBuilder, private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {
    // this.userId = this.afAuth.auth.currentUser.uid;
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
      });
    });  
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


  saveProfile(user: User){
    if (this.validate()){
      try {
        this.afAuth.authState.take(1).subscribe(auth => {
          const userRef: firebase.database.Reference = this.afDatabase.database.ref(`users/${auth.uid}`);
          userRef.update(user).then (auth => {
            this.alert('You\'re profile has been updated!');
            this.navCtrl.setRoot('UserPage');
          })
        })
      }catch(error){
        this.alert(error.message)
      }
    }    
  }

}
