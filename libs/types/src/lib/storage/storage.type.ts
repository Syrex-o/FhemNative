// storage related interfaces

// Default AppSetting
export interface AppSetting {
	name: string,
	default: unknown,
	toStorage: boolean,
	callback?: any
}

// Storage Setting
export interface StorageSetting {
	name: string,
	default?: unknown,
	change?: unknown
}