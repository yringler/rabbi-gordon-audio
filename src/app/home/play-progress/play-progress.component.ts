import { Component, OnInit, NgZone } from '@angular/core';
import { PlayerProgressService } from '~/app/shared/services/player-progress.service';
import { Slider} from "tns-core-modules/ui/slider"

@Component({
  selector: 'play-progress',
  templateUrl: './play-progress.component.html',
  styleUrls: ['./play-progress.component.css'],
  moduleId: module.id,
})
export class PlayProgressComponent implements OnInit {
  duration: number;
  current: number;
  /** 
   * @description As the media plays, the Progress component is updated to the current location in the media.
   * When that happens, the change event is fired.
   * 
   * Here, flag wether the change is from normal progress or from user jumping.
   */
  changeIsFromProgress: boolean;

  constructor(
    private playerProgress: PlayerProgressService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.playerProgress.getProgress().subscribe(
      progress => {
        this.zone.run(() => {
          this.duration = progress.duration;
          this.current = progress.current;

          this.changeIsFromProgress = true;
        });
      });
  }

  updateProgress(slider:Slider) {
    if (this.changeIsFromProgress) {
      this.changeIsFromProgress = false;
      return;
    }

    this.playerProgress.seek(slider.value);
  }
}
