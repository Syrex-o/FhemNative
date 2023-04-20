import { FhemComponentSettings } from "@fhem-native/types/components";

export const SandboxComponents: Record<string, FhemComponentSettings[]> = {
    'Box': [
        {
            UID: 'Box_A',
            name: 'Box',
            position: { top: '0%', left: '0%', width: '40%', height: '50%', zIndex: 1 },
            inputs: []
        },
        {
            UID: 'Box_B',
            name: 'Box',
            position: { top: '0%', left: '50%', width: '40%', height: '50%', zIndex: 1 },
            inputs: []
        }
    ]
};