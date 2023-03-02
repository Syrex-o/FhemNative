// Room Interfaces

import { FhemComponentSettings } from "../components"

// Structure Room
export interface Room{
    ID: number,
    UID: string,
	name: string,
	icon: string,
	components: FhemComponentSettings[],
	useRoomAsGroup?: boolean,
	groupRooms?:Array<any>,
	groupComponents?: any,
	// color
	color?: string
}

// Route params of room
export interface RoomParams {
	name: string,
	UID: string
}