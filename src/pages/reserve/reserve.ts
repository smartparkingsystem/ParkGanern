import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Reservation } from '../../models/reservation';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';

/**
 * Generated class for the ReservePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reserve',
  templateUrl: 'reserve.html',
})

export class ReservePage {
  @ViewChild('startPicker') pickerStart;
  public reservation = {} as Reservation;
  public categories: Array<any> = [];
  public category: String;
  listRef: firebase.database.Reference = this.afDatabase.database.ref(`list`);
  spaceRef: firebase.database.Reference = this.afDatabase.database.ref(`spaces`);

  constructor(private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams){

  }

  alert(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: ['OK']
    }).present();
  }

  ngOnInit(){
    
  }

  ionViewWillLoad(){
    var minTime = moment('10:00', ['HH:mm', moment.ISO_8601]);
    var maxTime = moment('21:00', ['HH:mm', moment.ISO_8601]).format();

    this.listRef.on('value', itemSnapshot => {
      itemSnapshot.forEach( itemSnap => {
        this.categories.push(itemSnap.val());
        console.log(itemSnap.val());
      });
    });
  }

  ionViewDidLoad() {    

  }

  getToday(): string {
    return moment(new Date(), ["HH:mm A", moment.ISO_8601]).format();
  }

  reserveSpace(time: string, space: string){
    let reservation = {} as Reservation;
    this.afAuth.authState.take(1).subscribe(auth => {
      reservation.user = auth.uid; 
      // reservation.time = time;
      reservation.space = space;
      const reservationRef: firebase.database.Reference = this.afDatabase.database.ref(`reservations`);
      const statusRef: firebase.database.Reference = this.afDatabase.database.ref(`spaces/${space}`);
      reservationRef.push(reservation).then (() => {
        statusRef.update({status: "unavailable"});
        this.alert("Congratulations");
      });
    });
  }
 
  findSpace(category: string, start: any, end: any){
    var tempSpaces = new Array();
    var hasConflict = false;
    const rangeMoment = extendMoment(moment);
    if(category === undefined || start === undefined || end === undefined){
      this.alert("Please complete the form");
      return;
    }
    const reservationRef: firebase.database.Reference = this.afDatabase.database.ref(`reservations`);
    var userTime = rangeMoment.range(moment(start, 'hh:mm'), moment(end, 'hh:mm'));
    var promise = new Promise((resolve, reject) => {
      this.afDatabase.database.ref(`categories/${category}`).orderByValue().on('value', function(snapshot){
        snapshot.forEach(function(data){
          if(data.val() === true){
            reservationRef.child(data.key).orderByKey().on('value',function(snapshot){
              snapshot.forEach(function(childSnapshot){
                var bookingData = childSnapshot.val();
                var time = rangeMoment.range(moment(bookingData.start, 'hh:mm'), moment(bookingData.end, 'hh:mm'));
                
                if(userTime.overlaps(time)){
                  hasConflict = true;                  
                }
              });
              if (hasConflict === false){
                console.log(snapshot.key);
                tempSpaces.push(snapshot.key);                
                resolve();
              }
              hasConflict = false;
            });
          }
        });
      });
    });

   
    setTimeout(() => {
      if(tempSpaces.length == 0){
        console.log("HAAAA");
        this.alert("No spaces available for given time and category. Please try again.");
      }else{
        this.navCtrl.push('SpacesPage', {data: tempSpaces, start_time: moment(start, 'hh:mm A'), end_time: moment(end, 'hh:mm A'), cat: category});
      }
    }, 3000);
    
  }
}
