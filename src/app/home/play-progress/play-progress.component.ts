import { Component, OnInit, NgZone } from '@angular/core';
import { PlayerProgressService, PlayerProgress } from '~/app/shared/services/player-progress.service';
import { Slider} from "tns-core-modules/ui/slider"

@Component({
  selector: 'play-progress',
  templateUrl: './play-progress.component.html',
  styleUrls: ['./play-progress.component.css'],
  moduleId: module.id,
})
export class PlayProgressComponent implements OnInit {
  progress: PlayerProgress;

  constructor(
    private playerProgress: PlayerProgressService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.playerProgress.getProgress().subscribe(
      progress => {
        this.zone.run(() => this.progress = progress);
      });
  }

  updateProgress(slider:Slider) {
    this.playerProgress.seek(slider.value);
  }
}
