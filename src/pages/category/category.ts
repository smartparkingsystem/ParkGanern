import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';

@IonicPage()
@Component({
selector: 'category',
templateUrl: 'category.html',
})

export class CategoryPage {
    public categories: Array<any> = [];
    catRef: firebase.database.Reference = this.afDatabase.database.ref(`/categories`);
    constructor(private afDatabase: AngularFireDatabase, private alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {}

    ionViewWillLoad(){        
        this.catRef.on('value', itemSnapshot => {
            this.categories = [];
            itemSnapshot.forEach( itemSnap => {
                this.categories.push(itemSnap.val());
                return false;
            });
        });
    }
    newCategory(){
        const prompt = this.alertCtrl.create({
            title: 'New Category',
            inputs: [
                {
                name: 'category',
                placeholder: 'Input Name'
                },
            ],
            buttons: [
                {
                text: 'Cancel',
                handler: data => {
                    console.log('Cancel clicked');
                    }
                },
                {
                text: 'Save',
                handler: data => {
                    const catRef: firebase.database.Reference = this.afDatabase.database.ref(`/categories/`);
                    catRef.push(data.category);
                    }
                }
            ]
            });
            prompt.present();
    }
}