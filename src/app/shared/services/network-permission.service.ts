import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { connectionType, getConnectionType, startMonitoring } from "tns-core-modules/connectivity";
import {hasKey, getBoolean, setBoolean} from "tns-core-modules/application-settings";
import { distinct } from 'rxjs/operators';

/**
 * @description Id of settings which controls wether the app will download media over mobile data.
 */
const dataSettingId = "has-data-perm";

/**
 * @description Wether you can download, and why not.
 */
enum PermissionState {
	/** @description Download possible. Either on wifi, or a mobile connection and the user allows it. */
	granted,
	/** @description On a mobile connection, and the user forbids it. */
	refused,
	/** @description On a mobile connection, and we have no idea what the user wants. */
	unknown,
	/** @description Download? Now? You kidding? */
	notPossible
}

@Injectable({
	providedIn: 'root'
})
export class NetworkPermissionService {
	private networkPermission$: ReplaySubject<boolean> = new ReplaySubject();

	/**
	 * @description Emits whenever permission is requested to download over mobile data.
	 */
	private permissionRequested$: ReplaySubject<null> = new ReplaySubject();

	constructor() {
		this.networkPermission$.next(NetworkPermissionService.getPermission());

		startMonitoring(connection => {
			this.networkPermission$.next(NetworkPermissionService.getPermission(connection));
		});
	}

	/**
	 * @description Announce that you want to download over data.
	 */
	requestPermission() {
		this.permissionRequested$.next();
	}

	/**
	 * @description Get wether can download.
	 * 
	 * True means go ahead.
	 * 
	 * False means that the user does not allow download on mobile data.
	 * 
	 * Null means either we didn't ask the user yet, so we don't know what he wants,
	 * or that it doesn't matter, because we don't have an internet connection.
	 */
	getPermission(): Observable<boolean> {
		// Only fire when permission changes.
		return this.networkPermission$.pipe(
			distinct()
		);
	}

	setPermission(canUseData: boolean) {
		setBoolean(dataSettingId, canUseData);

		this.networkPermission$.next(NetworkPermissionService.getPermission());
	}

	/**
	 * Returns wether the app is able to download over the given connection type.
	 */
	private static getPermission(connection?: connectionType): boolean {
		if (connection == null) {
			connection = getConnectionType();
		}

		switch (connection) {
			case connectionType.wifi:
				return true;
			case connectionType.mobile:
				return hasKey(dataSettingId) ? getBoolean(dataSettingId) : null;
			default:
				return null;
		}
	}
}
