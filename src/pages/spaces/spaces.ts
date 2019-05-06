import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { Reservation } from '../../models/reservation';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { variable } from '@angular/compiler/src/output/output_ast';
import { endTimeRange } from '@angular/core/src/profile/wtf_impl';

/**
 * Generated class for the SpacesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-spaces',
  templateUrl: 'spaces.html',
})
export class SpacesPage {
  timerVar;
  timerVal;

  public spaces = [];
  public start: string;
  public end: string;
  public space: string;
  public category: string;
  public categories: Array<any> = [];
  public reservation = {} as Reservation;

  listRef: firebase.database.Reference = this.afDatabase.database.ref(`list`);
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams, private afDatabase: AngularFireDatabase, private afAuth: AngularFireAuth) {
    this.spaces = this.navParams.get('data');
    this.start = moment(this.navParams.get('start_time')).format('hh:mm A');
    this.end = moment(this.navParams.get('end_time')).format('hh:mm A');
    this.category = this.navParams.get('cat');

  }

  alert(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.reserveSpace();
            // this.startTimer();
          }
        },
        {
          text: 'Cancel',
          handler: () => {

          }
        }

      ],
      mode: 'ios'
    }).present();
  }

  alert2(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: ['OK'],
      mode: 'ios'
    }).present();
  }

  ionViewWillLoad(){
    var test = moment(this.navParams.get('start_time'), 'hh:mm A');
    console.log(test);
    console.log(moment(test).format('hh:mm A'));
    console.log(this.navParams.get('cat'));
    this.listRef.on('value', itemSnapshot => {
      itemSnapshot.forEach( itemSnap => {
        this.categories.push(itemSnap.val());
        console.log(itemSnap.val());
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SpacesPage');
  }

  showConfirmed(space: string){
    this.space = space;
    this.alert("Reserve space " + space + " from " + this.start + " to " + this.end + "?");  

  }

  reserveSpace(){
    console.log("BEEE BEEE BEEE");
    let reservation = {} as Reservation;
    this.afAuth.authState.take(1).subscribe(auth => {
      reservation.user = auth.uid;
      reservation.fee = 0.00;
      reservation.start = this.start;
      reservation.end = this.end;
      
      this.afDatabase.database.ref(`reservations/${this.space}`).push(reservation);
      this.afDatabase.database.ref(`users/${auth.uid}/reservation`).set(reservation); 
      this.afDatabase.database.ref(`users/${auth.uid}/reservation`).update({space: this.space}); 
      this.afDatabase.database.ref(`users/${auth.uid}`).update({hasReserved: true}); 
    }); 

    this.navCtrl.setRoot('MenuPage');
    this.startTimer()
  }

  startTimer(){
    setTimeout(() => {
      this.alert2('30 MINS. LEFT before PARKING STARTS.');
    },5000)
  }
}
