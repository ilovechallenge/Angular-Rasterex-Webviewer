export const MARKUP_TYPES = {
    TEXT: {
        type: 9,
    },
    CALLOUT: {
        type: 6,
        subType: 6,
    },
    NOTE: {
        type: 10,
        subType: 0,
    },
    SHAPE: {
        RECTANGLE: {
            type: 3,
            subType: 0,
        },
        ROUNDED_RECTANGLE: {
            type: 3,
            subType: 1,
        },
        ELLIPSE: {
            type: 4,
        },
        POLYGON: {
            type: 1,
            subtype: 2,
        },
        CLOUD: {
            type: 5,
            subtype: 0,
        }
    },
    ERASE: {
        type: 0,
        subType: 1,
    },
    ARROW: {
        type: 6,
        SINGLE_END: {
            type: 6,
            subtype: 0
        },
        FILLED_SINGLE_END: {
            type: 6,
            subtype: 1
        },
        BOTH_ENDS: {
            type: 6,
            subtype: 2
        },
        FILLED_BOTH_ENDS: {
            type: 6,
            subtype: 3,
        },
    },
    PAINT: {
        HIGHLIGHTER: {
            type: 3,
            subType: 3,
        },
        FREEHAND: {
            type: 0, 
            subType: 0,
        },
        POLYLINE: {
            type: 1, 
            subType: 1,
        },
    },
    COUNT: {
        type: 13,
    },
    STAMP: {
        type: 11,
        subType: 1,
    },
    MEASURE: {
        LENGTH: {
            type: 7,
        },
        AREA: {
            type: 8,
            subType: 0,
        },
        PATH: {
            type: 1,
            subType: 3,
        },
    },
    SIGNATURE: {
        type: 11,
        subType: 3,
    },
}