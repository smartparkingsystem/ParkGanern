import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
selector: 'admin',
templateUrl: 'admin.html',
})

export class AdminPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {}

    public viewTable(){
    	this.navCtrl.push('TablePage')
    }

    public addCat(){
    	this.navCtrl.push('CategoryPage')
    }

    public sendMessage(){
        // this.navCtrl.push('AdminContactsPage')
        this.navCtrl.push('NotifadminPage')
    }

    public viewMap(){
        this.navCtrl.push('MapPage')
    }

    // public viewOccupied(){
    // 	this.navCtrl.push('OccupiedPage')
    // }

    // public viewReserved(){
    //     this.navCtrl.push('ReservedPage');
    // }

}