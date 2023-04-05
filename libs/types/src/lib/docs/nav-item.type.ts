export interface NavItem {
    name: string,
    info?: string,
    icon?: string,
    ref?: string[],
    subItems?: NavItem[]
}