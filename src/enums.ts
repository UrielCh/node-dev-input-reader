export const EVENT_TYPES = ['keyup', 'keypress', 'keydown'] as const;
export const SUPPORTED_USB_DEVICE_TYPES = [
    'js', // joydev
    'mouse', // mousedev
    'event'
] as const;

export const SUPPORTED_USB_DEVICE_TYPES_SET = new Set(SUPPORTED_USB_DEVICE_TYPES) as Set<string>;
