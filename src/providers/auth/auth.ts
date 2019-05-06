import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

  constructor(public afAuth: AngularFireAuth, public http: HttpClient) {
    console.log('Hello AuthProvider Provider');
  }

  get Session(){
    return this.afAuth.authState;
  }
 

}
