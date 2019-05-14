import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { Reservation } from '../../models/reservation';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import { variable } from '@angular/compiler/src/output/output_ast';

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
  public allSpaces = []
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

  confirmReservation(message: string, space: any){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.reserveSpace(space);
          }
        },
        {
          text: 'Cancel',
          handler: () => {

          }
        }

      ]
    }).present();
  }

  alert(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: [
        {
          text: 'Ok'
        }

      ]
    }).present();
  }

  ionViewWillLoad(){   
   
      
  }

  ionViewDidLoad() {
    this.allSpaces = [];
    console.log(this.spaces)
    console.log("kakdjaskdj")
    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val(); 
    
      for(let k in result){  
        if(this.spaces.some((i) => i.id === k)){
          this.allSpaces.push({ id: k, color: 'reserved' })
        }else{
          if(result[k].status === 'occupied'){
            this.allSpaces.push({ id: k, color: 'occupied' })
          }else if(result[k].status === 'available'){
            this.allSpaces.push({ id: k, color: 'available' })
          } 
        }
               
      }    

    });
  }

  ionViewDidEnter(){
    var isEnabled
    var test = moment(this.navParams.get('start_time'), 'hh:mm A');
    this.listRef.on('value', itemSnapshot => {
      itemSnapshot.forEach( itemSnap => {
        this.categories.push(itemSnap.val());
        console.log(itemSnap.val());
      });
    });
  }

  showConfirmed(space: any){
    this.space = space;
    if(space.color === "occupied"){
      this.alert("The space you are trying to reserve is not available. Please select a different space.")
    }else{
      this.confirmReservation("Reserve space " + space.id + " from " + this.start + " to " + this.end + "?", this.space);  
    }
    

  }

  reserveSpace(space: any){
    console.log("BEEE BEEE BEEE");
    let reservation = {} as Reservation;

    this.afAuth.authState.take(1).subscribe(auth => {

      reservation.user = auth.uid;
      reservation.start = this.start;
      reservation.end = this.end;
      reservation.space = space.id;

      this.afDatabase.database.ref(`preferences`).orderByValue().once('value', preference => {
        var result = preference.val();
        var rangeMoment = extendMoment(moment)
        var range = rangeMoment.range(moment(reservation.start, 'HH:mm'), moment(reservation.end, 'HH:mm'))
        reservation.fee = (range.diff('minutes') / parseInt(result.rate)) * parseInt(result.amount)
        console.log(parseInt(result.rate)) 
      })
      console.log(reservation.fee)
      console.log(this.space)
      this.afDatabase.database.ref(`reservations/${reservation.space}`).push(reservation);
      this.afDatabase.database.ref(`users/${auth.uid}/reservation`).push(reservation); 
      this.afDatabase.database.ref(`users/${auth.uid}`).update({hasReserved: true}); 
    }); 



    this.navCtrl.setRoot('MenuPage');
  }

}
