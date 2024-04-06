/**
 * Main version code
 */
export const MobileVersionCode: Version = {
	major: 4, minor: 3, patch: 8
}

export const DesktopVersionCode: Version = {
	major: 4, minor: 3, patch: 8
}

/**
 * List of Release notes for current release
 */
export const ReleaseNotes: ReleaseNoteItem[] = [
    {type: 'New', text: 'Added new icon pack'},
    {type: 'New', text: 'Added ability to import components via QR-code'},
    {type: 'Fix', text: 'Prevent release notes view after initial app install'},
    {type: 'Fix', text: 'Updated version code and style in component details from context menu'},
];


export type NoteItemType = 'New'|'Fix'|'Note';
export interface ReleaseNoteItem {
	type: NoteItemType,
	text: string
} 

export interface Version {
    major: number,
    minor: number,
    patch: number
}