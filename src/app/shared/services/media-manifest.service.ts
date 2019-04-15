import { Injectable } from '@angular/core';
import { Observable, from, ReplaySubject, of } from 'rxjs';
import { knownFolders } from 'tns-core-modules/file-system/file-system';
import { concatMap, map, tap, catchError } from 'rxjs/operators';

/**
 * @description An item which was fully downloaded.
 */
export class DownloadedItem {
  /**
   * @description The url where this item was downloaded from.
   */
  url:string;

  /**
   * @description The full path, including file name and extension, where the file was downloaded to.
   */
  path:string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaManifestService {
  private fileUpdates: Observable<any> = new Observable;
  private manifestFile = knownFolders.documents().getFile("downloadManifest");
  private downloadManifest: DownloadedItem[] = [];
  private downloadManifest$:ReplaySubject<DownloadedItem[]>;

  /**
   * @description Get the manifest of all files which were fully downloaded.
   */
  getManifest():Observable<DownloadedItem[]> {
    if (this.downloadManifest$ != null) {
      return this.downloadManifest$;
    }

    this.downloadManifest$ = new ReplaySubject;

    from(this.manifestFile.readText()).pipe(
      map(text => JSON.parse(text)),
      // If the json parsing fails (e.g. if the file is empty)
      // return null.
      catchError(() => of([null]))
    ).subscribe(this.downloadManifest$);

    return this.downloadManifest$;
  }

  /**
   * Register an item as having been fully downloaded
   * @param item The item which has been downloaded.
   * @returns An observable which resolves when the updated manifest has been preserved to disk.
   */
  registerItem(item:DownloadedItem): Observable<any> {
    return this.fileUpdates.pipe(
      // Update the in memory record of the manifest.
      tap(() => {
        this.downloadManifest.push(item);
        this.downloadManifest$.next(this.downloadManifest);
      }),
      // When ongoing writes are ... dang
      concatMap(() => {
        return from(this.manifestFile.writeText(JSON.stringify(this.downloadManifest)));
      })
    )
  }
}
