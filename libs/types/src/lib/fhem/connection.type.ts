// FHEM Connection interfaces

// connection profile
export interface ConnectionProfile {
	IP: string,
	PORT: string,
	// secure option
	WSS: boolean,
	type: string,
	basicAuth: boolean,
	USER: string,
	PASSW: string
}