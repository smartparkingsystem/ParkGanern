import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import { Reservation } from '../../models/reservation';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import * as firebase from 'firebase';
import { UserPage } from '../user/user';

/**
 * Generated class for the ExtendPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-extend',
  templateUrl: 'extend.html',
})
export class ExtendPage {
  @ViewChild('startPicker') pickerStart;
  user = {} as User;
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
    this.reservation = this.navParams.get('data')
    this.listRef.on('value', itemSnapshot => {
      itemSnapshot.forEach( itemSnap => {
        this.categories.push(itemSnap.val());
        console.log(itemSnap.val());
      });
    });
  }

  ionViewDidLoad() {    
    this.afAuth.authState.take(1).subscribe(auth => {
    // var userId = this.afAuth.auth.currentUser.uid;
        this.afDatabase.database.ref(`/users/${auth.uid}`).on('value', userSnapshot => {
          this.user = userSnapshot.val();
          console.log(this.user)
        })
        this.afDatabase.database.ref(`/users/${auth.uid}/reservation`).on('value', userSnapshot => {
          userSnapshot.forEach(snapshot => {
            this.reservation = snapshot.val()
          })
        })
      })
  }

  getToday(): string {
    return moment(new Date(), ["HH:mm A", moment.ISO_8601]).format();
  }

 
  // findSpace(category: string, start: any, end: any){
  findSpace(end: any){
    let reservation = this.reservation;
    // var tempSpaces = new Array();
    // var hasConflict = false;
    var userId;
    var reservationId;
    const rangeMoment = extendMoment(moment);
    var now = moment()
    var range = rangeMoment.range(moment(reservation.start, 'HH:mm'), moment(end, 'HH:mm'))
    console.log(range)
    if(end === undefined){
      this.alert("Please complete the form");
      return;
    }

    if(moment(end, 'HH:mm').isBefore(now)){
      this.alert("Invalid time input.")
      return;
    }

    if(moment(end, 'HH:mm').isBefore(moment(reservation.start, 'HH:mm'))){
      this.alert("End time cannot be earlier than start time. Please review your input.")
      return;
    }
    
    const reservationRef: firebase.database.Reference = this.afDatabase.database.ref(`reservations`);

    reservationRef.child(reservation.space).orderByKey().on('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var bookingData = childSnapshot.val();
        var time = rangeMoment.range(moment(bookingData.start, 'hh:mm'), moment(bookingData.end, 'hh:mm'));
        
        // if(end.within(time)){
        //   this.alert("No Space Available")
        //   // not available                
        // }else{
        
      });
    });

    firebase.database().ref(`occupied`).orderByKey().once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var info = childSnapshot.val();
        if(info.user === reservation.user){
          reservationId = childSnapshot.key
          console.log(reservationId)
          console.log(info.user)
          console.log("the ending is here")
          firebase.database().ref(`occupied/${reservationId}`).update({ 'end': moment(end, "hh:mm").format("hh:mm A") })
        }
      })
    })

    firebase.database().ref(`users/${reservation.user}/reservation`).once('value', userSnap => {
      userSnap.forEach(data => {
        console.log(data.key)
        firebase.database().ref(`users/${reservation.user}/reservation/${data.key}`).update({'end': moment(end, "hh:mm").format("hh:mm A")})
      })
    })

  
    firebase.database().ref(`preferences`).orderByValue().once('value', preference => {
      var result = preference.val();
      var rangeMoment = extendMoment(moment)
      var range = rangeMoment.range(moment(reservation.start, 'HH:mm'), moment(reservation.end, 'HH:mm'))
      var diff = range.diff('minutes')
      reservation.fee = (diff / parseInt(result.rate)) * parseInt(result.amount)
      reservation.fee = parseInt(reservation.fee.toFixed(2))

      firebase.database().ref(`users/${reservation.user}/reservation`).once('value', userSnap => {
        userSnap.forEach(data => {
          console.log(data.key)
          firebase.database().ref(`users/${reservation.user}/reservation/${data.key}`).update({'fee': reservation.fee})
        })
      }) 
      
      firebase.database().ref(`occupied`).orderByKey().once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          var info = childSnapshot.val();
          if(info.user === reservation.user){
            reservationId = childSnapshot.key
            firebase.database().ref(`occupied/${reservationId}`).update({ 'fee': reservation.fee})
          }
        })
      })
    })

      this.navCtrl.setRoot('MenuPage');
    }
    
    // console.log(tempSpaces)
   
    // setTimeout(() => {
    //   if(tempSpaces.length == 0){
    //     this.alert("No spaces available for given time and category. Please try again.");
    //   }else{
    //     this.navCtrl.push('SpacesPage', {data: tempSpaces, start_time: moment(start, 'hh:mm A'), end_time: moment(end, 'hh:mm A'), cat: category});
    //   }
    // }, 3000);
    
  }