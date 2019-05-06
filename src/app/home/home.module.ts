import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";
import { DailyLessonComponent } from './daily-lesson/daily-lesson.component';
import { DownloadProgressComponent } from './download-progress/download-progress.component';
import { PlayProgressComponent } from './play-progress/play-progress.component';

@NgModule({
    imports: [
        NativeScriptCommonModule,
        HomeRoutingModule
    ],
    declarations: [
        HomeComponent,
        DailyLessonComponent,
        DownloadProgressComponent,
        PlayProgressComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class HomeModule { }
