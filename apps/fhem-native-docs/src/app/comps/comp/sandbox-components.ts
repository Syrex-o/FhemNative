import { FhemComponentSettings } from "@fhem-native/types/components";

export const SandboxComponents: Record<string, FhemComponentSettings[]> = {
    'Box': [
        {
            UID: 'Box_A',
            name: 'Box',
            position: { top: '0%', left: '0%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {}
        },
        {
            UID: 'Box_B',
            name: 'Box',
            position: { top: '0%', left: '50%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {}
        },
        {
            UID: 'Box_C',
            name: 'Box',
            position: { top: '50%', left: '0%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {
                "borderRadiusTopLeft": 30,
                "borderRadiusTopRight": 30,
                "borderRadiusBottomLeft": 30,
                "borderRadiusBottomRight": 30,
                "backgroundColor": "#003366",
                "gradientBackgroundColor": ["#2ec6ff", "#272727"],
                "showHeader": false,
                "customBorder": true
            }
        },
        {
            UID: 'Box_D',
            name: 'Box',
            position: { top: '50%', left: '50%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {
                "headline": "Box Container",
                "borderRadiusTopLeft": 30,
                "borderRadiusTopRight": 30,
                "borderRadiusBottomLeft": 30,
                "borderRadiusBottomRight": 30,
                "headerStyle": "bold-italic",
                "headerPosition": "center",
                "backgroundColor": "#86d993",
                "gradientBackgroundColor": ["#2ec6ff", "#272727"],
                "showShadow": false,
                "customNotch": true
            }
        },
    ],

    'Box Container': [
        {
            UID: 'Box_Container_A',
            name: 'Box Container',
            position: { top: '0%', left: '0%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {}
        },
        {
            UID: 'Box_Container_B',
            name: 'Box Container',
            position: { top: '0%', left: '50%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {
                "headline": "Box Container",
                "borderRadiusTopLeft": 30,
                "borderRadiusTopRight": 30,
                "borderRadiusBottomLeft": 30,
                "borderRadiusBottomRight": 30,
                "headerStyle": "bold-italic",
                "headerPosition": "center",
                "backgroundColor": "#86d993",
                "gradientBackgroundColor": ["#2ec6ff", "#272727"],
                "showShadow": false,
                "customNotch": true
            }
        },
    ],

    'Button': [
        {
            UID: 'Button_A',
            name: 'Button',
            position: { top: '0%', left: '0%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {
                "device": "DEMO",
                "iconSize": 30
            }
        },
        {
            UID: 'Button_B',
            name: 'Button',
            position: { top: '0%', left: '50%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {
                "device": "DEMO",
                "iconOnly": true
            }
        },
        {
            UID: 'Button_C',
            name: 'Button',
            position: { top: '50%', left: '0%', width: '40%', height: '40%', zIndex: 1 },
            inputs: {
                "device": "DEMO",
                "sendCommand": "set DEMO on",
                "buttonColor": "#2ec6ff",
                "labelColor": "#000",
                "label": "send command 'set DEMO on'"
            }
        },
    ]
};