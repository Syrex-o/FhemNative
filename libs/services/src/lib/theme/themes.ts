import { Theme } from '@fhem-native/types/common';

export const bright: Theme = {
    name: 'bright',
    properties: {
        '--primary': '#111415',
        '--secondary': '#191d1e',
        '--tertiary': '#272b30',
        '--quaternary': '#45484b',

        '--text-a': '#fefefe',
        '--text-b': '#71777e',
        '--text-c': '#a4a3a7',
        '--text-d': '#a0a3bd',

        '--btn-text-a': '#E1F3F5',
        '--btn-text-b': '#3d5bf1',
        '--btn-text-c': '#000',

        '--btn-bg-a': '#3d5bf1',
        '--btn-bg-a-inactive': '#A7A7A7',
        '--btn-bg-b': 'transparent',
        '--btn-bg-c': '#fff'
    }
};

export const dark: Theme = {
    name: 'dark',
    properties: {
        '--primary': 'rgb(25, 24, 22)',
        '--secondary': 'rgb(13, 13, 12)',
        '--tertiary': 'rgb(35, 37, 36)',
        '--quaternary': 'rgb(235, 241, 244)',

        '--text-a': 'rgb(247, 251, 250)',
        '--text-b': 'rgba(247, 251, 250, 0.5)',
        '--text-c': 'rgb(14, 15, 16)',
        '--text-d': 'rgba(14, 15, 16, 0.5)',

        '--btn-text-a': '#E1F3F5',
        '--btn-text-b': '#2f85ff',
        '--btn-text-c': '#000',

        '--btn-bg-a': '#2f85ff',
        '--btn-bg-a-inactive': '#A7A7A7',
        '--btn-bg-b': 'transparent',
        '--btn-bg-c': '#fff'
    }
};