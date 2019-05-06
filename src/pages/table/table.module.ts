import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import * as table from './table';

@NgModule({
  declarations: [
    table.TablePage,
  ],
  imports: [
    IonicPageModule.forChild(table.TablePage),
  ],
})
export class TablePageModule {}
