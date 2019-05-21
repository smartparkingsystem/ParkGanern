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
  minTime: any;
  maxTime: any;
  listRef: firebase.database.Reference = this.afDatabase.database.ref(`list`);
  spaceRef: firebase.database.Reference = this.afDatabase.database.ref(`spaces`);

  constructor(private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams){
    var open, close;

    this.afDatabase.database.ref(`preferences`).orderByValue().on('value', dataSnapshot => {

      console.log(dataSnapshot.val())
      var preferences = dataSnapshot.val()
      console.log(preferences.maxTime)
      var newOpen = moment(preferences.minTime,"HH:mm").fromNow(true).slice(0, 1)
      open = moment(preferences.minTime,"HH:mm").add(8, 'hours');
      close = moment(preferences.maxTime, "HH:mm").add(8, 'hours');
  
      this.minTime = moment().set({hour: open.hour(), minute: open.minute(), seconds: 0}).toISOString();
      this.maxTime = moment().set({hour: close.hour(), minute: close.minute(), seconds: 0}).toISOString();
      console.log(this.maxTime)
    });
    
  }

  alert(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: ['OK']
    }).present();
  }

  ngOnInit(){
    const now = moment();

    
    
  }

  ionViewWillLoad(){
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

 
  findSpace(category: string, start: any, end: any){
    var tempSpaces = new Array();
    var hasConflict = false;
    const rangeMoment = extendMoment(moment);
    var now = moment()
    var range = rangeMoment.range(moment(start, 'HH:mm'), moment(end, 'HH:mm'))
    if(category === undefined || start === undefined || end === undefined){
      this.alert("Please complete the form");
      return;
    }

    if(moment(end, 'HH:mm').isBefore(now) || moment(start, 'HH:mm').isBefore(now)){
      this.alert("Invalid time input.")
      return;
    }

    if(moment(end, 'HH:mm').isBefore(moment(start, 'HH:mm'))){
      this.alert("End time cannot be earlier than start time. Please review your input.")
      return;
    }
    
    const reservationRef: firebase.database.Reference = this.afDatabase.database.ref(`reservations`);
    var userTime = rangeMoment.range(moment(start, 'HH:mm A'), moment(end, 'HH:mm A'));
      this.afDatabase.database.ref(`categories/${category}`).orderByValue().on('value', function(snapshot){
        snapshot.forEach(function(data){
          reservationRef.child(data.key).orderByKey().on('value', snapshot => {
            snapshot.forEach(childSnapshot => {
              var bookingData = childSnapshot.val();
              var time = rangeMoment.range(moment(bookingData.start, 'HH:mm A'), moment(bookingData.end, 'HH:mm A'));
              if(userTime.overlaps(time)){
                console.log(time)
                hasConflict = true;                  
              }
            });
            if (hasConflict === false){
              if(data.val() === true){
                tempSpaces.push({ id: snapshot.key, color: 'recommended'});   
              }else{
                tempSpaces.push({ id: snapshot.key, color: 'available'});   
              }
            }else{
              tempSpaces.push({ id: snapshot.key, color: 'occupied'})
            }
            hasConflict = false;
          });
          
        });
      });
  
    console.log(tempSpaces)
   
    setTimeout(() => {
      if(tempSpaces.length == 0){
        this.alert("No spaces available for given time and category. Please try again.");
      }else{
        this.navCtrl.push('SpacesPage', {data: tempSpaces, start_time: moment(start, 'hh:mm A'), end_time: moment(end, 'hh:mm A'), cat: category});
      }
    }, 3000);
    
  }
}
