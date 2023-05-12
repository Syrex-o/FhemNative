export interface Theme {
    name: ThemeName;
    properties: Record<string, string>;
}

export type ThemeName = 'bright'|'dark';