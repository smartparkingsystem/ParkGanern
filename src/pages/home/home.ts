import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

	@ViewChild('username') uname;
	@ViewChild('password') password;

	constructor(public navCtrl: NavController) {

  	}

	signIn() {
	}

}
