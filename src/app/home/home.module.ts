import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import {NativeScriptFormsModule} from "nativescript-angular/forms"
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { ReactiveFormsModule } from "@angular/forms";
import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";
import { DailyLessonComponent } from './daily-lesson/daily-lesson.component';
import { DownloadProgressComponent } from './download-progress/download-progress.component';
import { PlayProgressComponent } from './play-progress/play-progress.component';
import { PlaypackSpeedComponent } from './playpack-speed/playpack-speed.component';

@NgModule({
    imports: [
        NativeScriptCommonModule,
		HomeRoutingModule,
		NativeScriptFormsModule,
        ReactiveFormsModule,
        NativeScriptHttpClientModule
    ],
    declarations: [
        HomeComponent,
        DailyLessonComponent,
        DownloadProgressComponent,
        PlayProgressComponent,
        PlaypackSpeedComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class HomeModule { }
