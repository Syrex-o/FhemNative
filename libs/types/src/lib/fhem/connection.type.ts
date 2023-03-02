// FHEM Connection interfaces

// connection profile
export interface ConnectionProfile {
	IP: string,
	PORT: string,
	WSS: boolean,
	type: string,
	basicAuth: boolean,
	USER: string,
	PASSW: string
}