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

  alert(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.reserveSpace();
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

  ionViewWillLoad(){   
   
      
  }

  ionViewDidLoad() {
    this.allSpaces = [];
    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val(); 
    
      for(let k in result){  
        if(this.spaces.includes(k)){
          this.allSpaces.push({ id: k, color: 'reserved', outline: 'false' })
        }else{
          if(result[k].status === 'occupied'){
            this.allSpaces.push({ id: k, color: 'occupied', outline: 'true' })
          }else if(result[k].status === 'available'){
            this.allSpaces.push({ id: k, color: 'available', outline: 'true' })
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

    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {      
      var result = spaceSnapshot.val(); 
    
      for(let k in result){  
        var space = { id: k, value: true };
        if (!this.spaces.some(item => item.id === space.id)) {
          this.spaces.push(space);
        }
         
      }    
      
    });
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
      reservation.start = this.start;
      reservation.end = this.end;
      reservation.space = this.space

      this.afDatabase.database.ref(`preferences`).orderByValue().once('value', preference => {
        var result = preference.val();
        var rangeMoment = extendMoment(moment)
        var range = rangeMoment.range(moment(reservation.start, 'HH:mm'), moment(reservation.end, 'HH:mm'))
        reservation.fee = (range.diff('minutes') / parseInt(result.rate)) * parseInt(result.amount)
        console.log(parseInt(result.rate)) 
      })
      console.log(reservation.fee)
      
      this.afDatabase.database.ref(`reservations/${this.space}`).push(reservation);
      this.afDatabase.database.ref(`users/${auth.uid}/reservation`).push(reservation); 
      this.afDatabase.database.ref(`users/${auth.uid}`).update({hasReserved: true}); 
    }); 



    this.navCtrl.setRoot('MenuPage');
  }

}
