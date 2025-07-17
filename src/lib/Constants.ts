// Constants used all over the app
export const MAX_64BIT_INT = (2n ** 63n) - 1n;
export const MIN_64BIT_INT = -(2n ** 63n);
export const NUMBER_RANGE = MAX_64BIT_INT - MIN_64BIT_INT

// Styling
export const NUMBER_ROW_HEIGHT = 48; // height + padding, in px
export const NUMBER_ROW_MARGIN = 2;  // margin between 2 rows, in px

// Scrollbar
export const SCROLLBAR_WIDTH = 25;  // Scrollbar width, in px
export const SCROLLBAR_THUMB_HEIGHT = 25;    // in px
export const BUTTON_SCROLL_AMOUNT = 0.001    // How much the scrollbar is moved on clicking the buttons (0-1)

// Smaller values for debugging (8 bit signed integer range, -128 to 127)
// export const MAX_64BIT_INT = (2n ** 7n) - 1n;
// export const MIN_64BIT_INT = -(2n ** 7n);