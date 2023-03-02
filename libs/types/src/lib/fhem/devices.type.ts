// Fhem Device Interfaces

// Device Listener Handler
export interface ListenDevice {
	id: string,
	device: string,
	handler?: (fhemDevice: FhemDevice)=> void
}

// FHEM device
export interface FhemDevice {
	id: number,
	device: string,
	readings: Record<string, any>,
	internals: Record<string, any>,
	attributes: Record<string, any>,
}