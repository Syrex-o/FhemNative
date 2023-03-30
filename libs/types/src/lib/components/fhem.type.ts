// Fhem Device component information

export interface FhemDeviceConfig {
    device: string,
    reading?: string,

    // determine, when to render component
    connected?: boolean,
    deviceAvailable?: boolean,
    readingAvailable?: boolean
}

export interface FhemDeviceRenderer {
    render: boolean,
    loading: boolean,

    deviceNotFound?: boolean,
    readingNotFound?: boolean
}