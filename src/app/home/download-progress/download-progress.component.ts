import { Component, OnInit, NgZone } from '@angular/core';
import { DownloadProgressService, DownloadProgress } from '~/app/shared/services/download-progress.service';

@Component({
  selector: 'download-progress',
  templateUrl: './download-progress.component.html',
  styleUrls: ['./download-progress.component.css'],
  moduleId: module.id,
})
export class DownloadProgressComponent implements OnInit {

  /** @description How far along an ongoing download is. */
  currentProgress: number;

  constructor(
    private downloadProgress: DownloadProgressService,
    private zone: NgZone) { }

  ngOnInit() {
    this.downloadProgress.getProgress().subscribe(progress => {
      this.zone.run(() => this.currentProgress = progress.progress * 100);
    })
  }

}
