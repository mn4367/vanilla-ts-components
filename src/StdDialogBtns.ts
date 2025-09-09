import { generateUUID } from "@vanilla-ts/core";
import { StdDialog, StdDlgOptions } from "./StdDialog.js";


/**
 * Returns a symbol with a unique description (UUID). This function should _always_ be used to
 * create symbols for buttons since it guarantees that button symbol constants are unique over the
 * complete application even if constants with the same name are used (e.g. imported from different
 * modules).
 * @returns A symbol with a unique description (UUID).
 */
export function STD_DLG_BTN(): symbol {
    return Symbol(generateUUID());
}

/**
 * A special 'button' constant which, when passed as a member of {@link StdDlgOptions.Buttons}, will
 * create a visual separator instead of a real 'button'.
 */
export const SEP = STD_DLG_BTN();

/**
 * A special 'button' constant which indicates, that the current standard dialog has not been
 * cancelled by clicking/pressing a provided button but instead by other means, e.g. by pressing the
 * `Escape` key. This symbol is intended to be used _only_ for this special case, it must not be
 * used as a symbol for a button nor in a translation map for button captions.
 */
export const STD_DLG_CANCELLED = STD_DLG_BTN();

/**
 * Used as the dialog return value for every button that is not contained in the current dialog
 * return values map {@link StdDialog.ReturnValue}. This symbol must not be used as a symbol for a
 * button nor in a translation map for button captions.
 */
export const UNKNOWN_BTN = STD_DLG_BTN();

/**
 * Predefined regulat buttons.
 * @todo Expand this list.
 */
/* eslint-disable jsdoc/require-jsdoc */
export const btn_OK = STD_DLG_BTN();
export const btn_YES = STD_DLG_BTN();
export const btn_NO = STD_DLG_BTN();
export const btn_CANCEL = STD_DLG_BTN();
export const btn_REPEAT = STD_DLG_BTN();
export const btn_TRY_AGAIN = STD_DLG_BTN();
export const btn_APPLY = STD_DLG_BTN();
export const btn_APPLY_ALT = STD_DLG_BTN();
export const btn_CONTINUE = STD_DLG_BTN();
export const btn_BACK = STD_DLG_BTN();
export const btn_DONE = STD_DLG_BTN();
export const btn_ENTER = STD_DLG_BTN();
export const btn_SKIP = STD_DLG_BTN();
export const btn_REJECT = STD_DLG_BTN();
export const btn_CLOSE = STD_DLG_BTN();
export const btn_ADD = STD_DLG_BTN();
export const btn_REMOVE = STD_DLG_BTN();
export const btn_DELETE = STD_DLG_BTN();
export const btn_SUBMIT = STD_DLG_BTN();
export const btn_RELOAD = STD_DLG_BTN();
export const btn_SETTINGS = STD_DLG_BTN();
export const btn_SETTINGS_ALT = STD_DLG_BTN();
export const btn_INFO = STD_DLG_BTN();
export const btn_INFO_ALT = STD_DLG_BTN();
export const btn_INFO_PL = STD_DLG_BTN();
export const btn_ABOUT = STD_DLG_BTN();
export const btn_ABOUT_ALT = STD_DLG_BTN();
export const btn_SAVE = STD_DLG_BTN();
export const btn_SAVE_AS = STD_DLG_BTN();
export const btn_SAVE_AS_ALT = STD_DLG_BTN();
export const btn_COPY = STD_DLG_BTN();
export const btn_CUT = STD_DLG_BTN();
export const btn_PASTE = STD_DLG_BTN();
export const btn_QUIT = STD_DLG_BTN();
/* eslint-enable */

/**
 * A map that contains the names of all predefined button symbol constants. The map can be helpful
 * for purposes like logging or displaying the 'name' of a button symbol constant. The map can also
 * or rather should be extended with all custom button symbol constants created in an application.
 */
export const StdDialogBtnNames: Record<symbol, string> = {
    /* eslint-disable jsdoc/require-jsdoc */
    /** Special internal values. */
    [STD_DLG_CANCELLED]: "STD_DLG_CANCELLED",
    [SEP]: "SEP", // Just for completeness, this will never appear/be returned.
    [UNKNOWN_BTN]: "UNKNOWN_BTN",
    /** Regular buttons. */
    [btn_OK]: "btn_OK",
    [btn_YES]: "btn_YES",
    [btn_NO]: "btn_NO",
    [btn_CANCEL]: "btn_CANCEL",
    [btn_REPEAT]: "btn_REPEAT",
    [btn_TRY_AGAIN]: "btn_TRY_AGAIN",
    [btn_APPLY]: "btn_APPLY",
    [btn_APPLY_ALT]: "btn_APPLY_ALT",
    [btn_CONTINUE]: "btn_CONTINUE",
    [btn_BACK]: "btn_BACK",
    [btn_DONE]: "btn_DONE",
    [btn_ENTER]: "btn_ENTER",
    [btn_SKIP]: "btn_SKIP",
    [btn_REJECT]: "btn_REJECT",
    [btn_CLOSE]: "btn_CLOSE",
    [btn_ADD]: "btn_ADD",
    [btn_REMOVE]: "btn_REMOVE",
    [btn_DELETE]: "btn_DELETE",
    [btn_SUBMIT]: "btn_SUBMIT",
    [btn_RELOAD]: "btn_RELOAD",
    [btn_SETTINGS]: "btn_SETTINGS",
    [btn_SETTINGS_ALT]: "btn_SETTINGS_ALT",
    [btn_INFO]: "btn_INFO",
    [btn_INFO_ALT]: "btn_INFO_ALT",
    [btn_INFO_PL]: "btn_INFO_PL",
    [btn_ABOUT]: "btn_ABOUT",
    [btn_ABOUT_ALT]: "btn_ABOUT_ALT",
    [btn_SAVE]: "btn_SAVE",
    [btn_SAVE_AS]: "btn_SAVE_AS",
    [btn_SAVE_AS_ALT]: "btn_SAVE_AS_ALT",
    [btn_COPY]: "btn_COPY",
    [btn_CUT]: "btn_CUT",
    [btn_PASTE]: "btn_PASTE",
    [btn_QUIT]: "btn_QUIT",
    /* eslint-enable */
};
