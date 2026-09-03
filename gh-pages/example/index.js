/**
 * Modes for `allEvents()`.
 */
var ALL_EVENTS;
(function (ALL_EVENTS) {
    /**
     * Removes all event listeners which have been registered with `on()` permanently from the
     * component.
     */
    ALL_EVENTS[ALL_EVENTS["OFF"] = 0] = "OFF";
    /**
     * Suspends the execution of all event listeners which have been registered with `on()` on the
     * component.
     */
    ALL_EVENTS[ALL_EVENTS["SUSPEND"] = 1] = "SUSPEND";
    /**
     * Resumes the execution of all event listeners which have been registered with `on()` on the
     * component.
     */
    ALL_EVENTS[ALL_EVENTS["RESUME"] = 2] = "RESUME";
})(ALL_EVENTS || (ALL_EVENTS = {}));
/**
 * Default values for constructing events (`{ bubbles: true, cancelable: false, composed: true }`).
 */
const DEFAULT_EVENT_INIT_DICT = { bubbles: true, cancelable: false, composed: true }; // eslint-disable-line jsdoc/require-jsdoc
/**
 * Default values for constructing cancelable events
 * (`{ bubbles: true, cancelable: true, composed: true }`).
 */
const DEFAULT_CANCELABLE_EVENT_INIT_DICT = { bubbles: true, cancelable: true, composed: true }; // eslint-disable-line jsdoc/require-jsdoc
/**
 * Utility class that creates a custom event. `T` is the type/name of the custom event, the `detail`
 * property of the event will have a `Sender` property `S` that is the component instance that emits
 * the event and optional typed payload data `D`.
 */
class ACustomComponentEvent extends CustomEvent {
    /**
     * Create a custom event with a `Sender` property and optional payload data.
     * @param type The type/name of the event.
     * @param sender The component instance that emits the event.
     * @param eventData Optional custom event payload data.
     * @param customEventInitDict Optional event properties. This is an object with the properties
     * `bubbles`, `cancelable` and `composed`. If `customEventInitDict` is `undefined`, `bubbles`
     * and `composed` are set to `true` and `cancelable` is set to `false`.
     */
    constructor(type, sender, eventData, customEventInitDict) {
        super(type, {
            /* eslint-disable jsdoc/require-jsdoc */
            ...(customEventInitDict || DEFAULT_EVENT_INIT_DICT),
            detail: {
                Sender: sender,
                ...(eventData ? eventData : {})
            }
            /* eslint-enable */
        });
    }
    /**
     * Shorthand for the getting the `detail` property of the event.
     * @returns The detail property of the event.
     */
    get $() {
        return this.detail;
    }
}
/** Custom 'pointerhold' event for components. */
class PointerHoldEvent extends ACustomComponentEvent {
    /**
     * Create PointerHoldEvent event.
     * @param sender The event emitter.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("pointerhold", sender, {}, customEventInitDict);
    }
    /**
     * Sets up additional necessary pointer hold handlers.
     * @param owner The `ANodeComponent<Node>` that owns the DOM element.
     * @param options Options for the pointer hold handler (received from `on()` and `once()`).
     * @returns The additional two `IEventListener` objects.
     */
    static setupAuxiliaryListeners(owner, options) {
        if (!(owner.DOM instanceof Element)) {
            return [];
        }
        let delay = 500;
        let interval = 100;
        let onClick = false;
        let once = undefined;
        if (typeof options === "object") {
            delay = "Delay" in options
                ? options.Delay === undefined ? 500 : Math.max(options.Delay, 0)
                : 500;
            interval = "Interval" in options
                ? options.Interval === undefined ? undefined : Math.max(options.Interval, 0)
                : 100;
            onClick = options.OnClick ?? false;
            once = "once" in options ? options.once : undefined;
        }
        let delayID = undefined;
        let intervalID = undefined;
        const listenerOpts = { capture: true }; // eslint-disable-line jsdoc/require-jsdoc
        once !== undefined && (listenerOpts.once = once);
        let pointerHoldEventFired = false;
        const result = [];
        if (onClick) {
            const clickFnc = (_ev) => {
                pointerHoldEventFired || owner.dispatch(new PointerHoldEvent(owner));
                pointerHoldEventFired = false;
            };
            owner.DOM.addEventListener("click", clickFnc, listenerOpts);
            result.push({ Type: "click", Listener: clickFnc, Options: listenerOpts, Suspended: false }); // eslint-disable-line jsdoc/require-jsdoc
        }
        const pointerDownFnc = (ev) => {
            owner.DOM.setPointerCapture(ev.pointerId);
            delayID = setTimeout(() => {
                clearTimeout(delayID);
                owner.dispatch(new PointerHoldEvent(owner));
                pointerHoldEventFired = true;
                if (interval !== undefined) {
                    intervalID = setInterval(() => {
                        pointerHoldEventFired = true;
                        owner.dispatch(new PointerHoldEvent(owner));
                    }, interval);
                }
            }, delay);
        };
        owner.DOM.addEventListener("pointerdown", pointerDownFnc, listenerOpts);
        const pointerUpFnc = (ev) => {
            owner.DOM.releasePointerCapture(ev.pointerId);
            clearInterval(intervalID);
            clearTimeout(delayID);
        };
        owner.DOM.addEventListener("pointerup", pointerUpFnc, listenerOpts);
        result.push(
        /* eslint-disable jsdoc/require-jsdoc */
        { Type: "pointerdown", Listener: pointerDownFnc, Options: listenerOpts, Suspended: false }, { Type: "pointerup", Listener: pointerUpFnc, Options: listenerOpts, Suspended: false }
        /* eslint-enable */
        );
        return result;
    }
}

/**
 * The type of a component.
 */
var ComponentType;
(function (ComponentType) {
    /** Basic component without any visual represantation. */
    ComponentType[ComponentType["COMPONENT"] = 1] = "COMPONENT";
    /** Pure (text) node component. */
    ComponentType[ComponentType["NODE"] = 2] = "NODE";
    /** Component based on a void HTML element (`HTMLElementVoid`). */
    ComponentType[ComponentType["ELEMENT"] = 3] = "ELEMENT";
    /** Component based on an HTML element with children (`HTMLElementWithChildren`). */
    ComponentType[ComponentType["ELEMENT_WITH_CHILDREN"] = 4] = "ELEMENT_WITH_CHILDREN";
    /** Fragment component. */
    ComponentType[ComponentType["FRAGMENT"] = 5] = "FRAGMENT";
})(ComponentType || (ComponentType = {}));

/**
 * HTML elements which have a native `disabled` property (tag names).
 */
/**
 * HTML elements which can be tabbed to by default.
 * @todo Verify this list.
 */
const HTMLTagsWithNativeTabbing = [
    "A",
    "AREA",
    "BUTTON",
    "INPUT",
    "OBJECT",
    "SELECT",
    "TEXTAREA"
];
// #endregion
//////////////////////////////
//////////////////////////////
// #region Misc
/** Orientation (of a component). */
var Orientation;
(function (Orientation) {
    Orientation[Orientation["HORIZONTAL"] = 0] = "HORIZONTAL";
    Orientation[Orientation["VERTICAL"] = 1] = "VERTICAL";
})(Orientation || (Orientation = {}));
// #endregion
//////////////////////////////

/**
 * Creates or modifes a class by extending it with all properties/functions from other classes. The
 * resulting class will have the constructor and the properties/functions of `clazz` and also all
 * properties/functions of the classes given in `classes`.
 * @param createNew If `true`, a new class with the name `__extended__` (derived from `clazz`) is
 * created. This class then will be part of the prototype chain. If `createNew` is `false` then
 * `clazz` itself (!) will be extended, e.g. the prototype of it is modified thus it's no longer the
 * same as before. If a class with only a default constructor is desired result passing `class { }`
 * for `clazz` is a solution.
 * @param clazz The class to be extended.
 * @param classes The classes to be merged into the class given by `clazz`.
 * @returns A (new) class extended with all properties/functions from the given classes:
 * 1) If `createNew` is `true` and `clazz` is a normal class then first an anonymous class derived
 *    from `clazz` is created internally. This class will be part of the prototype chain. The mixins
 *    will go into this derived class and it will have the constructor of `clazz`, `clazz` itself
 *    remains untouched. The result is a new class with all properties/functions from `clazz` and
 *    `classes`.
 * 2) If `createNew` is true and `clazz` is an abstract class, the same as in 1) happens with the
 *    side effect that now instances can be created from the returned new class.
 * 3) If `createNew` is `false` and `clazz` is a regular class, the mixins will go into `clazz`. It
 *    has the same constructor as before but `clazz` is modified from now on! The return value is
 *    also not a new class but instead (the modified) `clazz`. The TypeScript compiler now knows all
 *    mixins to `clazz` on the the returned class but not yet on the type of `clazz` itself, so they
 *    have to be declared with an interface, e.g. `interface BaseClass extends Mixin1, Mixin2 { }`.
 *    After that, all properties/functions from `BaseClass`, `Mixin1` and `Mixin2` will be available
 *    for the TypeScript compiler on instances created with `new BaseClass()`.
 * 4) If `createNew` is `false` and `clazz` is an abstract class, the same as in 3) happens. Note:
 *    trying to create an instance from this class will fail because the returned result is still
 *    an abstract class (at least the TypeScript compiler will complain about it, JavaScript doesn't
 *    have abstract classes).
 * @example
 * ```typescript
 * class Mixin1 {
 *   get M1(): string { return "M1"; }
 * }
 *
 * class Mixin2 {
 *   get M2(): string { return "M2"; }
 * }
 *
 * abstract class AClass {
 *   get A(): string { return "A"; }
 * }
 *
 * class Class {
 *   get C(): string { return "C"; }
 * }
 *
 * // Create _new_ classes.
 * console.log("Create new class from class");
 * const newClassMixin = mixin(true, Class, Mixin1, Mixin2);
 * console.log(newClassMixin === Class); // => false
 * const testNew = new newClassMixin();
 * console.log(testNew.C, testNew.M1, testNew.M2); // => C M1 M2
 * console.log(newClassMixin.prototype);
 *
 * console.log("\nCreate new class from abstract class");
 * const newClassAMixin = mixin(true, AClass, Mixin1, Mixin2);
 * console.log(newClassAMixin === AClass); // => false
 * const newTestA = new newClassAMixin();
 * console.log(newTestA.A, newTestA.M1, newTestA.M2); // => A M1 M2
 * console.log(newClassAMixin.prototype);
 * // ---
 *
 * // Modify class.
 * console.log("\nModify class");
 * const classMixin = mixin(false, Class, Mixin1, Mixin2);
 * console.log(classMixin === Class); // => true
 * const test = new classMixin();
 * console.log(test.C, test.M1, test.M2); // => C M1 M2
 * const test2 = new Class(); // Has `Class` also all properties/functions from the mixins now? No!
 * console.log(test2.C, test2.M1, test2.M2); => // Error TS2339: Property 'M1' does not exist on type 'Class'.
 * // The error above is fixed with:
 * //   interface Class extends Mixin1, Mixin2 { }
 * // After doing so
 * //   console.log(test2.C, test2.M1, test2.M2); // => C M1 M2
 * // will work.
 * console.log(classMixin.prototype);
 *
 * console.log("\nModify abstract class");
 * const classAMixin = mixin(false, AClass, Mixin1, Mixin2);
 * console.log(classAMixin === AClass); // => true
 * // @ ts-ignore (just to silence the TypeScript compiler and to show that in pure JavaScript this would work).
 * const testA = new classAMixin(); // => Error TS2511: Cannot create an instance of an abstract class.
 * console.log(testA.A, testA.M1, testA.M2); // => A M1 M2
 * // For the error with `const testA2 = new AClass(); console.log(testA2.M1);` see previous example above.
 * console.log(classAMixin.prototype);
 * // ---
 * ```
 */
function mixin(createNew, clazz, ...classes) {
    const __extended__ = createNew
        ? class extends clazz {
        } // eslint-disable-line jsdoc/require-jsdoc
        : clazz;
    for (const ctor of classes) {
        for (const name of Object.getOwnPropertyNames(ctor.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, name);
            if (descriptor && (name !== "constructor")) {
                Object.defineProperty(__extended__.prototype, name, descriptor);
            }
        }
    }
    return __extended__;
}
/**
 * Merges all DOM properties from an array of DOM component classes into a single DOM component
 * class. This function basically does nothing else than `mixin()`, it only exists to be used
 * explicitly for merging DOM properties into existing DOM components, it should not be used
 * for other tasks/in other contexts.
 * @param component The component _into which_ the DOM properties are to be merged.
 * @param components The components _from which_ the DOM properties are to be merged. These classes
 * shouldn't be real components, only extensions from `ANodeComponent` or `AElementComponent` which
 * contain nothing more than the implementation of only a single DOM attribute.
 * @returns `component` which is extended with a merge of all DOM properties from `classes`,
 * excluding their constructors. `component` will still have its original constructor.
 * @see Function `mixin()` and the classes `Checkbox` in `Checkbox.ts`, `Input` in `Input.ts` (both
 * in _@vanilla-ts/dom_) and `CheckedAttr` in `DOMAttributes.ts` in this project for examples for
 * using this technique.
 */
function mixinDOMProperties(component, ...components) {
    return mixin(false, component, ...components);
}
/**
 * Merges all factory functions from an array of component factory classes into a single component
 * factory class. This function basically does nothing else than `mixin()`, it only exists to be
 * used explicitly for merging factory functions into an existing component factory, it should not
 * be used for other tasks/in other contexts.
 * @param factory The component factory _into which_ the factory functions are to be merged. This
 * factory usually _should only implement the `setupComponent()` function_.
 * @param factories The component factories _from which_ the factory functions are to be merged.
 * _None of these classes must implement `setupComponent()`, they all must only implement functions
 * that return component instances!_
 * @returns A _new_ class which _extends_ `factory` that contains a merge of all factory functions
 * from `factories`, excluding their constructors (usually just default constructors).
 * @see Function `mixin()` and the classes `VTSApplication` and `VTS_App` in `Components.ts` in this
 * project for examples for using this function.
 */
function mixinComponentFactories(factory, ...factories) {
    return mixin(true, factory, ...factories);
}
// #endregion
//////////////////////////////
//////////////////////////////
// #region DOM
/**
 * Constant that holds the current status of the various modifier keys.
 */
const ModifierKeys = (() => {
    const keys = {
        /* eslint-disable jsdoc/require-jsdoc */
        Shift: false,
        Ctrl: false,
        Alt: false,
        AltGr: false,
        Meta: false,
        Fn: false,
        CapsLock: false,
        NumLock: false,
        ScrollLock: false,
        /* eslint-enable */
    };
    const update = (event) => {
        keys.Shift = event.shiftKey;
        keys.Ctrl = event.ctrlKey;
        keys.Alt = event.altKey;
        keys.AltGr = !!event.getModifierState?.("AltGraph");
        keys.Meta = event.metaKey;
        // For support of the following statuses, see:
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
        keys.Fn = !!event.getModifierState?.("Fn");
        keys.CapsLock = !!event.getModifierState?.("CapsLock");
        keys.NumLock = !!event.getModifierState?.("NumLock");
        keys.ScrollLock = !!event.getModifierState?.("ScrollLock");
    };
    typeof window !== "undefined" && window.addEventListener("keydown", (event) => update(event), { capture: true }); // eslint-disable-line jsdoc/require-jsdoc
    typeof window !== "undefined" && window.addEventListener("keyup", (event) => update(event), { capture: true }); // eslint-disable-line jsdoc/require-jsdoc
    return keys;
})();
/**
 * CSS selector that selects all tabbable elements.\
 * __Important note:__ This selection is most likely very incomplete. It does not guarantee that the
 * selected elements are actually tabbable, it only selects elements that _potentially could be_
 * tabbable.
 */
const tabbableElementsSelector = [
    "button:not([tabindex='-1'])",
    "input:not([tabindex='-1'])",
    "select:not([tabindex='-1'])",
    "textarea:not([tabindex='-1'])",
    "details:not([tabindex='-1'])",
    "area:not([tabindex='-1'])",
    "a:not([tabindex='-1'])",
    "audio[controls]:not([tabindex='-1'])",
    "video[controls]:not([tabindex='-1'])",
    "form:not([tabindex='-1'])",
    "[href]:not([tabindex='-1'])",
    "[contenteditable]",
    "[tabindex]:not([tabindex='-1'])"
].join(", ");
/**
 * Implements a tab key cycle within a given HTML element. This means that when the tab key is
 * pressed within `elem` and the currently active element is the last tabbable element within
 * `elem`, the focus will be set to the first tabbable element within `elem`. If the shift key is
 * pressed together with the tab key and the currently focused element is the first tabbable
 * element within `elem`, the focus will be set to the last tabbable element within `elem`.\
 * __Important note:__ This implementation is most likely very incomplete. It only handles some
 * basic cases. A complete implementation of tabbable elements would be much more complex. It can
 * also take some time to find all tabbable elements within `elem`, especially if the selector
 * returns many elements. Therefore, this function should only be used in sub sections of an app
 * like in a dialog or in panels which require tab key trapping.
 * @param elem The HTML element within which the tab key cycle is to be applied.
 * @param ev The keyboard event that triggered the tab key cycle.
 * @param preventPropagation If `true`, the event propagation will be stopped when the tab key cycle
 * is applied. Default: `true`.
 * @param selector A CSS selector that selects all tabbable elements within `elem`.\
 * Default: See {@link tabbableElementsSelector}.
 * @see https://allyjs.io/data-tables/focusable.html#editable-elements
 * @see https://allyjs.io/api/is/tabbable.html
 * @todo Improve the implementation to cover more cases of tabbable elements.
 */
function tabKeyFocusCycle(elem, ev, preventPropagation = true, selector = tabbableElementsSelector) {
    const tabbableElements = Array.from(elem.querySelectorAll(selector))
        .filter(e => {
        return e instanceof HTMLElement
            && !e.classList.contains("disabled")
            && !e.disabled
            && !e.hidden
            && !e.inert
            && e.style.display !== "none"
            && e.style.visibility !== "hidden"
            && (e.hasAttribute("contenteditable") ? ["", "true"].includes(e.contentEditable.trim().toLowerCase()) : true);
    });
    const firstTabbableElement = tabbableElements[0];
    const lastTabbableElement = tabbableElements[tabbableElements.length - 1];
    if (ev.shiftKey) {
        if (!firstTabbableElement || ev.target === firstTabbableElement) {
            ev.preventDefault();
            preventPropagation && ev.stopImmediatePropagation();
            lastTabbableElement?.focus?.();
        }
    }
    else {
        if (!lastTabbableElement || ev.target === lastTabbableElement) {
            ev.preventDefault();
            preventPropagation && ev.stopImmediatePropagation();
            firstTabbableElement?.focus?.();
        }
    }
}
/**
 * Get a rectangle (`DOMRect`) that contains the position and size of an HTML element The position
 * is calculated relative to the parent element of `elem`. The size includes the border width and
 * padding of `elem`.
 * @param elem The HTML element for which the rectangle is to be calculated.
 * @returns A rectangle containing the position (relative to its parent element) and size (including
 * border width and padding) of an HTML element.
 */
function getClientRect(elem) {
    const childRect = elem.getBoundingClientRect();
    const parentRect = elem.parentElement?.getBoundingClientRect();
    return new DOMRect(childRect.left - (parentRect?.left ?? 0), childRect.top - (parentRect?.top ?? 0), elem.offsetWidth, elem.offsetHeight);
}
/**
 * A function that returns a string starting with `_` followed by six random alphanumeric
 * characters. The intended use case is to create unique IDs for HTML elements. The characters are
 * chosen out of the range `0` to `9` and `a` to `z` so a result could be `_j9e20f`. This function
 * is also used internally for generating IDs for components where an ID is needed/recommended but
 * not explicitly provided.
 * @returns A string starting with `_` followed by six random alphanumeric characters.
 */
const cid = () => {
    return "_" + Math.floor(Math.random() * 2176782336 /* 36 ** 6 */).toString(36).padStart(6, "0");
};
// #endregion
//////////////////////////////
//////////////////////////////
// #region Misc
/**
 * Converts a string to a kebap case string.
 * @param s The string to be converted.
 * @returns A kebap case string.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Kebab_case
 * @see https://stackoverflow.com/a/67243723
 */
function toKebabCase(s) {
    return s.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (c, o) => (o ? "-" : "") + c.toLowerCase());
}
/**
 * Creates a function that is called with a delay of `timeout` milliseconds via debouncing. If this
 * function is called several times *before* `timeout` has expired, the timeout is reset each time
 * and the call is delayed again by `timeout` milliseconds.
 * @param fnc The function that is to be called with a delay (as a promise).
 * @param timeout Time in milliseconds after which `fnc` is to be called.
 * @param immediateLeadingInvoke If `true`, then the *first* call of `fnc` is executed *without*
 * delay, all *further* calls are then executed with delay. After `fnc` has been called with a
 * delay, the next call to `fnc` is executed immediately and so on. This option is therefore
 * suitable for bundling groups of calls that are further apart in time so that the first call of
 * `fnc` at the beginning of a group is executed immediately and only the subsequent calls are
 * delayed. Default: `false`.
 * @returns An array with four elements:
 *
 * - First element (function): A function with the same signature as the function passed to
 *   `getDebouncedFnc()`. This is the function that must be called in order to actually call the
 *   passed function (`fnc()`).
 * - Second element (function): This function can be used to cancel debouncing, i.e. `fnc()` is
 *   never called and debouncing starts again only if `fnc()` is called again.
 * - Third element (function): Calls the initially passed function (`fnc()`) immediately. With the
 *   parameter `true` the debouncing is aborted at the same time, otherwise `fnc()` is called again
 *   later.
 * - Fourth element (function): Checks whether debouncing is still active, i.e. `fnc()` is still
 *   waiting for its delayed call.
 *
 * Largely adopted (and expanded) from:
 * @see https://github.com/Bwca/np__merry-solutions__debounce
 *
 * The following example displays `bar` and `rab` on the console almost immediately and again `bar`
 * after approx. 5 seconds.
 * @example
 * function reverseFnc(s: string): string {
 *     console.log(s);
 *     return s.split("").reverse().join("");
 * }
 *
 * const [reverse, _, immediate] = getDebouncedFnc(reverseFnc, 5000, false);
 *
 * reverse("foo");
 * reverse("bar");
 * console.log(immediate(false));
 */
function getDebouncedFnc(fnc, timeout, immediateLeadingInvoke = false) {
    let timeoutHandler = undefined;
    let _args;
    let leadingInvoked = false;
    const _clearTimeout = () => {
        timeoutHandler && clearTimeout(timeoutHandler);
        timeoutHandler = undefined;
    };
    const debouncedFnc = (...args) => // eslint-disable-line jsdoc/require-jsdoc
     new Promise((resolve) => {
        _args = args;
        _clearTimeout();
        if (immediateLeadingInvoke && !leadingInvoked) {
            leadingInvoked = true;
            resolve(fnc(...args)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        }
        else {
            timeoutHandler = setTimeout(() => {
                _clearTimeout();
                leadingInvoked = false;
                resolve(fnc(...args)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
            }, timeout);
        }
    });
    const cancel = () => {
        _clearTimeout();
    };
    const immediate = (cancel = true) => {
        cancel && _clearTimeout();
        return fnc(..._args); // eslint-disable-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument
    };
    const active = () => {
        return timeoutHandler !== undefined;
    };
    return [debouncedFnc, cancel, immediate, active];
}
/**
 * A function that returns a UUID.
 * @returns A UUID in RFC version 4 format.
 */
const generateUUID = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID.bind(crypto)
    : () => {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16));
    };
// #endregion
//////////////////////////////
//////////////////////////////
// #region Objects
/**
 * Checks if an object has a property with the value `undefined`.
 * @param obj The object to be checked.
 * @param prop The (name of the) property to be checked.
 * @returns `true` if `obj` has a property `prop` with the value `undefined`, otherwise `false`.
 */
function isUndefined(obj, prop) {
    return Object.hasOwn(obj, prop) && obj[prop] === undefined;
}
/**
 * Gets the value of an optional property from an object, taking into account an existing object of
 * the same type. A common use case is to update/create a property of an existing options or
 * configuration object with the value returned from this function. The function works as follows:
 * - If neither `from` nor `ref` has `prop` the returned value is `def`.
 * - If `from` _does not_ have the property `prop` at all, the returned value depends on the
 *   current existence of `prop` in `ref`: If it doesn't already exist the returned value is `def`,
 *   otherwise the returned value is `ref[prop]`.
 * - If `from` _does_ have the property `prop` but with the value of `undefined`, the returned value
 *   is `def`.
 * - If `from` _does_ have the property `prop` and its value is unequal to `undefined`, the returned
 *   value is `from[prop]`.
 * @param from The object from which the property value is to be returned.
 * @param ref The object which may contain the current value of `prop` or not.
 * @param prop The (name of the) property that is to be returned.
 * @param def The default value for the property if
 * - `prop` exists in `from` _and_ has the value `undefined` or
 * - neither `from` nor `ref` has the property `prop`.
 * @returns A value depending on the content of `from` and `ref` as described above.
 */
function getProp(from, ref, prop, def) {
    return isUndefined(from, prop)
        ? def
        : from[prop] ?? ref[prop] ?? def;
}
// #endregion
//////////////////////////////
// /**
//  * Type that is largely similar to a readonly map.\
//  * Differences to `Map`:
//  * - There is no constructor.
//  * - There is no `forEach()` function.
//  * - `size` is a function, not a property.
//  */
// export interface ReadonlyMapLike<K, V> {
//     /* eslint-disable jsdoc/require-jsdoc */
//     entries(): MapIterator<[K, V]>;
//     // forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
//     get(key: K): V | undefined;
//     has(key: K): boolean;
//     keys(): MapIterator<K>;
//     values(): MapIterator<V>;
//     size(): number;
//     [Symbol.iterator](): MapIterator<[K, V]>;
//     /* eslint-enable */
// }
// /**
//  * Returns an _object_ from an existing map similar to a `ReadonlyMap` that is not only readonly at
//  * compile time but also at runtime.
//  * @param map The map to be used as the 'backend' for the readonly map-like object. This map can
//  * still be used normally, the returned object is just an accessor facade for the map so the object
//  * is always in sync with the map.
//  * @returns An object similar to a `ReadonlyMap` that is not only readonly at compile time but also
//  * at runtime. Please also not that the return value is a simple (frozen) object, not an instance of
//  * a `Map` like class.
//  * @see {@link ReadonlyMapLike} for the differences of the returned object to `Map`/`ReadonlyMap`.
//  */
// export function readonlyMapLike<K, V>(map: Map<K, V>): ReadonlyMapLike<K, V> {
//     return Object.freeze({
//         /* eslint-disable jsdoc/require-jsdoc */
//         entries: map.entries.bind(map),
//         // forEach: map.forEach.bind(map),
//         get: map.get.bind(map),
//         has: map.has.bind(map),
//         keys: map.keys.bind(map),
//         size: (): number => map.size,
//         values: map.values.bind(map),
//         [Symbol.iterator]: map[Symbol.iterator].bind(map)
//         /* eslint-enable */
//     });
// }
// /**
//  * Rounds a numeric value.
//  * @param value The value to be rounded.
//  * @param step The rounding amount. `2` for example returns a number where `value % 2 === 0` and
//  * `0.1` would return `2.7` for the value `2.74`
//  * @returns The rounded value.
//  */
// export function round(value: number, step ?: number): number {
//     step || (step = 1);
//     const inv = 1.0 / step;
//     return Math.round(value * inv) / inv;
// }

/**
 * Abstract base implementation of _all_ components.
 * @see {@link IComponent}
 */
class AComponent {
    /** State of `Disposed` of this component. */
    _disposed = false;
    /** Cached class name of this component. */
    _className;
    /** Cached parent class of this component. */
    _parentClass = null;
    /** Content of the pointer of this component.  */
    _pointer;
    /** Cached class path of this component. */
    _classPath;
    /** @inheritdoc */
    ComponentType = ComponentType.COMPONENT;
    /** @inheritdoc */
    get Disposed() {
        return this._disposed;
    }
    /** @inheritdoc */
    get ClassName() {
        return this._className ?? (this._className = this.constructor.name);
    }
    /** @inheritdoc */
    get ClassPath() {
        return this._classPath ?? (this._classPath = this.getClassPath());
    }
    /** @inheritdoc */
    get ParentClass() {
        if (this._parentClass === null) {
            const parent = Object.getPrototypeOf(Object.getPrototypeOf(this)); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            this._parentClass = parent instanceof AComponent
                ? parent
                : undefined;
        }
        return this._parentClass;
    }
    /** @inheritdoc */
    get Pointer() {
        return this._pointer;
    }
    /** @inheritdoc */
    set Pointer(v) {
        this.pointer(v);
    }
    /** @inheritdoc */
    pointer(pointer) {
        this._pointer = pointer;
        return this;
    }
    /** @inheritdoc */
    getClassPath() {
        const path = [];
        /* eslint-disable */
        let proto = Object.getPrototypeOf(this);
        while (proto) {
            path.push(proto.constructor.name);
            proto = Object.getPrototypeOf(proto);
        }
        /* eslint-enable */
        return path.reverse().slice(1).join(".");
    }
    /** @inheritdoc */
    exec(fnc, thisArg, ...args) {
        fnc.call(thisArg, ...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        return this;
    }
    /** @inheritdoc */
    dispose() {
        this._pointer = undefined;
        this._disposed = true;
    }
}
/**
 * Abstract base implementation of all node or element based components.
 * @see {@link INodeComponent}
 */
class ANodeComponent extends AComponent {
    /** The underlying node or element. */
    _dom;
    /** The parent component. */
    _parent = undefined;
    /** An array holding the currently assigned event handlers. */
    eventListeners = [];
    /** @inheritdoc */
    get DOM() {
        return this._dom;
    }
    /** @inheritdoc */
    ComponentType = ComponentType.NODE;
    /** @inheritdoc */
    get Parent() {
        return this._parent;
    }
    /** @inheritdoc */
    get Next() {
        const parentChildren = this._parent?.Children;
        if (!parentChildren) {
            return undefined;
        }
        const index = parentChildren.indexOf(this);
        return index < 0 ? undefined : parentChildren[index + 1];
    }
    /** @inheritdoc */
    get Previous() {
        const parentChildren = this._parent?.Children;
        if (!parentChildren) {
            return undefined;
        }
        const index = parentChildren.indexOf(this);
        return index < 0 ? undefined : parentChildren[index - 1];
    }
    /** @inheritdoc */
    isContainedIn(component) {
        let parent = this.Parent;
        while (parent) {
            if (parent === component) {
                return true;
            }
            parent = parent.Parent;
        }
        return false;
    }
    /** @inheritdoc */
    contains(component) {
        // Using a 'reversed' `isContainedIn()` is the fastest way. The disadvantage of an
        // 'inappropriate' type cast is accepted in return.
        return component.isContainedIn(this);
    }
    /** @inheritdoc */
    get Connected() {
        return this._dom.isConnected;
    }
    /** @inheritdoc */
    get Text() {
        return this._dom.textContent;
    }
    /** @inheritdoc */
    set Text(v) {
        this.text(v);
    }
    /** @inheritdoc */
    text(text) {
        this._dom.textContent = text;
        return this;
    }
    /** @inheritdoc */
    onBeforeUnmount() { }
    /** @inheritdoc */
    onDidUnmount() {
        this._parent = undefined;
    }
    /** @inheritdoc */
    onBeforeMount(_parent) { }
    /** @inheritdoc */
    onDidMount(parent) {
        this._parent = parent;
    }
    /** @inheritdoc */
    get Listeners() {
        return this.eventListeners.map(listener => {
            const result = {
                /* eslint-disable jsdoc/require-jsdoc */
                Type: listener.Type,
                Listener: listener.Listener,
                Options: typeof listener.Options === "boolean"
                    ? listener.Options
                    : listener.Options
                        ? { ...listener.Options }
                        : undefined,
                Suspended: listener.Suspended
                /* eslint-enable */
            };
            listener.WrappedListener && (result.WrappedListener = listener.WrappedListener);
            if (listener.AuxiliaryListeners) {
                result.AuxiliaryListeners = listener.AuxiliaryListeners.map(auxListener => {
                    const elem = {
                        /* eslint-disable jsdoc/require-jsdoc */
                        Type: auxListener.Type,
                        Listener: auxListener.Listener,
                        Options: typeof auxListener.Options === "boolean"
                            ? auxListener.Options
                            : auxListener.Options
                                ? { ...auxListener.Options }
                                : undefined,
                        Suspended: auxListener.Suspended,
                        /* eslint-enable */
                    };
                    auxListener.WrappedListener && (elem.WrappedListener = auxListener.WrappedListener);
                    return elem;
                });
            }
            return result;
        });
    }
    /** @inheritdoc */
    emit(event) {
        this._dom.dispatchEvent(event);
        return this;
    }
    /** @inheritdoc */
    dispatch(event) {
        return this._dom.dispatchEvent(event);
    }
    /** @inheritdoc */
    on(type, listener, options) {
        const listenerOptions = options === undefined
            ? undefined
            : typeof options === "boolean"
                ? options
                : this.sortEventListenerOptions(options);
        this._dom.addEventListener(type, listener, listenerOptions);
        /* eslint-disable jsdoc/require-jsdoc */
        this.eventListeners.push({
            Type: type,
            Listener: listener,
            Options: listenerOptions,
            Suspended: false,
            AuxiliaryListeners: type === "pointerhold"
                ? PointerHoldEvent.setupAuxiliaryListeners(this, listenerOptions)
                : undefined
        });
        /* eslint-enable */
        return this;
    }
    /** @inheritdoc */
    once(type, listener, options) {
        /* eslint-disable jsdoc/require-jsdoc */
        const listenerOptions = options === undefined
            ? { once: true }
            : typeof options === "boolean"
                ? { capture: options, once: true }
                : this.sortEventListenerOptions({ ...options, once: true });
        /* eslint-enable */
        /**
         * For `once()`, wrap the listener in another function to be able to remove the listener
         * after the first execution.
         * @param ev The original event.
         */
        const wrappedListener = (ev) => {
            listener.call(this._dom, ev);
            this.off(type, listener, listenerOptions);
        };
        this._dom.addEventListener(type, wrappedListener, listenerOptions);
        /* eslint-disable jsdoc/require-jsdoc */
        this.eventListeners.push({
            Type: type,
            Listener: listener,
            WrappedListener: wrappedListener,
            Options: listenerOptions,
            Suspended: false,
            AuxiliaryListeners: type === "pointerhold"
                ? PointerHoldEvent.setupAuxiliaryListeners(this, listenerOptions)
                : undefined
        });
        /* eslint-enable */
        return this;
    }
    /** @inheritdoc */
    off(type, listener, options) {
        const { Index } = this.indexOfEventListener(type, listener, options); // eslint-disable-line jsdoc/require-jsdoc
        if (Index !== -1) {
            const listener = this.eventListeners[Index];
            this._dom.removeEventListener(listener.Type, listener.WrappedListener ?? listener.Listener, listener.Options);
            for (const auxListener of listener.AuxiliaryListeners ?? []) {
                this._dom.removeEventListener(auxListener.Type, auxListener.WrappedListener ?? auxListener.Listener, auxListener.Options);
            }
            this.eventListeners.splice(Index, 1);
        }
        return this;
    }
    /** @inheritdoc */
    suspend(type, listener, options) {
        const { Index } = this.indexOfEventListener(type, listener, options, false); // eslint-disable-line jsdoc/require-jsdoc
        if (Index !== -1 && this.eventListeners[Index].Suspended === false) {
            this.eventListeners[Index].Suspended = true;
            for (const auxListener of this.eventListeners[Index].AuxiliaryListeners ?? []) {
                auxListener.Suspended = true;
            }
            this.reinstallEventListeners();
        }
        return this;
    }
    /** @inheritdoc */
    resume(type, listener, options) {
        const { Index } = this.indexOfEventListener(type, listener, options, true); // eslint-disable-line jsdoc/require-jsdoc
        if (Index !== -1 && this.eventListeners[Index].Suspended === true) {
            this.eventListeners[Index].Suspended = false;
            for (const auxListener of this.eventListeners[Index].AuxiliaryListeners ?? []) {
                auxListener.Suspended = false;
            }
            this.reinstallEventListeners();
        }
        return this;
    }
    /** @inheritdoc */
    allEvents(mode) {
        switch (mode) {
            case ALL_EVENTS.OFF:
                for (const listener of this.eventListeners) {
                    this._dom.removeEventListener(listener.Type, listener.WrappedListener ?? listener.Listener, listener.Options);
                    for (const auxListener of listener.AuxiliaryListeners ?? []) {
                        this._dom.removeEventListener(auxListener.Type, auxListener.WrappedListener ?? auxListener.Listener, auxListener.Options);
                    }
                }
                this.eventListeners.length = 0;
                break;
            case ALL_EVENTS.SUSPEND:
                for (const listener of this.eventListeners) {
                    listener.Suspended = true;
                    for (const auxListener of listener.AuxiliaryListeners ?? []) {
                        auxListener.Suspended = true;
                    }
                }
                this.reinstallEventListeners();
                break;
            case ALL_EVENTS.RESUME:
                for (const listener of this.eventListeners) {
                    listener.Suspended = false;
                    for (const auxListener of listener.AuxiliaryListeners ?? []) {
                        auxListener.Suspended = false;
                    }
                }
                this.reinstallEventListeners();
                break;
        }
        return this;
    }
    /**
     * Free resources of this component. The normal behavior is that afterwards the component is no
     * longer functional. __Notes:__
     * - Not calling `super.dispose()` at the end is considered to be an error!
     * - A component should always be removed from its parent component (if any) *before* calling
     *   `dispose()` to prevent unwanted side effects during `dispose()`. Due to the inheritance
     *   hierarchy, the component will also be removed from the DOM automatically at some point
     *   (only if `super.dispose()` is used correctly), but nevertheless the removal should be done
     *   as early as possible.
     * - A component must not remove itself from its parent within `dispose()` since this may lead
     *   lead to problems if a component with child components tries to dispose of its children.
     * - __Important:__ The expected behaviour of a component with child components is that it also
     *   removes and disposes of all its children when calling `dispose()` on it! Normally this
     *   doesn't have to be implemented for Components that inherit from
     *   `AElementComponentWithChildren` since the implementation of `dispose()` there already does
     *   this. But if a component is derived from AElementComponent and builds its own opaque (set
     *   or tree of) components, `dispose()` _must_ be overridden and it _must_ ensure that all
     *   these self-generated components are disposed of.
     * @see {@link IDisposable.dispose()}
     * @see {@link AElementComponentWithInternalUI}.
     */
    dispose() {
        this.allEvents(ALL_EVENTS.OFF);
        this._dom?.parentNode?.removeChild(this._dom);
        // @ts-expect-error ---
        this._dom = undefined;
        super.dispose();
    }
    /**
     * Sort the keys of an event listener options object alphabetically.
     * @param listenerOptions The event listener options object.
     * @returns A new object whose keys are sorted alphabetically.
     */
    sortEventListenerOptions(listenerOptions) {
        return Object.keys(listenerOptions)
            .sort()
            .reduce(function (sorted, key) {
            // @ts-expect-error ---
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            sorted[key] = listenerOptions[key];
            return sorted;
        }, {});
    }
    /**
     * Searches an event listener in the internal list of event listeners.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * @param type Event type (click, blur etc.).
     * @param listener Listener function or object.
     * @param options Event listener options.
     * @param suspended If given, only search for listeners where the state of `Suspended` is equal
     * to this parameter.
     * @returns The index of the listener found or `-1` if the listener couldn't be found.
     */
    indexOfEventListener(type, listener, options, suspended) {
        const listenerOptions = options === undefined
            ? undefined
            : typeof options === "boolean"
                ? options
                : this.sortEventListenerOptions(options);
        for (let i = 0; i < this.eventListeners.length; i++) {
            const entry = this.eventListeners[i];
            if (suspended !== undefined && entry.Suspended !== suspended) {
                continue;
            }
            if ((entry.Type === type)
                && (entry.Listener === listener)
                && (JSON.stringify(entry.Options) === JSON.stringify(listenerOptions))) {
                return { Index: i, ListenerOptions: listenerOptions }; // eslint-disable-line jsdoc/require-jsdoc
            }
        }
        return { Index: -1, ListenerOptions: listenerOptions }; // eslint-disable-line jsdoc/require-jsdoc
    }
    /**
     * Removes and adds all event listeners.
     */
    reinstallEventListeners() {
        for (const listener of this.eventListeners) {
            this._dom.removeEventListener(listener.Type, listener.WrappedListener ?? listener.Listener, listener.Options);
            for (const auxListener of listener.AuxiliaryListeners ?? []) {
                this._dom.removeEventListener(auxListener.Type, auxListener.WrappedListener ?? auxListener.Listener, auxListener.Options);
            }
        }
        for (const listener of this.eventListeners) {
            listener.Suspended || this._dom.addEventListener(listener.Type, listener.WrappedListener ?? listener.Listener, listener.Options);
            for (const auxListener of listener.AuxiliaryListeners ?? []) {
                auxListener.Suspended || this._dom.addEventListener(auxListener.Type, auxListener.WrappedListener ?? auxListener.Listener, auxListener.Options);
            }
        }
    }
}
/**
 * Implementation of `IGlobalDOMAttributes<T>`. Currently these attributes are added as mixins to
 * `AElementComponent` to avoid getting that class really big.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
 * @see {@link IGlobalDOMAttributes}
 */
class AGlobalDOMAttributes extends ANodeComponent {
    /** @inheritdoc */
    get AutoCapitalize() {
        return this._dom.autocapitalize;
    }
    /** @inheritdoc */
    set AutoCapitalize(v) {
        this._dom.autocapitalize = v;
    }
    /** @inheritdoc */
    autoCapitalize(v) {
        this._dom.autocapitalize = v;
        return this;
    }
    /** @inheritdoc */
    get Autofocus() {
        return this._dom.autofocus;
    }
    /** @inheritdoc */
    set Autofocus(v) {
        this._dom.autofocus = v;
    }
    /** @inheritdoc */
    autofocus(v) {
        this._dom.autofocus = v;
        return this;
    }
    /** @inheritdoc */
    get ContentEditable() {
        return this._dom.contentEditable;
    }
    /** @inheritdoc */
    set ContentEditable(v) {
        this.contentEditable(v);
    }
    /** @inheritdoc */
    contentEditable(v) {
        v === false || v === "" ? this._dom.removeAttribute("contenteditable") : this._dom.contentEditable = v;
        return this;
    }
    /** @inheritdoc */
    get Clazz() {
        return !this._dom.hasAttribute("class") ? null : this._dom.className;
    }
    /** @inheritdoc */
    set Clazz(v) {
        this.clazz(v);
    }
    /** @inheritdoc */
    clazz(v) {
        v === null || v === "" ? this._dom.removeAttribute("class") : this._dom.className = v;
        return this;
    }
    /** @inheritdoc */
    get Dir() {
        return !this._dom.hasAttribute("dir") ? null : this._dom.dir;
    }
    /** @inheritdoc */
    set Dir(v) {
        this.dir(v);
    }
    /** @inheritdoc */
    dir(v) {
        v === null || v === "" ? this._dom.removeAttribute("dir") : this._dom.dir = v;
        return this;
    }
    /** @inheritdoc */
    get Draggable() {
        return this._dom.draggable;
    }
    /** @inheritdoc */
    set Draggable(v) {
        this.draggable(v);
    }
    /** @inheritdoc */
    draggable(v) {
        v === false ? this._dom.removeAttribute("draggable") : this._dom.draggable = true;
        return this;
    }
    /** @inheritdoc */
    get EnterKeyHint() {
        return !this._dom.hasAttribute("enterkeyhint") ? null : this._dom.enterKeyHint;
    }
    /** @inheritdoc */
    set EnterKeyHint(v) {
        this.enterKeyHint(v);
    }
    /** @inheritdoc */
    enterKeyHint(v) {
        v === null ? this._dom.removeAttribute("enterkeyhint") : this._dom.enterKeyHint = v;
        return this;
    }
    /** @inheritdoc */
    get ID() {
        return !this._dom.hasAttribute("id") ? null : this._dom.id;
    }
    /** @inheritdoc */
    set ID(v) {
        this.id(v);
    }
    /** @inheritdoc */
    id(v) {
        v === null || v === "" ? this._dom.removeAttribute("id") : this._dom.id = v;
        return this;
    }
    /** @inheritdoc */
    get Inert() {
        return this._dom.inert;
    }
    /** @inheritdoc */
    set Inert(v) {
        this._dom.inert = v;
    }
    /** @inheritdoc */
    inert(v) {
        this._dom.inert = v;
        return this;
    }
    /** @inheritdoc */
    get InputMode() {
        return !this._dom.hasAttribute("inputmode") ? null : this._dom.inputMode;
    }
    /** @inheritdoc */
    set InputMode(v) {
        this.inputMode(v);
    }
    /** @inheritdoc */
    inputMode(v) {
        v === null || v === "" ? this._dom.removeAttribute("inputmode") : this._dom.inputMode = v;
        return this;
    }
    /** @inheritdoc */
    get Lang() {
        return !this._dom.hasAttribute("lang") ? null : this._dom.lang;
    }
    /** @inheritdoc */
    set Lang(v) {
        this.lang(v);
    }
    /** @inheritdoc */
    lang(v) {
        v === null || v === "" ? this._dom.removeAttribute("lang") : this._dom.lang = v;
        return this;
    }
    /** @inheritdoc */
    get Nonce() {
        return this._dom.nonce;
    }
    /** @inheritdoc */
    set Nonce(v) {
        this.nonce(v);
    }
    /** @inheritdoc */
    nonce(v) {
        this._dom.nonce = v
            ? v
            : "";
        return this;
    }
    /** @inheritdoc */
    get Popover() {
        return this._dom.popover;
    }
    /** @inheritdoc */
    set Popover(v) {
        this._dom.popover = v;
    }
    /** @inheritdoc */
    popover(v) {
        this._dom.popover = v;
        return this;
    }
    /** @inheritdoc */
    get Resizable() {
        return this._dom.style.resize || false;
    }
    /** @inheritdoc */
    set Resizable(v) {
        this.resizable(v);
    }
    /** @inheritdoc */
    resizable(v) {
        v === false ? this._dom.style.removeProperty("resize") : this._dom.style.resize = v;
        return this;
    }
    /** @inheritdoc */
    get Spellcheck() {
        return this._dom.spellcheck;
    }
    /** @inheritdoc */
    set Spellcheck(v) {
        this.spellcheck(v);
    }
    /** @inheritdoc */
    spellcheck(v) {
        this._dom.spellcheck = v;
        return this;
    }
    /** @inheritdoc */
    get TabIndex() {
        return this._dom.tabIndex;
    }
    /** @inheritdoc */
    set TabIndex(v) {
        this.tabIndex(v);
    }
    /** @inheritdoc */
    tabIndex(v) {
        v === null ? this._dom.removeAttribute("tabindex") : this._dom.tabIndex = v;
        return this;
    }
    /** @inheritdoc */
    get Title() {
        return !this._dom.hasAttribute("title") ? null : this._dom.title;
    }
    /** @inheritdoc */
    set Title(v) {
        this.title(v);
    }
    /** @inheritdoc */
    title(title) {
        title === null || title === "" ? this._dom.removeAttribute("title") : this._dom.title = title;
        return this;
    }
    /** @inheritdoc */
    get Translate() {
        return this._dom.translate;
    }
    /** @inheritdoc */
    set Translate(v) {
        this.translate(v);
    }
    /** @inheritdoc */
    translate(v) {
        v === false ? this._dom.removeAttribute("translate") : this._dom.translate = true;
        return this;
    }
    /** @inheritdoc */
    get WritingSuggestions() {
        return this._dom.writingSuggestions === "true" || this._dom.writingSuggestions === "";
    }
    /** @inheritdoc */
    set WritingSuggestions(v) {
        this.writingSuggestions(v);
    }
    /** @inheritdoc */
    writingSuggestions(v) {
        this._dom.writingSuggestions = v ? "true" : "false";
        return this;
    }
}
/**
 * Abstract base implementation of all HTML element based components.
 * @see {@link IElementComponent}
 */
class AElementComponent extends ANodeComponent {
    static {
        /** Mixin additional global DOM attributes */
        mixinDOMProperties(this, AGlobalDOMAttributes);
    }
    /** @see Instance property {@link AElementComponent.DefaultCSSClassName}. */
    static get DefaultCSSClassName() {
        return this["__ccn__" + this.name] ?? (this["__ccn__" + this.name] = toKebabCase(this.name)); // eslint-disable-line @typescript-eslint/no-unsafe-return
    }
    /** The internal flag holding the disabled state of the element. */
    _disabled = false;
    /** The internal flag holding the parentDisabled state of the element. */
    _parentDisabled = false;
    /** The current state of visibility. */
    _visible = true;
    /** The last state of `this._dom.style.display`. */
    prevStyleDisplay;
    /** The current state of hiddenness. */
    _hidden = false;
    /** The last state of `this._dom.style.visibility`. */
    prevStyleVisibility;
    /** @inheritdoc */
    ComponentType = ComponentType.ELEMENT;
    /**
     * \
     * \
     * This implementation uses kebap case for the default CSS class name. The instance getter uses
     * the static getter by default which itself 'caches' the class name in a custom property
     * derived form the class name, so if a different naming convention should be used, the static
     * getter `DefaultCSSClassName` of `AElementComponent` has to be overridden, ideally in a way
     * that also caches the default name.
     * __Note:__ Bundlers that mangle class names can defeat the purpose of this code!
     * @example
     * ```javascript
     * Object.defineProperty(AElementComponent, "DefaultCSSClassName", {
     *   get() {
     *     return this["__ccn__" + this.name] ?? (this["__ccn__" + this.name] = this.name.toUpperCase());
     *   }
     * });
     * ```
     * @inheritdoc
     */
    get DefaultCSSClassName() {
        return this.constructor.DefaultCSSClassName; // eslint-disable-line @typescript-eslint/no-unsafe-return
    }
    /** @inheritdoc */
    addClass(...classes) {
        const clazzes = classes
            .filter(e => e !== null && e !== undefined)
            .map(e => e.trim())
            .filter(e => e !== "");
        clazzes.length > 0 && this._dom.classList.add(...clazzes);
        return this;
    }
    /** @inheritdoc */
    removeClass(...classes) {
        this._dom.classList.remove(...classes
            .filter(e => e !== null && e !== undefined)
            .map(e => e.trim())
            .filter(e => e !== ""));
        this._dom.getAttribute("class")?.trim() === "" && this._dom.removeAttribute("class");
        return this;
    }
    /** @inheritdoc */
    replaceClass(clazz, withClass) {
        const c = clazz?.trim();
        const w = withClass?.trim();
        if (c && w) {
            this._dom.classList.replace(c, w);
        }
        return this;
    }
    /** @inheritdoc */
    toggleClass(...classes) {
        for (const clazz of classes.filter(e => e !== null && e !== undefined).map(e => e.trim()).filter(e => e !== "")) {
            this._dom.classList.toggle(clazz);
        }
        this._dom.getAttribute("class")?.trim() === "" && this._dom.removeAttribute("class");
        return this;
    }
    /** @inheritdoc */
    hasClass(...classes) {
        const clazzes = classes.filter(e => e !== null && e !== undefined).map(e => e.trim()).filter(e => e !== "");
        if (clazzes.length === 0) {
            return false;
        }
        for (const clazz of clazzes) {
            if (!this._dom.classList.contains(clazz)) {
                return false;
            }
        }
        return true;
    }
    /** @inheritdoc */
    attrib(name, value) {
        value === null ? this._dom.removeAttribute(name) : this._dom.setAttribute(name, value);
        return this;
    }
    /** @inheritdoc */
    attr(name) {
        return this._dom.getAttribute(name);
    }
    /** @inheritdoc */
    attribN(name, value) {
        value === null ? this._dom.removeAttribute(name) : this._dom.setAttribute(name, value.toString());
        return this;
    }
    /** @inheritdoc */
    attrN(name) {
        const value = this.attr(name);
        return value === null ? null : parseInt(value);
    }
    /** @inheritdoc */
    attribB(name, value) {
        value === true
            ? this._dom.setAttribute(name, "")
            : this._dom.removeAttribute(name);
        return this;
    }
    /** @inheritdoc */
    attrB(name) {
        const value = this.attr(name);
        return value === null ? null : (value === "" || value.toLowerCase() === "true" || value === "1");
    }
    /** @inheritdoc */
    hasAttrib(name) {
        return this._dom.hasAttribute(name);
    }
    /** @inheritdoc */
    Data(name) {
        return this._dom.getAttribute("data-" + name.toLowerCase());
    }
    /** @inheritdoc */
    data(name, value) {
        value === null ? this._dom.removeAttribute("data-" + name.toLowerCase()) : this._dom.setAttribute("data-" + name.toLowerCase(), value);
        return this;
    }
    /** @inheritdoc */
    get Dataset() {
        return this._dom.dataset;
    }
    /** @inheritdoc */
    get Disabled() {
        return this._disabled;
    }
    /** @inheritdoc */
    set Disabled(v) {
        this.disabled(v);
    }
    /** @inheritdoc */
    disabled(disabled) {
        if (disabled !== this._disabled) {
            this._disabled = disabled;
            this._disabled
                ? this.addClass("disabled")
                : this.removeClass("disabled");
        }
        return this;
    }
    /** @inheritdoc */
    get ParentDisabled() {
        return this._parentDisabled;
    }
    /** @inheritdoc */
    parentDisabled(disabled) {
        if (disabled !== this._parentDisabled) {
            this._parentDisabled = disabled;
            /** @todo Make setting a class for `ParentDisabled` optional and/or configurable? */
            // return this._parentDisabled
            //     ? this.addClass("parent-disabled")
            //     : this.removeClass("parent-disabled");
        }
        return this;
    }
    /** @inheritdoc */
    get Visible() {
        return this._visible;
    }
    /** @inheritdoc */
    set Visible(v) {
        this.visible(v);
    }
    /** @inheritdoc */
    visible(visible) {
        if (visible !== this._visible) {
            this._visible = visible;
            if (this._visible) {
                this._dom.style.display = this.prevStyleDisplay;
                this._dom.removeAttribute("data-c-invisible");
                this._dom.removeAttribute("aria-hidden");
            }
            else {
                this.prevStyleDisplay = this._dom.style.display;
                this._dom.style.display = "none";
                // Setting `data-invisible` is unbearably slow in WebKit? Therefore it's prefixed
                // with `c-`.
                this._dom.setAttribute("data-c-invisible", "");
                this._dom.setAttribute("aria-hidden", "true");
            }
        }
        return this;
    }
    /** @inheritdoc */
    get Hidden() {
        return this._hidden;
    }
    /** @inheritdoc */
    set Hidden(v) {
        this.hidden(v);
    }
    /** @inheritdoc */
    hidden(hidden) {
        if (hidden !== this._hidden) {
            this._hidden = hidden;
            if (this._hidden) {
                this.prevStyleVisibility = this._dom.style.visibility;
                this._dom.style.visibility = "hidden";
                // Setting `data-hidden` shows no performance problems in WebKit but for consistency
                // it's also prefixed with `c-` (see `visible()`).
                this._dom.setAttribute("data-c-hidden", "");
                this._dom.setAttribute("aria-hidden", "true");
            }
            else {
                this._dom.style.visibility = this.prevStyleVisibility;
                this._dom.removeAttribute("data-c-hidden");
                this._dom.removeAttribute("aria-hidden");
            }
        }
        return this;
    }
    /** @inheritdoc */
    get Tabbable() {
        return this._dom.tabIndex >= 0;
    }
    /** @inheritdoc */
    set Tabbable(v) {
        this.tabbable(v);
    }
    /** @inheritdoc */
    tabbable(tabbable) {
        if (tabbable) {
            this._dom.tabIndex < 0 &&
                (HTMLTagsWithNativeTabbing.includes(this._dom.tagName)
                    ? this.attrib("tabindex", null)
                    : this._dom.tabIndex = 0);
        }
        else {
            HTMLTagsWithNativeTabbing.includes(this._dom.tagName)
                ? this._dom.tabIndex = -1
                : this.attrib("tabindex", null);
        }
        return this;
    }
    /** @inheritdoc */
    get Style() {
        return this._dom.style;
    }
    /** @inheritdoc */
    style(property, v, important) {
        if (typeof property === "string") {
            v
                ? this._dom.style.setProperty(toKebabCase(property), v, important ? "important" : undefined)
                : this._dom.style.removeProperty(toKebabCase(property));
            return this;
        }
        for (const prop in property) {
            const v = (property[prop] ?? "").trimEnd();
            if (v === "") {
                this._dom.style.removeProperty(toKebabCase(prop));
            }
            else {
                const important = v.endsWith("!");
                this._dom.style.setProperty(toKebabCase(prop), important ? v.slice(0, -1) : v, important ? "important" : undefined);
            }
        }
        return this;
    }
    /** @inheritdoc */
    focus(options) {
        this.Disabled || this._dom.focus(options);
        return this;
    }
    /** @inheritdoc */
    blur() {
        this.Disabled || this._dom.blur();
        return this;
    }
    /** @inheritdoc */
    onDidUnmount() {
        this._parentDisabled && this.parentDisabled(false);
        super.onDidUnmount();
    }
    /** @inheritdoc */
    onBeforeMount(parent) {
        super.onBeforeMount(parent);
        (parent.Disabled || parent.ParentDisabled) && this.parentDisabled(true);
    }
}
/**
 * Abstract base implementation of a component, *that does not allow* adding child components.
 * @see {@link IElementVoidComponent}
 */
class AElementComponentVoid extends AElementComponent {
}
/////////////////////////////
// #region AChildren
/**
 * Symbol property key for the array that holds all child components of `AChildren`.
 */
const IChildren_Children = Symbol("IChildren_Children");
/**
 * Symbol property key for the DOM element that contains all child DOM elements of `AChildren`.
 */
const IChildren_DOM = Symbol("IChildren_DOM");
/**
 * Abstract base implementation of the `IChildren` interface. The intended use of this class is to
 * be mixed into a target class that needs to implement/use `IChildren`. The target class _must_
 * call `setChildrenDOMTarget()` as soon as the DOM element that the mixin refers to is available!
 * Additionally the class interface _must_ be augmented with `AChildren<...>`!
 *
 * Instances of the classes from all the examples below expose all functions like `append()`,
 * `remove()` etc. from `IChildren`.
 * @example
 * ```typescript
 * // Simple container component that handles children.
 * export class Container extends AElementComponent<HTMLDivElement> {
 *   static {
 *     mixin(false, this, AChildren);
 *   }
 *
 *   constructor() {
 *     super();
 *     this._dom = document.createElement("div");
 *     // Without parameter `setChildrenDOMTarget()` uses `this._dom` as the DOM target for its
 *     // children by default.
 *     this.setChildrenDOMTarget();
 *   }
 *
 *   // Mandatory override if using the `AChildren` mixin!
 *   public override dispose(): void {
 *     // This calls `clearOwner()` (from within `AChildren` but only if it is implemented). For
 *     // this simple container there is nothing to clean up so it's not implemented.
 *     this.clear();
 *     super.dispose();
 *   }
 * }
 *
 * // Mix in the `IChildren` interface into the class definition.
 * export interface Container extends IChildrenMixin { }
 * ```
 * @example
 * ```typescript
 * // The container example from above could also be made generic with regard to its children:
 * export class Container<Child> extends AElementComponent<HTMLDivElement> {
 *   // Implementation same as above ...
 * }
 * export interface Container<Child extends INodeComponent<Node>> extends IChildrenMixin<Child> { }
 *
 * // Usage:
 * const pc = new Container<P>(); // Only allows `P` components as its children.
 * p.append(new Span("Hello world!")); // TS error 2345
 * const sc = new Container<Span>(); // Only allows `Span` components as its children.
 * sc.append(new P("Hello world!")); // TS error 2345
 * ```
 * @example
 * ```typescript
 * // Advanced container component with an 'opaque' inaccessible inner tree of components (a label
 * // and a container) that handles children. The children reside in the inner container.
 * export class LabeledContainer extends AElementComponent<HTMLDivElement> {
 *   static {
 *       mixin(false, this, AChildren);
 *   }
 *
 *   #label: Span;
 *   #container: HTMLDivElement;
 *
 *   constructor(label: string) {
 *     super();
 *     this._dom = document.createElement("div");
 *     this.#label = new Span(label);
 *     this.#container = document.createElement("div");
 *     // Set the the inner container as the DOM target for children, not `this._dom`.
 *     this.setChildrenDOMTarget(this.#container);
 *     this._dom.append(this.#label.DOM, this.#container);
 *   }
 *
 *   // Provide access to the label.
 *   public get Label(): Span {
 *     return this.#label;
 *   }
 *
 *   // Implement this function if using the `AChildren` mixin and there are things to clean up on
 *   // a call of `clear()` or when the component is disposed of.
 *   protected clearOwner(): void {
 *     // At this point the `AChildren` mixin has disposed of the child components mounted in
 *     // `this.container`.
 *     // Now dispose of the label and clear the DOM of this component.
 *     this.#label.dispose();
 *     this._dom.replaceChildren();
 *   }
 *
 *   // Mandatory override if using the `AChildren` mixin!
 *   public override dispose(): void {
 *     // This calls `clearOwner()` (from within `AChildren` but only if it is implemented).
 *     this.clear();
 *     super.dispose();
 *   }
 * }
 *
 * // Mix in the `IChildren` interface into the class definition.
 * export interface LabeledContainer extends IChildrenMixin { }
 * ```
 * @example
 * ```typescript
 * // `AChildren can be used with the class `AElementComponentWithInternalUI` as well. Although
 * // there is nothing wrong with the `LabeledContainer` example above this is the preferred way to
 * // build components with an inner tree of components/user interface.
 * export class LabeledContainer extends AElementComponentWithInternalUI<Div> {
 *   static {
 *     mixin(false, this, AChildren);
 *   }
 *
 *   #label: Span;
 *
 *   constructor(label: string) {
 *     super();
 *     this.initialize(undefined, label);
 *   }
 *
 *   // Provide access to the label.
 *   public get Label(): Span {
 *     return this.#label;
 *   }
 *
 *   // Show/hide the label by inserting/removing it.
 *   public showLabel(show: boolean) {
 *     show ? this.ui.insert(0, this.#label) : this.ui.remove(this.#label);
 *   }
 *
 *   // Override this function if using the `AChildren` mixin and there are things to clean up on
 *   // a call of `clear()` or when the component is disposed of.
 *   protected override clearOwner(): void {
 *     // At this point the `AChildren` mixin has disposed of the child components mounted in
 *     // `this.ui` (only those managed by `AChildren`, the label isn't part of it).
 *     // Now dispose of the label if it isn't mounted.
 *     this.ui.contains(this.#label) || this.#label.dispose();
 *     // When using `AElementComponentWithInternalUI`, `super.clearOwner()` must be called here!!
 *     super.clearOwner();
 *   }
 *
 *   protected override buildUI(label: string): this {
 *     this.ui = new Div().append(this.#label = new Span(label));
 *     this.setChildrenDOMTarget(this.ui.DOM);
 *     return this;
 *   }
 *
 *   // Overriding `dispose()` is only necessary if there are things besides to components to clean
 *   // up when the component is disposed of; rarely necessary.
 *   // public override dispose(): void {
 *   //     // Remove event listeners, destroy observers etc.
 *   //     super.dispose();
 *   // }
 * }
 * // Mix in the `IChildren` interface into the class definition (here again using generics but this
 * // time less strict with a default type).
 * export interface LabeledContainer<Child extends INodeComponent<Node> = INodeComponent<Node>> extends IChildrenMixin<Child> { }
 * ```
 */
class AChildren extends ANodeComponent {
    /** Contains the child components of this component. */
    [IChildren_Children];
    /**
     * The DOM element which contains the DOM elements of the child components. Will/must be
     * assigned once by calling `setChildrenDOMTarget()`.
     */
    [IChildren_DOM];
    /**
     * Sets the DOM element on which `AChildren` operates. _Must_ be called by classes that use
     * `AChildren` as a mixin as soon as that DOM element is available.
     * @param domTarget The DOM element that `AChildren` operates on. By default this is `this._dom`
     * but it can be set to any other DOM element the component holds/controls.
     */
    setChildrenDOMTarget(domTarget) {
        if (this[IChildren_DOM]) {
            throw new Error("IChildren: 'setChildrenDOMTarget()' can only be called once.");
        }
        this[IChildren_Children] = [];
        this[IChildren_DOM] = domTarget || this._dom;
    }
    /** @inheritdoc */
    get Children() {
        return this[IChildren_Children].slice();
    }
    /** @inheritdoc */
    get ElementChildren() {
        // @ts-expect-error ---
        return this[IChildren_Children].filter(child => child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT);
    }
    /** @inheritdoc */
    get First() {
        return this[IChildren_Children][0];
    }
    /** @inheritdoc */
    get Last() {
        return this[IChildren_Children].at(-1);
    }
    /** @inheritdoc */
    append(...children) {
        // Avoid multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
        const uniques = new Set(children.filter(e => e ?? e));
        if (uniques.size === 0) {
            return this;
        }
        /**
         * It's unknown where the given components are possibly mounted so first remove them. This
         * is done groupwise (with regard to the parents of the components).
         */
        const parents = new Map();
        for (const component of uniques) {
            const parent = component.Parent;
            if (parent) {
                const group = parents.get(parent);
                if (group) {
                    group.push(component);
                }
                else {
                    parents.set(parent, [component]);
                }
            }
        }
        for (const entry of parents.entries()) {
            entry[0].remove(...entry[1]);
        }
        for (const component of uniques) {
            component.onBeforeMount(this);
            this[IChildren_Children].push(component);
            this[IChildren_DOM].appendChild(component.DOM);
            component.onDidMount(this);
        }
        return this;
    }
    /** @inheritdoc */
    appendFragment(fragment) {
        if (fragment.Children.length === 0) {
            return this;
        }
        const { Fragment, Children } = fragment.release(); // eslint-disable-line jsdoc/require-jsdoc
        // Note: any component in a fragment has already been removed/unmounted from its parent (if
        // any), so there is no need to remove children from their parents here.
        for (const component of Children) {
            component.onBeforeMount(this);
        }
        this[IChildren_Children].push(...Children);
        this[IChildren_DOM].appendChild(Fragment);
        for (const component of Children) {
            component.onDidMount(this);
        }
        return this;
    }
    /** @inheritdoc */
    insert(at, ...children) {
        // Avoid multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
        const uniques = new Set(children.filter(e => e ?? e));
        if (uniques.size === 0) {
            return this;
        }
        let insertBefore;
        if (typeof at === "number") {
            if (at < 0) {
                insertBefore = this[IChildren_Children][0];
            }
            else if (at >= this[IChildren_Children].length) {
                return this.append(...uniques);
            }
            else {
                insertBefore = this[IChildren_Children][at];
            }
            if (uniques.has(insertBefore)) {
                throw new Error("IChildren: hierarchy error, component indexed by 'at' must not be an element of 'components'.");
            }
        }
        else {
            if (uniques.has(at)) {
                throw new Error("IChildren: hierarchy error, component given by 'at' must not be an element of 'components'.");
            }
            const atIndex = this[IChildren_Children].indexOf(at);
            if (atIndex < 0) {
                return this;
            }
            insertBefore = this[IChildren_Children][atIndex];
        }
        if (!insertBefore) {
            return this;
        }
        /**
         * It's unknown where the given components are possibly mounted so first remove them. This
         * is done groupwise (with regard to the parents of the components).
         */
        const parents = new Map();
        for (const component of uniques) {
            const parent = component.Parent;
            if (parent) {
                const group = parents.get(parent);
                if (group) {
                    group.push(component);
                }
                else {
                    parents.set(parent, [component]);
                }
            }
        }
        for (const entry of parents.entries()) {
            entry[0].remove(...entry[1]);
        }
        let insertIndex = this[IChildren_Children].indexOf(insertBefore);
        for (const component of uniques) {
            component.onBeforeMount(this);
            this[IChildren_Children].splice(insertIndex, 0, component);
            this[IChildren_DOM].insertBefore(component.DOM, insertBefore.DOM);
            component.onDidMount(this);
            insertIndex++;
        }
        return this;
    }
    /** @inheritdoc */
    insertFragment(at, fragment) {
        if (fragment.Children.length === 0) {
            return this;
        }
        let index;
        if (typeof at === "number") {
            index = at < 0 ? 0 : at;
        }
        else {
            index = this[IChildren_Children].indexOf(at);
            if (index < 0) {
                return this;
            }
        }
        if (index >= this[IChildren_Children].length) {
            return this.appendFragment(fragment);
        }
        const { Fragment, Children } = fragment.release(); // eslint-disable-line jsdoc/require-jsdoc
        // Any component in a fragment has already been removed from its parent (if any), so there
        // is no need to remove children from their parents here.
        for (const component of Children) {
            component.onBeforeMount(this);
        }
        const insertBefore = this[IChildren_Children][index];
        this[IChildren_Children].splice(index, 0, ...Children);
        this[IChildren_DOM].insertBefore(Fragment, insertBefore.DOM);
        for (const component of Children) {
            component.onDidMount(this);
        }
        return this;
    }
    /** @inheritdoc */
    remove(...children) {
        if (children.length === 0) {
            // Allow children to inspect their parent tree before actually removing them from the DOM.
            for (const component of this[IChildren_Children]) {
                component.onBeforeUnmount();
            }
            while (this[IChildren_Children].length > 0) {
                const component = this[IChildren_Children].at(-1);
                this[IChildren_DOM].removeChild(component.DOM);
                this[IChildren_Children].pop();
                component.onDidUnmount();
            }
        }
        else {
            // Avoid multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
            const uniques = new Set(children.filter(e => e ?? e));
            // Allow children to inspect their parent tree before actually removing them from the DOM.
            for (const component of uniques) {
                if (component.isContainedIn(this)) {
                    component.onBeforeUnmount();
                }
            }
            for (const component of uniques) {
                const index = this[IChildren_Children].indexOf(component);
                if (index !== -1) {
                    this[IChildren_Children].splice(index, 1);
                    this[IChildren_DOM].removeChild(component.DOM);
                    component.onDidUnmount();
                }
            }
        }
        return this;
    }
    /** @inheritdoc */
    extract(to, ...children) {
        // Empty this component.
        if (children.length === 0) {
            // Allow children to inspect their parent tree before actually removing them from the DOM.
            for (const component of this[IChildren_Children]) {
                component.onBeforeUnmount();
            }
            let child = this[IChildren_Children].at(-1);
            while (child) {
                // Rather slow but if `child` inspects the children of its parent
                // (this component) in `onDidUnmount` the state is correct.
                to.push(this[IChildren_Children].pop());
                this[IChildren_DOM].removeChild(child.DOM);
                child.onDidUnmount();
                child = this[IChildren_Children].at(-1);
            }
            return this;
        }
        // Avoid multiple unnecessary `remove`/`onBeforeMount`/`onDidMount` operations.
        const uniques = new Set(children.filter(e => e ?? e));
        // Regular extract of only some components.
        // Allow children to inspect their parent tree before actually removing them from the DOM.
        for (const component of uniques) {
            if (component.isContainedIn(this)) {
                component.onBeforeUnmount();
            }
        }
        for (const component of uniques) {
            const index = this[IChildren_Children].indexOf(component);
            if (index !== -1) {
                to.push(this[IChildren_Children].splice(index, 1)[0]);
                this[IChildren_DOM].removeChild(component.DOM);
                component.onDidUnmount();
            }
        }
        return this;
    }
    /** @inheritdoc */
    moveTo(target, ...children) {
        if (target === this) {
            throw new Error("IChildren: 'moveTo()' isn't supported inside IChildren.");
        }
        const extracted = [];
        this.extract(extracted, ...children);
        target.append(...extracted);
        return this;
    }
    /** @inheritdoc */
    moveToAt(target, at, ...children) {
        if (target === this) {
            throw new Error("IChildren: 'moveToAt()' isn't supported inside IChildren.");
        }
        if (typeof at !== "number" && !target.Children.includes(at)) {
            throw new Error("IChildren: param 'at' for 'moveToAt()' isn't a child of 'target'.");
        }
        const extracted = [];
        this.extract(extracted, ...children);
        target.insert(at, ...extracted);
        return this;
    }
    /** @inheritdoc */
    clear() {
        for (const component of this[IChildren_Children]) {
            component.onBeforeUnmount();
        }
        while (this[IChildren_Children].length > 0) {
            const component = this[IChildren_Children].at(-1);
            this[IChildren_DOM].removeChild(component.DOM);
            this[IChildren_Children].pop();
            component.onDidUnmount();
            component.dispose();
        }
        // Also clear components possibly existing besides the children collection. The
        // implementation of `clearOwner()` is, however, optional, see there.
        this.clearOwner?.();
        return this;
    }
}
// #endregion AChildren
/////////////////////////////
/**
 * Abstract base implementation of a component, *that does allow* adding child components.
 */
class AElementComponentWithChildren extends AElementComponent {
    /**
     * Inner helper class for creating DOM text node components without relying on a similar
     * component available elsewhere (e.g. `Text` class exported from `@vanilla-ts/dom/Text.ts`).
     */
    static #DOMTextNode_;
    static {
        AElementComponentWithChildren.#DOMTextNode_ = class Text extends ANodeComponent {
            constructor(text) {
                super();
                this._dom = document.createTextNode(text);
            }
        };
        /** Mixin the IChildren implementation (which has to target `this._dom`). */
        mixin(false, AElementComponentWithChildren, AChildren);
    }
    /** @inheritdoc */
    ComponentType = ComponentType.ELEMENT_WITH_CHILDREN;
    /**
     * By default, the overridden implementation of `text()` here prevents blindly 'destroying' the
     * content of this component. Instead it clears the component by using `clear()` (which disposes
     * of all children components!) before setting the new text content. In many cases the correct
     * way would be to use `remove()`, `extract()` etc., except disposing the children components is
     * explicitly desired.
     * @inheritdoc
     */
    text(text) {
        this.clear();
        this._dom.textContent = text;
        return this;
    }
    /** @inheritdoc */
    disabled(disabled) {
        if (disabled !== this._disabled) {
            super.disabled(disabled);
            /**
             * Do not propagate the state further if a component up in the tree is still disabled,
             * so only set the 'Disabled' state of this component in isolation.
             */
            if (this._parentDisabled) {
                return this;
            }
            /** Propagate the new `Disabled` state to all children. */
            for (const child of this.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    child.parentDisabled(this._disabled);
                }
            }
        }
        return this;
    }
    /** @inheritdoc */
    parentDisabled(disabled) {
        if (disabled !== this._parentDisabled) {
            super.parentDisabled(disabled);
            /**
             * If `Disabled` is `true`, the state `ParentDisabled` already has been propagated to all
             * children so they are ignored. This maintains the correct `Disabled`/`ParentDisabled`
             * state of sub-trees at any depth.
             */
            if (this._disabled) {
                return this;
            }
            /** Otherwise propagate the new `Disabled` state to all children. */
            for (const child of this.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    child.parentDisabled(this._parentDisabled);
                }
            }
        }
        return this;
    }
    /** @inheritdoc */
    get Phrase() {
        throw new Error("'Phrase' is a writeonly property.");
    }
    /** @inheritdoc */
    set Phrase(phrase) {
        Array.isArray(phrase)
            ? this.phrase(...phrase)
            : this.phrase(phrase);
    }
    /** @inheritdoc */
    phrase(...phrase) {
        this.clear();
        phrase.length === 1 && typeof phrase[0] === "string"
            ? this._dom.textContent = phrase[0]
            : this.append(...phrase.map(e => (typeof e === "string" ? new AElementComponentWithChildren.#DOMTextNode_(e) : e)));
        return this;
    }
    /** @inheritdoc */
    get Rephrase() {
        throw new Error("'Rephrase' is a writeonly property.");
    }
    /** @inheritdoc */
    set Rephrase(phrase) {
        Array.isArray(phrase)
            ? this.rephrase(...phrase)
            : this.rephrase(phrase);
    }
    /** @inheritdoc */
    rephrase(...phrase) {
        return this.remove().phrase(...phrase);
    }
    /**
     * Default implementation. For classes simply extending `AElementComponentWithChildren` there is
     * almost nothing to do except for removing DOM child nodes which have been left over (usually
     * pure text nodes form `Phrase/phrase()`).
     * @see {@link AChildren.clearOwner()}
     * @see {@link dispose()}
     */
    clearOwner() {
        this._dom.replaceChildren();
    }
    /**
     * \
     * \
     * __Note:__ `this.clear()` in the implementation below calls the `clear()` function of the
     * `AChildren` mixin which itself first disposes of all child components and then calls
     * `this.clearOwner()`. So `this.clearOwner()` is the right place to further clear things up in
     * this component instance.
     * @inheritdoc
     */
    dispose() {
        this.clear();
        super.dispose();
    }
}
/**
 * Abstract base class for creating components that manage their own component tree/user interface
 * without exposing inner components as children of the component. For example, if a component is
 * needed that displays personal data such as first name, last name and date of birth, it may seem
 * simple to just extend the class `Div` (from `@vanilla-ts/dom`) and add a few paragraph components
 * for the data to be displayed.\
 * While this is perfectly fine from a technical point of view, the resulting component makes all
 * its children visible to the outside world, since `Div` implements the `IChildren` interface,
 * which makes it very difficult to 'protect' the children from unwanted access. This could be
 * solved by overriding most or all of the `IChildren` functions, but the result would be a
 * component that 'looks' like a `Div` component but has a completely different and probably
 * unexpected behavior for consumers.\
 * However, if the component should expose the functionality of `IChildren` to make it look like
 * a component of type `AElementComponentWithChildren` an implementation of `AChildren` that works
 * on an inner component this can easily be mixed in, see, for example, the implementation of
 * `LabeledContainer` in `@vanilla-ts/components` or the documentation of `AChildren`.\
 * For components with their own 'opaque' user interface like the one described above,
 * `AElementComponentWithInternalUI` is preferable as the base class. It allows to build an inner
 * user interface that isn't accessible from outside the component. Another advantage of using
 * `AElementComponentWithInternalUI` is that extending classes (usually) do not have to worry about
 * releasing the inner components, as `AElementComponentWithInternalUI` already contains a suitable
 * implementation of `dispose()` for this purpose. It can also be specified whether the inner
 * container with its tree should be attached to the outer component tree or not.
 *
 * The following example is a simple stepper component (together with an appropriate factory) with
 * sub-components that are not accessible from outside.
 * @example
 * ```typescript
 * export class Stepper extends AElementComponentWithInternalUI<Div> {
 *   #val: Span;
 *
 *   constructor(private start: number = 0) {
 *     super();
 *     // Never call `this.buildUI()` yourself since this is done by `initialize()` (which _must_
 *     // be called)!
 *     this.initialize();
 *   }
 *
 *   protected override buildUI(): this {
 *     this.ui = new Div().append(
 *       new Button("+").on("click", () => this.step(1)),
 *       this.#val = new Span(this.start.toString()),
 *       new Button("-").on("click", () => this.step(-1)),
 *     );
 *     return this;
 *   }
 *
 *   public get Value(): number {
 *     return this.start;
 *   }
 *
 *   public step(amount: number): void {
 *     this.#val.text((this.start += amount).toString());
 *   }
 * }
 *
 * export class StepperFactory<T> extends ComponentFactory<Stepper> {
 *   public stepper(start: number = 0, data?: T): Stepper {
 *     return this.setupComponent(new Stepper(start), data);
 *   }
 * }
 * ```
 */
class AElementComponentWithInternalUI extends AElementComponent {
    /** The container which constitutes the component tree/user interface of the component. */
    ui;
    #mountUI;
    #initialized = false;
    #disposing = false;
    /** @inheritdoc */
    text(_text) {
        throw new Error("'text()' can't be used on 'AElementComponentWithInternalUI'.");
    }
    /** @inheritdoc */
    disabled(disabled) {
        if (disabled !== this._disabled) {
            super.disabled(disabled);
            /**
             * Do not propagate the state further if a component up in the tree is still disabled,
             * so only set the 'Disabled' state of this component in isolation.
             */
            if (this._parentDisabled) {
                return this;
            }
            /** Propagate the new `Disabled` state to all children of `this.ui`. */
            for (const child of this.ui.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    child.parentDisabled(this._disabled);
                }
            }
            /**
             * Additionally, if this component has an `AChildren` mixin also propagate the new
             * `Disabled` state to all children of the mixin. In such cases `this.ui` (or another
             * component) holds the _DOM elements_ of the children but the children _components_
             * themselves are held/managed by `AChildren` separately.
             */
            if (Object.hasOwn(this, IChildren_DOM)) {
                for (const child of this.Children) {
                    if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                        child.parentDisabled(this._disabled);
                    }
                }
            }
        }
        return this;
    }
    /** @inheritdoc */
    parentDisabled(disabled) {
        if (disabled !== this._parentDisabled) {
            super.parentDisabled(disabled);
            /**
             * If `Disabled` is `true`, the state `ParentDisabled` already has been propagated to
             * all children so they are ignored. This maintains the correct `Disabled`/
             * `ParentDisabled` state of sub-trees at any depth.
             */
            if (this._disabled) {
                return this;
            }
            /** Otherwise propagate the new `Disabled` state to all children of `this.ui`. */
            for (const child of this.ui.Children) {
                if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                    child.parentDisabled(this._parentDisabled);
                }
            }
            /**
             * Additionally, if this component has an `AChildren` mixin also propagate the new
             * `Disabled` state to all children of the mixin. In such cases `this.ui` (or another
             * component) holds the _DOM elements_ of the children but the children _components_
             * themselves are held/managed by `AChildren` separately.
             */
            if (Object.hasOwn(this, IChildren_DOM)) {
                for (const child of this.Children) {
                    if (child.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN || child.ComponentType === ComponentType.ELEMENT) {
                        child.parentDisabled(this._parentDisabled);
                    }
                }
            }
        }
        return this;
    }
    /** @inheritdoc */
    focus(options) {
        this.Disabled || this.ui.DOM.focus(options);
        return this;
    }
    /** @inheritdoc */
    blur() {
        this.Disabled || this.ui.DOM.blur();
        return this;
    }
    /**
     * _Must_ be called by derived classes, preferably as the last operation in the constructor.
     * This automatically calls `buildUI()` in derived classes (which _must never_ be called
     * directly there).
     * @param mountUI If `true`, this instance is set as the parent component of the UI container
     * (`ui`). This allows children of `ui` to traverse out of the component tree of this compoenent
     * with subsequent `.Parent` calls. If `false`, a chain of `.Parent` calls will end up with
     * `undefined` at `this.ui.Parent` which isolates all inner components from the component tree
     * existing outside this component.\
     * Default: `true`.
     * @param args An array of arguments passed to the function `buildUI()` so that if implementing
     * components call `initialize(undefined, true, "foo", 42)` in their constructor `buildUI()`
     * will be called with `buildUI(true, "foo", 42)`.
     * @returns This instance.
     */
    initialize(mountUI = true, ...args) {
        if (this.#initialized) {
            throw new Error("'initialize()' can only be called once.");
        }
        this.#initialized = true;
        this.#mountUI = mountUI;
        this.buildUI(...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        if (this.#mountUI) {
            this.ui.onBeforeMount(this);
            this._dom = this.ui.DOM;
            this.ui.onDidMount(this);
        }
        else {
            this._dom = this.ui.DOM;
        }
        return this.initialized();
    }
    /**
     * This function is called after `initialize()` and `buildUI()` have been called. At this point
     * the basic internal structure and the tree of the component are completely set up and mounted
     * (from the perspective of `AElementComponentWithInternalUI`). The default implementation here
     * does nothing, it can be overridden in derived classes to perform additional operations.
     * @returns This instance.
     */
    initialized() {
        return this;
    }
    /** @inheritdoc */
    onDidUnmount() {
        this._parentDisabled && this.parentDisabled(false);
        super.onDidUnmount();
    }
    /** @inheritdoc */
    onBeforeMount(parent) {
        super.onBeforeMount(parent);
        (parent.Disabled || parent.ParentDisabled) && this.parentDisabled(true);
    }
    /**
     * @see {@link clear()}
     * @see {@link AChildren.clearOwner()}
     */
    clearOwner() {
        if (!this.#initialized) {
            throw new Error("'clear()'/'clearOwner()' can only be called once after 'initialize()'.");
        }
        this.#disposing || this.ui.clear();
    }
    /**
     * Removes _all_ child components from the internal component tree/user interface of this
     * component. The child components are also disposed of.\
     * __Very important note:__ This implementation of `clear()` will be _replaced_ if `AChildren`
     * is used as a mxin for classes inheriting from `AElementComponentWithInternalUI`, so the code
     * here only calls `this.clearOwner()` for clearing the inner tree (`this.ui`). The `clear()`
     * function of `AChildren` itself also always calls `this.clearOwner()`, so the intended
     * behavior is maintained. So `clear()` must never be overridden in classes that inherit from
     * `AElementComponentWithInternalUI` _and_ that use `AChildren`! Instead override and implement
     * `clearOwner()` if needed in such cases!!
     * @see {@link IChildren.clear()}
     * @see {@link AChildren.clearOwner()}
     * @returns This instance.
     */
    clear() {
        this.clearOwner();
        return this;
    }
    /** @inheritdoc */
    dispose() {
        this.#disposing = true;
        try {
            this.clear();
            if (this.#mountUI) {
                this.ui.onBeforeUnmount();
                this.ui.onDidUnmount();
            }
            this.ui.dispose();
            super.dispose();
        }
        finally {
            this.#disposing = false;
        }
    }
}
/**
 * Abstract base implementation of a component factory. Currently without any further functionality.
 * @see {@link IComponentFactory}
 */
class AComponentFactory {
}
/**
 * Abstract base implementation of an event bus.
 *
 * __Note:__ Avoid passing anonymous or unbound functions to `on()` or `once()` as this makes it
 * unnecessarily difficult to suspend, resume, etc. these listeners. In such cases, you'd have to
 * examine the result of `IEventBus.Listeners` to find the original function, e.g. to suspend or
 * remove a listener.
 *
 * Usually the following code is sufficient to create an instance of an event bus:
 * @example
 * ```typescript
 * // -- File `AppEventBus.ts` --
 * // First define an event map for all event types to be handled by the event bus.
 * interface SomeEventMap {
 *   "LoginSucceeded": boolean;
 *   "Obj": {
 *     "StringProp": string;
 *     "BooleanProp": boolean;
 *   };
 *   "Logout": undefined;
 * }
 *
 * class EventBus extends AEventBus<SomeEventMap> { }
 * // Exporting the instance makes it easy to use the event bus from anywhere, see below.
 * export const eb = new EventBus("AppEventBus");
 *
 *
 * // -- File `Module.ts` --
 * import { eb as AppEventBus } from "AppEventBus.js";
 *
 * // Use the event bus:
 * AppEventBus.on(...)
 * AppEventBus.emit(...)
 * AppEventBus.suspend(...)
 * AppEventBus.resume(...)
 * AppEventBus.allEvents(...)
 *
 *
 * // -- File `AppShutdown.ts` --
 * import { eb as AppEventBus } from "AppEventBus.js";
 *
 * // Shutting down the app, the event bus instance is no longer needed:
 * AppEventBus.dispose()
 * ```
 */
class AEventBus {
    static busElementClass;
    static busRegistry = new Map();
    static {
        /**
         * Private class for a `Text` component which handles custom events.
         */
        AEventBus.busElementClass = class BusElement extends ANodeComponent {
            constructor(name) {
                super();
                this._dom = document.createTextNode(name + "-EventBus");
            }
        };
    }
    bus;
    name;
    wrappedListeners = [];
    /**
     * Create a new event bus instance.
     * @param name The unique name of the event bus. If an event bus instance with the same name
     * already exists, an error is thrown.
     */
    constructor(name) {
        if (AEventBus.busRegistry.has(name)) {
            throw new Error(`AEventBus: an event bus with the name '${name}' already exists.`);
        }
        this.name = name;
        this.bus = new AEventBus.busElementClass(name);
        AEventBus.busRegistry.set(this.name, this);
    }
    /**
     * Returns a copy of the map which holds all active event bus instances.
     */
    static get Instances() {
        return new Map(AEventBus.busRegistry);
    }
    /** @inheritdoc */
    get Name() {
        return this.name;
    }
    /** @inheritdoc */
    get Listeners() {
        return this.bus.Listeners;
    }
    /** @inheritdoc */
    emit(type, eventData) {
        this.dispatch(type, eventData, false);
        return this;
    }
    /** @inheritdoc */
    dispatch(type, eventData, cancelable = false) {
        return this.bus.dispatch(new CustomEvent(type, { cancelable: cancelable, detail: eventData })); // eslint-disable-line jsdoc/require-jsdoc
    }
    /** @inheritdoc */
    on(type, listener) {
        /**
         * Wraps the original listener function. This is the function that is registered in the
         * internal event listener list of `this.bus`. When called, `wrappedListener` calls the
         * original listener function given and passes back only the member `detail` of the custom
         * event emitted by `this.emit()` or `this.dispatch()`. Additionally an object which allows
         * to cancel the event and also stop its further propagation is passed to the original
         * listener.
         * @param ev The custom event created by `this.emit()` or `this.dispatch()`.
         */
        const wrappedListener = (ev) => {
            listener(ev.detail, {
                /* eslint-disable jsdoc/require-jsdoc */
                Canceled: ev.defaultPrevented,
                cancel: () => ev.preventDefault(),
                stopPropagation: () => ev.stopImmediatePropagation()
                /* eslint-enable */
            });
        };
        this.wrappedListeners.push([listener, wrappedListener]);
        this.bus.on(type, wrappedListener);
        return this;
    }
    /** @inheritdoc */
    once(type, listener) {
        // eslint-disable-next-line jsdoc/require-param
        /** @see `wrappedListener` in {@link AEventBus.on()} */
        const wrappedListener = (ev) => {
            listener(ev.detail, {
                /* eslint-disable jsdoc/require-jsdoc */
                Canceled: ev.defaultPrevented,
                cancel: () => ev.preventDefault(),
                stopPropagation: () => ev.stopImmediatePropagation()
                /* eslint-enable */
            });
            this.off(type, listener);
        };
        this.wrappedListeners.push([listener, wrappedListener]);
        this.bus.once(type, wrappedListener);
        return this;
    }
    /** @inheritdoc */
    off(type, listener) {
        const index = this.wrappedListeners.findIndex(e => e[0] === listener);
        if (index !== -1) {
            this.bus.off(type, this.wrappedListeners[index][1]);
            this.wrappedListeners.splice(index, 1);
        }
        return this;
    }
    /** @inheritdoc */
    suspend(type, listener) {
        const index = this.indexOfEventListener(listener, false);
        if (index !== -1) {
            this.bus.suspend(type, this.wrappedListeners[index][1]);
        }
        return this;
    }
    /** @inheritdoc */
    resume(type, listener) {
        const index = this.indexOfEventListener(listener, true);
        if (index !== -1) {
            this.bus.resume(type, this.wrappedListeners[index][1]);
        }
        return this;
    }
    /** @inheritdoc */
    allEvents(mode) {
        this.bus.allEvents(mode);
        return this;
    }
    /** @inheritdoc */
    dispose() {
        this.bus.dispose();
        AEventBus.busRegistry.delete(this.name);
        // @ts-expect-error ---
        this.bus = undefined;
        return this;
    }
    /**
     * Searches a wrapped event listener in the internal list of event listeners.
     * @param listener The orginal listener tied to the wrapped listener which is being sought.
     * @param suspended The `Suspended` state of the listener.
     * @returns The index of the listener found or `-1` if the listener couldn't be found.
     */
    indexOfEventListener(listener, suspended) {
        return this.wrappedListeners.findIndex(wrapped => {
            return wrapped[0] === listener
                && this.bus.Listeners.findIndex(listeners => {
                    return listeners.Listener === wrapped[1] && listeners.Suspended === suspended;
                }) !== -1;
        });
    }
}

/**
 * Base implementation for all components, *that do not allow* to add child components.
 * @see {@link AElementComponentVoid}
 */
class ElementComponentVoid extends AElementComponentVoid {
    _tagName;
    _is;
    /**
     * Create instance based on an HTML element type without children.
     * @param _tagName Tag name of the HTML element.
     * @param _is Support creating customized built-in elements:
     * - https://developer.mozilla.org/en-US/docs/Web/Web_Components#custom_elements
     * - https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example.
     * Currently only for completeness, otherwise not used.
     */
    constructor(_tagName, _is) {
        super();
        this._tagName = _tagName;
        this._is = _is;
        if (_is) {
            this._dom = document.createElement(this._tagName, { is: _is }); // eslint-disable-line jsdoc/require-jsdoc
        }
        else {
            this._dom = document.createElement(this._tagName);
        }
    }
}
/**
 * Base implementation for all components, *that do allow* to add child components.
 * @see {@link AElementComponentWithChildren}
 */
class ElementComponentWithChildren extends AElementComponentWithChildren {
    _tagName;
    _is;
    /**
     * Create instance based on an HTML element type with children.
     * @param _tagName Tag name of the HTML element.
     * @param _is Support creating customized built-in elements:
     * - https://developer.mozilla.org/en-US/docs/Web/Web_Components#custom_elements
     * - https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example.
     * Currently only for completeness, otherwise not used.
     */
    constructor(_tagName, _is) {
        super();
        this._tagName = _tagName;
        this._is = _is;
        if (_is) {
            this._dom = document.createElement(this._tagName, { is: _is }); // eslint-disable-line jsdoc/require-jsdoc
        }
        else {
            this._dom = document.createElement(this._tagName);
        }
        // Set target DOM for the `IChildren` mixin from `AElementComponentWithChildren`!!
        this.setChildrenDOMTarget();
    }
}
/**
 * Simple wrapper helper component for a DOM element with childern. The component is fully
 * functional but doesn't contain any child components which may already have been created in the
 * DOM tree below the target element; also no event handlers of the target element are adopted.
 * Its main purpose is to serve as the root component for following components to be appended
 * to an already existing DOM element, for example for building an application inside an arbitrary
 * (empty) div element somewhere in the page.
 */
class WrappedDOMElementComponentWithChildren extends AElementComponentWithChildren {
    /**
     * Create an instance that wraps a target DOM element with a component instance.
     * @param target The DOM element to be wrapped.
     */
    constructor(target) {
        super();
        this._dom = target;
        // Set target DOM for the `IChildren` mixin from `AElementComponentWithChildren`!!
        this.setChildrenDOMTarget();
    }
}
/**
 * Base implementation for a component factory. This implementation doesn't do anything in
 * `setupComponent` but it may be useful as the base for custom factories that support a fluent API
 * for creating components. `setupComponent` can be overridden later to set up components.
 * @see {@link AComponentFactory}
 * @example
 * ```typescript
 * class MyFactory extends ComponentFactory<IComponent> {
 *     public override setupComponent(component: IElementComponent<HTMLElement>): IComponent {
 *         const className = component
 *             .ClassName
 *             .replace(/[A-Z]+(?![a-z])|[A-Z]/g, (c, o) => (o ? "-" : "") + c.toLowerCase());
 *         return component.addClass(`vts-${className}`);
 *     }
 * }
 *
 * const $ = new (mixinComponentFactories(
 *     MyFactory,
 *     DivFactory, ButtonFactory, LabeledTextInputFactory
 * ));
 *
 * let edtUserName: LabeledTextInput;
 *
 * const app = $.div().addClass("app").append(
 *     edtUserName = $.labeledTextInput("Username:", "userName", "userName"),
 *     $.button("Create").on("click", (_ev: MouseEvent) => {
 *         Store.createUser(edtUserName.Component.Value);
 *     })
 * );
 * ```
 *
 * An alternative version without the declaration of the variable `edtUserName`can look like this:
 *
 * ```typescript
 * const app = $.div().addClass("app").append(
 *     ...(() => {
 *         const edt = $.labeledTextInput("Username:", "userName", "userName");
 *         const btn = $.button("Create").on("click", (_ev: MouseEvent) => {
 *             Store.createUser(edt.Component.Value);
 *         });
 *         return [edt, btn];
 *     })()
 * );
 * ```
 */
let ComponentFactory$1 = class ComponentFactory extends AComponentFactory {
    setupComponent(component, _data) {
        return component;
    }
};
/**
 * A factory that sets the CSS class of a component based on the components class name.
 */
class CSSClassNameFactory extends ComponentFactory$1 {
    #cssPrefix;
    #prefix;
    #recursive;
    /**
     * Create component factory.
     * @param cssPrefix The prefix for the generated CSS class name (`-` will always be appended to
     * the prefix).
     * @param recursive If `true`, nested components will be handled recursively.
     */
    constructor(cssPrefix = "", recursive = false) {
        super();
        this.cssPrefix(cssPrefix);
        this.#recursive = recursive;
    }
    /** @inheritdoc */
    setupComponent(component, data) {
        switch (component.ComponentType) {
            // Usually there is nothing to set up on (text) node based components.
            case ComponentType.NODE:
                break;
            // Set class name on this component.
            case ComponentType.ELEMENT:
                this.addClassNames(component, data);
                break;
            // Recursively set class name on child components.
            case ComponentType.ELEMENT_WITH_CHILDREN:
                if (this.#recursive && component.ComponentType === ComponentType.ELEMENT_WITH_CHILDREN) {
                    for (const child of component.ElementChildren) {
                        this.setupComponent(child);
                    }
                }
                this.addClassNames(component, data);
                break;
        }
        return component;
    }
    /**
     * Get/set the current prefix for CSS class names (auto-trimmed string).
     */
    get CSSPrefix() {
        return this.#cssPrefix;
    }
    /** @inheritdoc */
    set CSSPrefix(v) {
        this.#cssPrefix = v;
    }
    /**
     * Set the current prefix for CSS class names (auto-trimmed string).
     * @param v The current prefix for CSS class names.
     * @returns This instance.
     */
    cssPrefix(v) {
        this.#cssPrefix = v.trim();
        this.#prefix = this.#cssPrefix ? this.#cssPrefix + "-" : "";
        return this;
    }
    /**
     * Get/set the current recursive CSS class name assignment handling. If `true` is set, nested
     * components are handled recursively.
     */
    get Recursive() {
        return this.#recursive;
    }
    /** @inheritdoc */
    set Recursive(v) {
        this.#recursive = v;
    }
    /**
     * Set the current recursive CSS class name assignment handling.
     * @param v `true`, if nested components should be handled recursively, otherwise `false`.
     * @returns This instance.
     */
    recursive(v) {
        this.#recursive = v;
        return this;
    }
    /**
     * Set a generated CSS class name on a component.
     * @param component The component on which the class name should be set.
     * @param _data Arbitrary data to be possibly evaluated.
     */
    addClassNames(component, _data) {
        component.addClass(`${this.#prefix}${toKebabCase(component.constructor.name)}`);
        // component.addClass(`${this.#prefix}${component.DefaultCSSClassName}`);
        // if (typeof data === ...) {
        //     ...
        // }
    }
}
/**
 * Abstract base implementation for an application that also can be used to setup components (the
 * class extends `ComponentFactory`). Extending classes can/should override this function if they
 * want to set up components obtained by factory methods:
 * ```
 * setupComponent<T extends IComponent<HTMLElement>>(component: T): T
 * ```
 * Although calling `super.setupComponent()` in this implementation here currently does nothing it's
 * nevertheless recommended.
 *
 * This class also implements `IChildren` so that components can be added/removed/inserted directly
 * to the application instance which will forward them to the root element/component.
 */
class VTSApplication extends ComponentFactory$1 {
    /**
     * The root DOM container element for all components to be added.
     */
    rootElement;
    /**
     * Root container component for this application and all components to be added.
     */
    root;
    /**
     * Build an app within the given root element.
     * @param rootElement The root DOM container element for all components to be added. If omitted,
     * `document.body` will be used as the root DOM container.
     */
    constructor(rootElement) {
        super();
        this.rootElement = rootElement
            ? rootElement
            : this.rootElement = document.body;
        this.root = new WrappedDOMElementComponentWithChildren(this.rootElement);
        this.setChildrenDOMTarget(this.rootElement);
    }
    /**
     * Get the root container component.\
     * __Note:__ This property __must not be used to add/remove/... components__, instead use the
     * respective functions of `VTSApplication` itself! `Root` should only be used for styling or
     * other (readonly) purposes!
     */
    get Root() {
        return this.root;
    }
    /**
     * Get the root DOM container element for all components.
     */
    get RootElement() {
        return this.rootElement;
    }
    /** @inheritdoc */
    clearOwner() {
        // __Note:__ It is assumed that the root element has no other real components attached to it
        // (its just a wrapped DOM element) so `this.root.clear()` is not called here. This also
        // ensures, that other pure DOM child elements of `this.rootElement` are not removed. If a
        // different behavior is need, this has to implemented in a derived class in `clearOwner()`.
    }
    static {
        /** Mixin the IChildren implementation (which targets the `this.rootElement`). */
        mixin(false, this, AChildren);
    }
}

/**
 * 'Autocomplete' getter/setter and set method returning this instance.
 */
class AutocompleteAttr extends AElementComponent {
    /**
     * Get/set the `autocomplete` attribute value of the component. Allowed values are `on`, `off`,
     * strings and `null`. `null` or an empty string removes the attribute.
     */
    get Autocomplete() {
        return this._dom.autocomplete;
    }
    /** @inheritdoc */
    set Autocomplete(v) {
        this.autocomplete(v);
    }
    /**
     * Set `autocomplete` attribute value of the component. Allowed values are `on`, `off`, strings
     * and `null`. `null` or an empty string removes the attribute.
     * @param v The value to be set.
     * @returns This instance.
     */
    autocomplete(v) {
        this.attrib("autocomplete", v);
        return this;
    }
}
// export interface Option {
//     Value: string;
//     Label?: string;
//     Selected?: boolean;
//     Disabled?: boolean;
// }
/**
 * 'Dirname' getter/setter and set method returning this instance.
 */
class DirnameAttr extends AElementComponent {
    /**
     * Get/set the `dirName` attribute value of the component.  `null` or an empty string removes
     * the attribute. The type of an input element must be `hidden`, `text`, `search`, `tel`, `url`,
     * `email`, `password`, `submit`, `reset` or `button`.
     */
    get DirName() {
        return this._dom.dirName;
    }
    /** @inheritdoc */
    set DirName(v) {
        this.dirName(v);
    }
    /**
     * Set `dirName` attribute value of the component. `null` or an empty string removes the
     * attribute.The type of an input element must be `hidden`, `text`, `search`, `tel`, `url`,
     * `email`, `password`, `submit`, `reset` or `button`.
     * @param v The value to be set.
     * @returns This instance.
     */
    dirName(v) {
        this.attrib("dirname", v);
        return this;
    }
}
/**
 * 'Download' getter/setter and set method returning this instance.
 */
class DownloadAttr extends AElementComponent {
    /**
     * Get/set the `download` attribute of the component. `null` or an empty string removes the
     * attribute.
     */
    get Download() {
        return this._dom.download;
    }
    /** @inheritdoc */
    set Download(v) {
        this.download(v);
    }
    /**
     * Sets the `download` attribute of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    download(v) {
        this.attrib("download", v);
        return this;
    }
}
/**
 * 'For' getter/setter and set method returning this instance.
 */
class ForAttr extends AElementComponent {
    /**
     * Get/set `for` attribute value of underlying HTML element. When used with `<label>`, the `for`
     * attribute has a value which is the id of the form element it relates to. When used with an
     * `<output>`, the `for` attribute has a value which is a space separated list of the id values
     * of the elements which are used to create the output.
     */
    get For() {
        return this.attr("for");
    }
    /** @inheritdoc */
    set For(v) {
        this.for(v);
    }
    /**
     * Set `for` attribute value of underlying HTML element. When used with `<label>`, the `for`
     * attribute has a value which is the id of the form element it relates to. When used with
     * `<output>`, the `for` attribute has a value which is a space separated list of the id values
     * of the elements which are used to create the output.
     * @param v The `for` attribute to be set or `null` to remove the attribute.
     * @returns This instance.
     */
    for(v) {
        this.attrib("for", v);
        return this;
    }
}
/**
 * 'Href' getter/setter and set method returning this instance.
 */
class HrefAttr extends AElementComponent {
    /**
     * Get/set the `href` attribute of the component. `null` or an empty string removes the
     * attribute.
     */
    get Href() {
        return this._dom.href;
    }
    /** @inheritdoc */
    set Href(v) {
        this.href(v);
    }
    /**
     * Sets the `href` attribute of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    href(v) {
        this.attrib("href", v);
        return this;
    }
}
/**
 * 'Hreflang' getter/setter and set method returning this instance.
 */
class HreflangAttr extends AElementComponent {
    /**
     * Get/set the `hreflang` attribute of the component. `null` or an empty string removes the
     * attribute.
     */
    get Hreflang() {
        return this._dom.hreflang;
    }
    /** @inheritdoc */
    set Hreflang(v) {
        this.hreflang(v);
    }
    /**
     * Sets the `hreflang` attribute of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    hreflang(v) {
        this.attrib("hreflang", v);
        return this;
    }
}
/**
 * 'Label' getter/setter and set method returning this instance.
 */
class LabelAttr extends AElementComponent {
    /**
     * Get/set the `label` attribute value of the component. `null` or an empty string removes the
     * attribute.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#label
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup#label
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track#label
     */
    get Label() {
        return this._dom.label;
    }
    /** @inheritdoc */
    set Label(v) {
        this.label(v);
    }
    /**
     * Set `label` attribute value of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#label
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup#label
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track#label
     * @returns This instance.
     */
    label(v) {
        this.attrib("label", v);
        return this;
    }
}
/**
 * 'MinLength/MaxLength' getters/setters and set methods returning this instance.
 */
class MinMaxLengthAttr extends AElementComponent {
    /**
     * Get/set the `minLength` attribute of this input. A value lower than or equal to `0` or `null`
     * removes the attribute.
     */
    get MinLength() {
        return this._dom.minLength;
    }
    /** @inheritdoc */
    set MinLength(v) {
        this.minLength(v);
    }
    /**
     * Set the `minLength` attribute of this input.
     * @param v The value to be set. A value lower than or equal to `0` or `null` removes the
     * attribute.
     * @returns This instance.
     */
    minLength(v) {
        if (v === null || v <= 0) {
            this.attrib("minlength", null);
            return this;
        }
        const maxLength = this._dom.maxLength;
        // maxLength not set, no further check.
        if (maxLength === -1) {
            this._dom.minLength = v;
            return this;
        }
        // Adapt `maxLength` attribute to have a valid range (in this case a fixed length).
        if (v > maxLength) {
            this._dom.maxLength = v;
        }
        this._dom.minLength = v;
        return this;
    }
    /**
     * Get/set the `maxLength` attribute value of this input. A value lower than or equal to `0` or
     * `null` removes the attribute.
     */
    get MaxLength() {
        return this._dom.maxLength;
    }
    /** @inheritdoc */
    set MaxLength(v) {
        this.maxLength(v);
    }
    /**
     * Set the `maxLength` attribute of this input.
     * @param v The value to be set. A value lower than or equal to `0` or `null` removes the
     * attribute.
     * @returns This instance.
     */
    maxLength(v) {
        if (v === null || v <= 0) {
            this.attrib("maxlength", null);
            return this;
        }
        const minLength = this._dom.minLength;
        // `minLength` not set, no further check.
        if (minLength === -1) {
            this._dom.maxLength = v;
            return this;
        }
        // Adapt `minLength` attribute to have a valid range (in this case a fixed length).
        if (v < minLength) {
            this._dom.minLength = v;
        }
        this._dom.maxLength = v;
        return this;
    }
}
/**
 * 'Name' getter/setter and set method returning this instance.
 */
class NameAttr extends AElementComponent {
    /**
     * Get/set `name` attribute value of the component. `null` or an empty string removes the
     * attribute.
     */
    get Name() {
        return this._dom.name;
    }
    /** @inheritdoc */
    set Name(v) {
        this.name(v);
    }
    /**
     * Set `name` attribute value of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    name(v) {
        this.attrib("name", v);
        return this;
    }
}
/**
 * 'Disabled' getter/setter and set method returning this instance. In addition to the regular
 * `Disabled` getter/setter/method this also handles the 'native' DOM attribute `disabled`.
 */
class NativeDisabledAttr extends AElementComponent {
    /**
     * Set 'native' `disabled` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    disabled(v) {
        if (v !== this._disabled) {
            super.disabled(v);
            /**
             * If a parent has been disabled, the underlying 'native' DOM element must also be
             * disabled, otherwise just set its state to `this._disabled`.
             */
            if (this._parentDisabled) {
                this._dom.disabled = true;
            }
            else {
                this._dom.disabled = this._disabled;
            }
        }
        return this;
    }
    /** @inheritdoc */
    parentDisabled(v) {
        if (v !== this._parentDisabled) {
            super.parentDisabled(v);
            /**
             * If a parent has been disabled somewhere up in the tree, the underlying 'native' DOM
             * element must also be disabled.
             */
            if (this._parentDisabled) {
                this._dom.disabled = true;
            }
            else {
                /**
                 * If 'Disabled' has been set explicitly to `true`, the underlying DOM element is
                 * already in a disabled state, so there is nothing to do. But if 'Disabled' is
                 * `false`, the underlying DOM element must reflect the state of `ParentDisabled`
                 * (set by some component up in the tree).
                 */
                if (!this.Disabled) {
                    this._dom.disabled = this._parentDisabled;
                }
            }
        }
        return this;
    }
}
/**
 * 'Open' getter/setter and set method returning this instance.
 */
class OpenAttr extends AElementComponent {
    /**
     * Get/set the `open` attribute of the component.
     */
    get Open() {
        return this._dom.open;
    }
    /** @inheritdoc */
    set Open(v) {
        this._dom.open = v;
    }
    /**
     * Sets the `open` attribute of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    open(v) {
        this._dom.open = v;
        return this;
    }
}
/**
 * 'Ping' getter/setter and set method returning this instance.
 */
class PingAttr extends AElementComponent {
    /**
     * Get/set the `ping` attribute of the component. If the length of `v` is `0`, the attribute is
     * removed.
     */
    get Ping() {
        return this._dom.ping.split(" ");
    }
    /** @inheritdoc */
    set Ping(v) {
        this.ping(...v);
    }
    /**
     * Sets the `ping` attribute of the component.
     * @param v The value to be set. If the length of `v` is `0`, the attribute is removed.
     * @returns This instance.
     */
    ping(...v) {
        this.attrib("ping", v.length === 0 ? null : v.join(" "));
        return this;
    }
}
/**
 * 'Placeholder' getter/setter and set method returning this instance.
 */
class PlaceholderAttr extends AElementComponent {
    /**
     * Get/set the `placeholder` attribute value of the component. `null` or an empty string removes
     * the attribute.
     */
    get Placeholder() {
        return this._dom.placeholder;
    }
    /** @inheritdoc */
    set Placeholder(v) {
        this.placeholder(v);
    }
    /**
     * Set `placeholder` attribute value of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    placeholder(v) {
        this.attrib("placeholder", v);
        return this;
    }
}
/**
 * 'Readonly' getter/setter and set method returning this instance.
 */
class ReadonlyAttr extends AElementComponent {
    /**
     * Get/set the `readOnly` attribute value of the component.\
     * __Note:__ Not supported for the input elements of the types `hidden`, `range`, `color`,
     * `checkbox`, `radio`, and `button`, so it should be overrideen with a `noop` attribute there.
     */
    get Readonly() {
        return this._dom.readOnly;
    }
    /** @inheritdoc */
    set Readonly(v) {
        this._dom.readOnly = v;
    }
    /**
     * Set `readOnly` attribute value of the component.
     * @param v The value to be set.
     * __Note:__ Not supported for the input elements of the types `hidden`, `range`, `color`,
     * `checkbox`, `radio`, and `button`, so it should be overrideen with a `noop` attribute there.
     * @returns This instance.
     */
    readonly(v) {
        this._dom.readOnly = v;
        return this;
    }
}
/**
 * 'ReferrerPolicy' getter/setter and set method returning this instance.
 */
class ReferrerPolicyAttr extends AElementComponent {
    /**
     * Get/set the `referrerpolicy` attribute of the component. `null` or an empty string removes
     * the attribute.
     */
    get ReferrerPolicy() {
        return this._dom.referrerPolicy;
    }
    /** @inheritdoc */
    set ReferrerPolicy(v) {
        this.referrerPolicy(v);
    }
    /**
     * Sets the `referrerpolicy` attribute of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    referrerPolicy(v) {
        this.attrib("referrerpolicy", v);
        return this;
    }
}
/**
 * 'Rel' getter/setter and set method returning this instance.
 */
class RelAttr extends AElementComponent {
    /**
     * Get/set the `rel` attribute of the component. `null` or an empty string removes the
     * attribute.
     */
    get Rel() {
        return this._dom.rel;
    }
    /** @inheritdoc */
    set Rel(v) {
        this.rel(v);
    }
    /**
     * Sets the `rel` attribute of the component.
     * @param v The value to be set. `null` or an empty string removes the attribute.
     * @returns This instance.
     */
    rel(v) {
        this.attrib("rel", v);
        return this;
    }
}
/**
 * 'Required' getter/setter and set method returning this instance.
 */
class RequiredAttr extends AElementComponent {
    /**
     * Get/set the `required` attribute value of the component.
     */
    get Required() {
        return this._dom.required;
    }
    /** @inheritdoc */
    set Required(v) {
        this._dom.required = v;
    }
    /**
     * Set `required` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    required(v) {
        this._dom.required = v;
        return this;
    }
}
/**
 * 'Target' getter/setter and set method returning this instance.
 */
class TargetAttr extends AElementComponent {
    /**
     * Get/set the `target` attribute of the component. Apart from a string `target` can also have
     * the special values `_self`, `_blank`, `_parent`, `_top` and `_unfencedTop`. `null` or an
     * empty string removes the attribute.
     */
    get Target() {
        return this._dom.target;
    }
    /** @inheritdoc */
    set Target(v) {
        this.target(v);
    }
    /**
     * Sets the `target` attribute of the component.
     * @param v The value to be set. Apart from a string `target` can also have the special values
     * `_self`, `_blank`, `_parent`, `_top` and `_unfencedTop`. `null` or an empty string removes
     * the attribute.
     * @returns This instance.
     */
    target(v) {
        this.attrib("target", v);
        return this;
    }
}
/**
 * 'Value' (string|number) getter/setter and set method returning this instance.\
 * __Notes:__
 * - This is a hybrid attribute: for some elements (mostly `input`) the type of `value` is `string`
 *   while for others the type is `number`.
 * - The attribute `Value` must be overridden by `input` elements of type `image` since `value`
 *   isn't avaliable for this type, so using `Value`/`value()` should do nothing.
 */
class ValueAttr extends AElementComponent {
    /**
     * Get/set the `value` attribute value of the component.
     */
    get Value() {
        return this._dom.value;
    }
    /** @inheritdoc */
    set Value(v) {
        this._dom.value = v;
    }
    /**
     * Get/set the `value` attribute value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    value(v) {
        this._dom.value = v;
        return this;
    }
}
// #endregion Attibutes
/////////////////////////////
/////////////////////////////
// #region Properties
/**
 * 'SelectionStart' getter/setter and set method returning this instance.
 */
class SelectionStartProp extends AElementComponent {
    /**
     * Get/set the `selectionStart` property value of the component.
     */
    get SelectionStart() {
        return this._dom.selectionStart;
    }
    /** @inheritdoc */
    set SelectionStart(v) {
        this.selectionStart(v);
    }
    /**
     * Set `selectionStart` property value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    selectionStart(v) {
        this._dom.selectionStart = v;
        return this;
    }
}
/**
 * 'SelectionEnd' getter/setter and set method returning this instance.
 */
class SelectionEndProp extends AElementComponent {
    /**
     * Get/set the `selectionEnd` property value of the component.
     */
    get SelectionEnd() {
        return this._dom.selectionEnd;
    }
    /** @inheritdoc */
    set SelectionEnd(v) {
        this.selectionEnd(v);
    }
    /**
     * Set `selectionEnd` property value of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    selectionEnd(v) {
        this._dom.selectionEnd = v;
        return this;
    }
}
// #endregion Properties
/////////////////////////////
/////////////////////////////
// #region Utility DOM components
/**
 * Option component (`<option>`).\
 * __Note:__ This class is part of `@vanilla-ts/core` and not of `@vanilla-ts/dom` because it is
 * used in the {@link DataListAttr} DOM property (to avoid cyclic package dependencies).
 */
class Option extends ElementComponentWithChildren {
    /**
     * Create Option component.
     * @param phrase The phrasing content for the `<option>` element. Due to the limited styling
     * capabilities of <option> elements, it is strongly recommended to use a text string text only.
     */
    constructor(...phrase) {
        super("option");
        phrase.length > 0 && this.phrase(...phrase);
    }
    /**
     * Get/set the `selected` attribute value of the component.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option#selected
     */
    get Selecetd() {
        return this._dom.selected;
    }
    /** @inheritdoc */
    set Selecetd(v) {
        this._dom.selected = v;
    }
    /**
     * Set `selected` attribute value of the component.
     * @param v The value to be set.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option#selected
     * @returns This instance.
     */
    selected(v) {
        this._dom.selected = v;
        return this;
    }
    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(this, (LabelAttr), (NativeDisabledAttr), (ValueAttr));
    }
}
// #endregion Utility DOM components
/////////////////////////////

/**
 * Text component (for DOM text nodes).
 */
class Text extends ANodeComponent {
    // @ts-expect-error ---
    #brand;
    /**
     * Create instance based on the `Text` interface.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Text
     * @param text The text for the text node. If `undefined` or omitted, the text content of the
     * node will be an empty string.
     */
    constructor(text) {
        super();
        this._dom = document.createTextNode(text ?? "");
    }
}

/**
 * A component (`<a>`).
 */
class A extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create A component.
     * @param href The `href` attribute for the `<a>` element.
     * @param children The content for the `<a>` element. If the length of `children` is `0`, the
     * content of the `<a>` element will be set to the value of `href`.
     */
    constructor(href, ...children) {
        super("a");
        this.href(href);
        children.length === 0
            ? this.append(new Text(href))
            : this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
    /**
     * Get/set `type` attribute value of underlying HTML element.
     */
    get Type() {
        return this.attr("type");
    }
    /** @inheritdoc */
    set Type(v) {
        this.type(v);
    }
    /**
     * Set `type` attribute of underlying HTML element.
     * @param v The `type` attribute to be set or `null` to remove the attribute.
     * @returns This instance.
     */
    type(v) {
        this.attrib("type", v);
        return this;
    }
    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(this, (DownloadAttr), (HrefAttr), (HreflangAttr), (PingAttr), (ReferrerPolicyAttr), (RelAttr), (TargetAttr));
    }
}

/**
 * Br component (`<br>`).
 */
class Br extends ElementComponentVoid {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Br component.
     */
    constructor() {
        super("br");
    }
}

/**
 * Button component (`<button>`).
 */
class Button extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Button component.
     * @param phrase The phrasing content for the `<button>` element.
     */
    constructor(...phrase) {
        super("button");
        phrase.length > 0 && this.phrase(...phrase);
    }
    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(this, (NameAttr), (NativeDisabledAttr), (ValueAttr));
    }
}
/**
 * Factory for `Button` components.
 */
class ButtonFactory extends ComponentFactory$1 {
    /**
     * Create, set up and return Button component.
     * @param phrase The phrasing content for the `<button>` element.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Button component.
     */
    button(phrase, data) {
        return this.setupComponent(!phrase
            ? new Button()
            : Array.isArray(phrase)
                ? new Button(...phrase)
                : new Button(phrase), data);
    }
    /**
     * Create, set up and return Button component. Identical to {@link button()}, but the class
     * name `regular` is added to the returned button.
     * @param phrase The phrasing content for the `<button>` element.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Button component (with the class name `regular` added).
     */
    buttonRegular(phrase, data) {
        return this.setupComponent((!phrase
            ? new Button()
            : Array.isArray(phrase)
                ? new Button(...phrase)
                : new Button(phrase)).addClass("regular"), data);
    }
    /**
     * Create, set up and return Button component. Identical to {@link button()}, but the class
     * names `regular` and `default` are added to the returned button.
     * @param phrase The phrasing content for the `<button>` element.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Button component (with the class name `regular` added).
     */
    buttonDefault(phrase, data) {
        return this.setupComponent((!phrase
            ? new Button()
            : Array.isArray(phrase)
                ? new Button(...phrase)
                : new Button(phrase)).addClass("regular", "default"), data);
    }
    /**
     * Create, set up and return Button component. Identical to {@link button()}, but the class
     * names `regular` and `warn` are added to the returned button.
     * @param phrase The phrasing content for the `<button>` element.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Button component (with the class name `regular` added).
     */
    buttonWarn(phrase, data) {
        return this.setupComponent((!phrase
            ? new Button()
            : Array.isArray(phrase)
                ? new Button(...phrase)
                : new Button(phrase)).addClass("regular", "warn"), data);
    }
}

/**
 * Code component (`<code>`).
 */
class Code extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Code component.
     * @param phrase The phrasing content for the `<code>` element.
     */
    constructor(...phrase) {
        super("code");
        phrase.length > 0 && this.phrase(...phrase);
    }
}

/**
 * Dialog component (`<dialog>`).
 */
let Dialog$1 = class Dialog extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()`) since this can cause problems
     * when centering or positioning the dialog relative to the viewport. If an instance of `Dialog`
     * is not mounted in another component, it is automatically added to `document.body` as a child
     * element in `show()`/`showModal()` and removed again in `close()`.
     * @param children The content for the `<dialog>` element.
     */
    constructor(...children) {
        super("dialog");
        this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
    /**
     * Get/set the `returnValue` property of the dialog.
     */
    get ReturnValue() {
        return this._dom.returnValue;
    }
    /** @inheritdoc */
    set ReturnValue(v) {
        this._dom.returnValue = v;
    }
    /**
     * Set the `returnValue` property of the dialog.
     * @param v The value to be set.
     * @returns This instance.
     */
    returnValue(v) {
        this._dom.returnValue = v;
        return this;
    }
    /**
     * Closes the dialog.
     * @param returnValue An updated value for the `returnValue` of the dialog.
     * @returns This instance.
     */
    close(returnValue) {
        this._dom.close(returnValue);
        if (!this.Parent) {
            this._dom.remove();
        }
        return this;
    }
    /**
     * Displays the dialog (non-modal).
     * @throws {DOMException} `DOMException.InvalidStateError` (if the dialog is already open and
     * modal).
     * @returns This instance.
     */
    show() {
        if (!this.Parent) {
            document.body.appendChild(this._dom);
        }
        this._dom.show();
        return this;
    }
    /**
     * Displays the dialog (modal).
     * @throws {DOMException} `DOMException.InvalidStateError` (if the dialog is already open and
     * non-modal).
     * @returns This instance.
     */
    showModal() {
        if (!this.Parent) {
            document.body.appendChild(this._dom);
        }
        this._dom.showModal();
        return this;
    }
    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(this, (OpenAttr));
    }
};

/**
 * Div component (`<div>`).
 */
class Div extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Div component.
     * @param children The content for the `<div>` element.
     */
    constructor(...children) {
        super("div");
        this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
}

/**
 * Abstract base class for all input and textarea elements that are based on a text field. This
 * class provides functions, that are to be added as mixins to input and textarea elements.\
 * __Note__: This class is ___not___ meant to be used as a base class for other components!
 */
class TextField extends AElementComponent {
    /**
     * Selects all text in the input/textarea element.
     * @returns This instance.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
     */
    select() {
        this._dom.select();
        return this;
    }
    /**
     * Replaces a range of text in an <input> or <textarea> element with a new string.
     * @param replacement The string to insert.
     * @param start The 0-based index of the first character to replace. Defaults to the current
     * selectionStart value (the start of the user's current selection).
     * @param end The 0-based index of the character after the last character to replace. Defaults
     * to the current selectionEnd value (the end of the user's current selection).
     * @param selectionMode A string defining how the selection should be set after the text has
     * been replaced. Possible values:
     * - `select` selects the newly inserted text.
     * - `start` moves the selection to just before the inserted text.
     * - `end` moves the selection to just after the inserted text.
     * - `preserve` attempts to preserve the selection. This is the default.
     * @returns This instance.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setRangeText
     */
    setRangeText(replacement, start, end, selectionMode) {
        this._dom.setRangeText(replacement, start, end, selectionMode);
        return this;
    }
    /**
     * Sets the start and end positions of the current text selection in an <input> or <textarea>
     * element.
     * @param start The 0-based index of the first character in the current selection.
     * @param end The 0-based index of the character after the last character in the current
     * selection.
     * @param direction The direction in which the selection is performed. Possible values are:
     * - `forward` (the selection starts at the start position and moves forward to the end
     *   position)
     * - `backward` (the selection starts at the end position and moves backward to the start
     *   position)
     * - `none` (the selection is collapsed at the start position). This is the default.
     * @returns This instance.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
     */
    setSelectionRange(start, end, direction) {
        this._dom.setSelectionRange(start, end, direction);
        return this;
    }
}

/**
 * Footer component (`<footer>`).
 */
class Footer extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Footer component.
     * @param children The content for the `<footer>` element.
     */
    constructor(...children) {
        super("footer");
        this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
}

/**
 * Header component (`<header>`).
 */
class Header extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Header component.
     * @param children The content for the `<header>` element.
     */
    constructor(...children) {
        super("header");
        this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
}

/**
 * Label component (`<label>`).
 */
class Label extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create `<label>` component.
     * @param for_ Content of the `for` attribute (single target ID or space separated target IDs).
     * @param phrase The phrasing content for the `<label>` element.
     */
    constructor(for_, ...phrase) {
        super("label");
        for_ && this.for(for_);
        phrase.length > 0 && this.phrase(...phrase);
    }
    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(this, (ForAttr));
    }
}

/**
 * List item component (`<li>`), mainly for unordered lists (`<ul>`) but also other types of lists
 * like, for example, menus (`<menu>`).
 */
class LiUl extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create LiUl component.
     * @param children The content for the `<li>` element.
     */
    constructor(...children) {
        super("li");
        this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
}

/**
 * Main component (`<main>`).
 */
class Main extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Main component.
     * @param children The content for the `<main>` element.
     */
    constructor(...children) {
        super("main");
        this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
}

/**
 * Navigation component Nav (`<nav>`).
 */
class Nav extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Nav component.
     * @param children The content for the `<nav>` element.
     */
    constructor(...children) {
        super("nav");
        this.append(...children.map(child => typeof child === "string" ? new Text(child) : child));
    }
}

/**
 * Paragraph component (`<p>`).
 */
class P extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create P component.
     * @param phrase The phrasing content for the `<p>` element.
     */
    constructor(...phrase) {
        super("p");
        phrase.length > 0 && this.phrase(...phrase);
    }
}

/**
 * Span component (`<span>`).
 */
class Span extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Span component.
     * @param phrase The phrasing content for the `<span>` element.
     */
    constructor(...phrase) {
        super("span");
        phrase.length > 0 && this.phrase(...phrase);
    }
}

/**
 * Strong component (`<strong>`).
 */
class Strong extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Strong component.
     * @param phrase The phrasing content for the `<strong>` element.
     */
    constructor(...phrase) {
        super("strong");
        phrase.length > 0 && this.phrase(...phrase);
    }
}

/**
 * Textarea component (`<textarea>`).
 */
class TextArea extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    _rows;
    _cols;
    /**
     * Create TextArea component.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the control.
     * @param cols The visible width of the text control, in average character widths.
     * @param id The id (attribute) of the textarea element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param name The `name` attribute for the textarea element.
     */
    constructor(text, rows, cols, id, name) {
        super("textarea");
        id === undefined
            ? this.id(cid())
            : id && this.id(id);
        name && this.name(name);
        this.rows(Math.max(rows ?? 2, 1))
            .cols(Math.max(cols ?? 20, 1));
        text && this.text(text);
    }
    /**
     * Get/set the `rows` attribute of the component.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#rows
     */
    get Rows() {
        return this._dom.rows;
    }
    /** @inheritdoc */
    set Rows(v) {
        this.rows(v);
    }
    /**
     * Set the `rows` attribute of the component.
     * @param v The value to be set.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#rows
     * @returns This instance.
     */
    rows(v) {
        this._dom.rows = Math.max(v, 1);
        return this;
    }
    /**
     * Get/set the `cols` attribute of the component.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#cols
     */
    get Cols() {
        return this._dom.cols;
    }
    /** @inheritdoc */
    set Cols(v) {
        this.cols(v);
    }
    /**
     * Set the `cols` attribute of the component.
     * @param v The value to be set.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#cols
     * @returns This instance.
     */
    cols(v) {
        this._dom.cols = Math.max(v, 1);
        return this;
    }
    /**
     * Get/set the `defaultValue` attribute of the component.
     */
    get DefaultValue() {
        return this._dom.defaultValue;
    }
    /** @inheritdoc */
    set DefaultValue(v) {
        this._dom.defaultValue = v;
    }
    /**
     * Set the `defaultValue` attribute of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    defaultValue(v) {
        this._dom.defaultValue = v;
        return this;
    }
    /**
     * Get/set the `wrap` attribute of the component.
     */
    get Wrap() {
        return this._dom.wrap;
    }
    /** @inheritdoc */
    set Wrap(v) {
        this._dom.wrap = v;
    }
    /**
     * Set the `wrap` attribute of the component.
     * @param v The value to be set.
     * @returns This instance.
     */
    wrap(v) {
        this._dom.wrap = v;
        return this;
    }
    static {
        /** Mixin additional DOM attributes/properties. */
        mixinDOMProperties(this, (AutocompleteAttr), (DirnameAttr), (MinMaxLengthAttr), (NameAttr), (PlaceholderAttr), (NativeDisabledAttr), (ReadonlyAttr), (RequiredAttr), (ValueAttr), (SelectionEndProp), (SelectionStartProp));
        /** Mixin `TextField` functionality. */
        mixin(false, this, (TextField));
    }
}

/**
 * Unordered list component Ul (`<ul>`).
 */
class Ul extends ElementComponentWithChildren {
    // @ts-expect-error ---
    #brand;
    /**
     * Create Ul component.
     * @param listItems Unordered list items to be appended to this list.
     */
    constructor(...listItems) {
        super("ul");
        listItems && this.append(...listItems.map(e => (e instanceof LiUl
            ? e
            : typeof e === "string" || e instanceof ANodeComponent
                ? new LiUl(e)
                : e)));
    }
}

/** Custom 'busy' event for BusyOverlays. */
class BusyOverlayBusyEvent extends ACustomComponentEvent {
    /**
     * Create 'busy' event.
     * @param sender The event emitter (always `BusyOverlay`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("busy", sender, undefined, customEventInitDict);
    }
}
/** Custom 'idle' event for BusyOverlays. */
class BusyOverlayIdleEvent extends ACustomComponentEvent {
    /**
     * Create 'idle' event.
     * @param sender The event emitter (always `BusyOverlay`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("idle", sender, undefined, customEventInitDict);
    }
}
/**
 * BusyOverlay is a component for displaying an overlay that indicates a 'busy-with-no-defined-end'
 * state. The overlay covers the complete viewport and prevents any user interaction with the UI
 * below. The usual use case is that the application does something that takes longer and needs to
 * be waited for. The component supports nested calls of `busy()` to facilitate use in scenarios
 * where multiple nested operations each want to signal longer execution times.\
 * __Notes:__
 * - Although the interface of `BusyOverlay` is that of a UI component, there is no need to
 *   mount/append instances of it to another component.
 * - Usually a single instance of `BusyOverlay` should be sufficient to be used in an application.
 * - The default visual indicator is an animated `Span` but `BusyOverlay` can also be given any
 *   other component to be shown when an application is 'busy'. Together with `AllowEscape` and the
 *   events that `BusyOverlay` dispatches when showing and hiding, this enables use cases other than
 *   just displaying a 'busy' state and blocking the user interface.
 */
class BusyOverlay extends AElementComponentWithInternalUI {
    _delay;
    _busyIndicator;
    defaultBusyIndicator = new Span();
    content;
    busyCount = 0;
    _allowEscape = false;
    /**
     * Create BusyOverlay component.
     * @param delay Set the default delay after which the overlay will be shown. See
     * function/property `delay()`/`Delay`. Default: `0`.
     * @param allowEscape `true`, if the `Esc` key can be used to hide the overlay, otherwise
     * `false`. See function/property `allowEscape()`/`AllowEscape`. Default: `false`.
     * @param busyIndicator A component which is displayed to visualize the 'busy' state. If
     * `undefined` an animated `Span` component is used by default.
     */
    constructor(delay = 0, allowEscape = false, busyIndicator) {
        super();
        super
            .initialize()
            .delay(delay)
            .allowEscape(allowEscape)
            .busyIndicator(busyIndicator);
    }
    /**
     * Get the current count of pending `busy()` calls.
     */
    get BusyCount() {
        return this.busyCount;
    }
    /**
     * Get/set the default delay after which the overlay will be shown.
     * @see {@link BusyOverlay.delay()}
     */
    get Delay() {
        return this._delay;
    }
    /** @inheritdoc */
    set Delay(v) {
        this.delay(v);
    }
    /**
     * Set the default delay after which the overlay will be shown.\
     * __Note__: The overlay is immediately inserted into the DOM so that the user interface does
     * not respond to any user interaction after `busy()` is called. The delay is used to set the
     * value for the CSS property `animation-delay`, which makes the overlay visible after `delay`
     * milliseconds.
     * @param delay A delay in milliseconds. Negative values will be set to `0`.
     * @returns This instance.
     */
    delay(delay) {
        this._delay = Math.max(0, delay);
        this.style("animationDelay", `${this._delay}ms`);
        return this;
    }
    /**
     * Enable/disable using the 'Esc' button to hide the overlay.
     * {@link BusyOverlay.allowEscape()}
     */
    get AllowEscape() {
        return this._allowEscape;
    }
    /** @inheritdoc */
    set AllowEscape(v) {
        this.allowEscape(v);
    }
    /**
     * Enable/disable using the 'Esc' button to hide the overlay. Setting this to `true` enables the
     * the user to hide the overlay by pressing the escape key.\
     * __Note:__ Pressing the `Esc` key calls `idle()` internally, so if several `busy()` calls have
     * already been executed, `Esc` must be pressed until the internal counter is back to `1` to
     * actually hide the overlay. `AllowEscape` is therefore rather intended to display an operation
     * that runs indefinitely with its own component (see `busyIndicator()`) and to give the user
     * the option of canceling this operation via `Esc`. The `BusyOverlayIdleEvent` event can be
     * used to detect, if the user wishes to cancel such an operation.
     * @param allowEscape `true`, if the `Esc` key can be used to hide the overlay, otherwise
     * `false`.
     * @returns This instance.
     */
    allowEscape(allowEscape) {
        this._allowEscape = allowEscape;
        return this;
    }
    /**
     * Get/set the component which is displayed to visualize the 'busy' state.
     * @see {@link BusyOverlay.busyIndicator()}
     */
    get BusyIndicator() {
        return this._busyIndicator;
    }
    /** @inheritdoc */
    set BusyIndicator(v) {
        this.busyIndicator(v);
    }
    /**
     * Set the component to be displayed to visualize the 'busy' state. By default an animated
     * `Span` component is used, but with `busyIndicator()` this can be changed to any other
     * component.
     * @param busyIndicator The component to be displayed to visualize the 'busy' state. If the
     * given value is undefined, the internal animated default `Span` component is used.\
     * __Notes:__
     * - No CSS is applied to the given component, this has to be done elsewhere.
     * - The component will be disposed of, if the `BusyOverlay` instance is disposed of, so in
     *   order to keep the component intact, `busyIndicator()` or `busyIndicator(undefined)` must
     *   be called before disposing of the `BusyOverlay` instance!
     * @returns This instance.
     */
    busyIndicator(busyIndicator) {
        this.content.remove();
        this._busyIndicator = busyIndicator;
        this.content.append(this._busyIndicator
            ? this._busyIndicator
            : this.defaultBusyIndicator);
        return this;
    }
    /**
     * Shows the busy overlay.\
     * __Notes:__
     * - In a synchronous context `busy()` must be awaited, otherwise the browser may not show the
     *   overlay immediately (or too late) due to DOM batching.
     * - Even if `busy()` is called multiple times, only one overlay is shown, so multiple calls
     *   in nested functions are possible.
     * - `BusyOverlay` maintains an internal counter for `busy()`/`idle()` calls. `busy()` only
     *   opens the overlay if the counter is `0` whereas `idle()` only closes the overlay if the
     *   counter is `1`. Therefore is it is very important that `busy()`/`idle()` should always be
     *   used in a `try/finally` context that calls `idle()` in the `finally` block!
     * - `busy()` dispatches a `BusyOverlayBusyEvent` that can be cancelled. If the event is
     *   cancelled `busy()` does nothing.
     * @param delay Temporarily overrides the current default delay (property `Delay`) for this
     * `busy()` call. The next call of `busy()` will use the default value again.
     * @example
     * ```
     * // Create an instance of `BusyOverlay`. It's perfectly valid to reuse this instance at
     * // different places.
     * const busyOverlay = new BusyOverlay(250);
     *
     * await busyOverlay.busy()
     * try {
     *   // `doSomeLengthyOperation()` could also call `busy()`/`idle()` in a similar way (i.e. in
     *   // a `try/finally` context).
     *   doSomeLengthyOperation()
     * } finally {
     *   busyOverlay.idle();
     * }
     * ```
     */
    async busy(delay) {
        if (this.dispatch(new BusyOverlayBusyEvent(this))) {
            this.busyCount++;
            if (this.busyCount === 1) {
                if (!this.Parent) {
                    document.body.appendChild(this.DOM);
                }
                delay !== undefined && this.style("animationDelay", `${Math.max(0, delay)}ms`);
                this.ui.showModal();
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
    }
    /**
     * Hide the busy overlay. Depending on the number of previous `busy()` calls, `idle()` may have
     * to be called multiple times before the overlay is actually hidden. If the overlay isn't
     * showing (`BusyCount` is `0`), `idle()` does nothing and also does not dispatch an
     * `BusyOverlayIdleEvent` event.
     */
    idle() {
        if (this.busyCount !== 0 && this.dispatch(new BusyOverlayIdleEvent(this))) {
            this.busyCount--;
            if (this.busyCount === 0) {
                this.ui.close();
                if (!this.Parent) {
                    this.DOM.remove();
                }
                this.delay(this._delay);
            }
        }
    }
    /**
     * If, for whatever reason, the chain of `busy()`/`idle()` pairs is interrupted so that the
     * internal counter is not equal to `0`, `reset()` can be called. `reset()` closes the overlay
     * and sets the internal counter to `0`. No `BusyOverlayIdleEvent` is dispatched.
     */
    reset() {
        this.ui.close();
        if (!this.Parent) {
            this.DOM.remove();
        }
        this.delay(this._delay);
        this.busyCount = 0;
    }
    /**
     * Build UI of the component.
     * @returns This instance.
     */
    buildUI() {
        this.defaultBusyIndicator = new Span().addClass("busy-indicator");
        this.ui = new Dialog$1()
            .append(this.content = new Div().addClass("content"))
            .on("keydown", (ev) => {
            switch (ev.key) {
                case "Escape":
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                    if (this._allowEscape) {
                        this.idle();
                    }
                    break;
                case "Tab":
                    // Keep focus inside the overlay.
                    !ev.ctrlKey
                        && !ev.altKey
                        && !ev.metaKey
                        && tabKeyFocusCycle(this.DOM, ev);
                    break;
                default:
                    return;
            }
        });
        return this;
    }
    /** @inheritdoc */
    dispose() {
        this.ui.close();
        this.busyCount = 0;
        // The default indicator can be mounted or not, => dispose of manually.
        this.content.remove(this.defaultBusyIndicator);
        this.defaultBusyIndicator.dispose();
        super.dispose();
    }
}
/**
 * Factory for `BusyOverlay` components.
 */
class BusyOverlayFactory extends ComponentFactory$1 {
    /**
     * Create, set up and return BusyOverlay component.
     * @param delay Set the default delay after which the overlay will be shown. See
     * function/property `delay()`/`Delay`.
     * @param allowEscape `true`, if the `Esc` key can be used to hide the overlay, otherwise
     * `false`.
     * @param busyIndicator A component which is displayed to visualize the 'busy' state. If
     * `undefined` an animated `Span` component is used by default.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns BusyOverlay component.
     */
    busyOverlay(delay = 0, allowEscape = false, busyIndicator, data) {
        return this.setupComponent(new BusyOverlay(delay, allowEscape, busyIndicator), data);
    }
}

/**
 * IconButton component to display buttons with icons and/or text. The component consists of three
 * inner parts:
 * - A `Span` component at the logical start side of the button (on the left side in 'ltr'
 *   direction, otherwise on right side; with a vertical layout the component is placed at the top
 *   side).
 * - A `Span` component containing the phrasing content of the button.
 * - A `Span` component at the logical end side of the button (on the right side in 'ltr' direction,
 *   otherwise on left side; with a vertical layout the component is placed at the bottom side).
 *
 * The intended use of this component is that the icons (part one and three) are styled by
 * background images or (preferably) with an icon font like 'Material Icons'. In both cases the icon
 * button options are used to set the respective identifier for the icon, so styling should be easy.
 * For both icon spans (part one and three) the following rules apply:
 * - If the value of `IconStart`/`IconEnd` is an empty string or null, the current text content
 *   _and_ the class name of the `Span` component are _removed_. __Note:__ This also sets the class
 *   `empty` on the respective span element!
 * - If the value of `IconStart`/`IconEnd` begins with `-` (minus), the current text content of the
 *   `Span` component is removed and its class name is set to `<value>.substring(1)`, e.g.
 *   `-some-class` results in the class name `some-class`.
 *
 * __Further notes:__
 * - Any component in the array `Caption` of an icon button options object will be disposed of if
 *   the icon button is disposed of!
 * - The properties/functions `Phrase`/`Rephrase`/`phrase()`/`rephrase()` only affect the span
 *   component containing the phrasing content of the button (part two). See the corresponding
 *   properties and functions in `IElementWithChildrenComponent` in `@vanilla-ts/core`.
 * - The styling in `themes/vts/IconButton.css` is very generic and only handles the basic layout.
 * @see {@link IconButtonOptions}
 */
class IconButton extends AElementComponentWithInternalUI {
    _options = {};
    btnPhrase;
    spanStart;
    spanEnd;
    /**
     * Utility function that merges icon button options into existing icon button options. The
     * result contains always _all_ possible members of `IconButtonOptions`. The following rules
     * apply:
     * - A property of `from` that is not equal to `undefined` will replace/create the respective
     * property in `to`.
     * - A property that does exist in `to` but not in `from` remains untouched.
     * - A property that doesn't exist in `from` nor `to`  will be set to its default value in `to`.
     * @param from An object with icon button options that are to be merged into existing options.
     * If `from` is `undefined` or an empty object, `to` will remain untouched, except for missing
     * properties in `to` which will be set to their default values.
     * @param to An object into which the properties from the object `from` are to be merged. If
     * `to` is `undefined`, a _new_ object is returned, otherwise `to` is retained and updated with
     * the properties from the object `from`.
     * @returns An object with complete icon button options. If `to` is `undefined`, this is a _new_
     * object, otherwise the modified object `to` is returned.
     */
    static mergeOptionsFromTo(from, to) {
        const result = to ?? {};
        result.IconStart = from?.IconStart !== undefined ? from.IconStart : to?.IconStart ?? null;
        result.IconEnd = from?.IconEnd !== undefined ? from.IconEnd : to?.IconEnd ?? null;
        result.Caption = from?.Caption !== undefined ? [...from.Caption] : to?.Caption ?? [];
        result.Title = from?.Title !== undefined ? from.Title : to?.Title ?? null;
        result.Horizontal = from?.Horizontal !== undefined ? from.Horizontal : to?.Horizontal ?? true;
        return result;
    }
    /**
     * Create IconButton component.
     * @param options The options for the icon button.
     * @see {@link IconButtonOptions}
     */
    constructor(options) {
        super();
        super
            .initialize()
            .options(options ?? {});
    }
    /** @inheritdoc */
    disabled(disabled) {
        // Uses the `NativeDisabled` property of `Button`.
        this.ui.disabled(disabled);
        return super.disabled(disabled);
    }
    /**
     * Get/set the icon button options. The returned object is a _copy_, modifying this copy has no
     * effect on the corresponding icon button instance.
     */
    get Options() {
        return {
            ...this._options,
            Caption: [...this._options.Caption] // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    set Options(v) {
        this.options(v);
    }
    /**
     * Sets the options for the icon button. See also the documentation for `IconButtonOptions`.
     * @param options The new icon button options.
     * @returns This instance.
     */
    options(options) {
        IconButton.mergeOptionsFromTo(options, this._options);
        return this
            .setIcon(this._options.IconStart, true)
            .rephrase(...this._options.Caption)
            .setIcon(this._options.IconEnd, false)
            .title(this._options.Title)
            .setSingleIcon()
            .removeClass("horizontal", "vertical")
            .addClass(this._options.Horizontal ? "horizontal" : "vertical");
    }
    /**
     * @inheritdoc
     * @see {@link IElementWithChildrenComponent.Phrase}
     */
    get Phrase() {
        throw new Error("'Phrase' is a writeonly property.");
    }
    /**
     * @inheritdoc
     * @see {@link IElementWithChildrenComponent.Phrase}
     */
    set Phrase(phrase) {
        this.btnPhrase.Phrase = phrase;
    }
    /**
     * @inheritdoc
     * @see {@link IElementWithChildrenComponent.phrase()}
     */
    phrase(...phrase) {
        this.btnPhrase.phrase(...phrase);
        return this.setSingleIcon();
    }
    /**
     * @inheritdoc
     * @see {@link IElementWithChildrenComponent.Rephrase}
     */
    get Rephrase() {
        throw new Error("'Rephrase' is a writeonly property.");
    }
    /**
     * @inheritdoc
     * @see {@link IElementWithChildrenComponent.Rephrase}
     */
    set Rephrase(phrase) {
        this.btnPhrase.Rephrase = phrase;
    }
    /**
     * @inheritdoc
     * @see {@link IElementWithChildrenComponent.rephrase()}
     */
    rephrase(...phrase) {
        this.btnPhrase.rephrase(...phrase);
        return this.setSingleIcon();
    }
    /**
     * Set the identifier for the icon at the logical start or end side of the button.
     * @param v The identifier for the logical inner start or end `Span` componnent of the button.
     * - If `v` is an empty string or null, the current text content and the class name of the
     *   `Span` component are removed.
     * - If `v` begins with `-` (minus), the current text content of the `Span` component is removed
     *   and its class name is set to `v.substring(1)`, e.g. `-some-class` results in the class name
     *   `some-class`.
     * @param atStart `true` for the logical start icon, `false` for the logical end icon.
     * @returns This instance.
     */
    setIcon(v, atStart) {
        v = v === null ? null : v.trim() || null;
        const icon = atStart
            ? this.spanStart
            : this.spanEnd;
        const hasDisabled = icon.hasClass("disabled");
        const hasParentDisabled = icon.hasClass("parent-disabled");
        icon.text(v === null || v.startsWith("-")
            ? null
            : v).clazz(v === null
            ? null
            : v.startsWith("-")
                ? v.substring(1)
                : v).addClass(atStart ? "start" : "end", hasDisabled ? "disabled" : undefined, hasParentDisabled ? "parent-disabled" : undefined, v === null ? "empty" : undefined);
        return this;
    }
    /**
     * Set or unset the `single-icon` CSS class according to the current icon button options. The
     * `single-icon` class is set if either `IconStart` or `IconEnd` is set, but not both, and the
     * `Caption` is empty.
     * @returns This instance.
     */
    setSingleIcon() {
        this.removeClass("single-icon");
        if (((this._options.IconStart && !this._options.IconEnd)
            || (!this._options.IconStart && this._options.IconEnd))
            && ((this.btnPhrase.Text ?? "").trim() === "")) {
            this.addClass("single-icon");
        }
        return this;
    }
    /** @inheritdoc */
    buildUI() {
        this.ui = new Button()
            .append(this.spanStart = new Span().style("order", "1").addClass("start"), this.btnPhrase = new Span().style("order", "2").addClass("phrase"), this.spanEnd = new Span().style("order", "3").addClass("end"));
        return this;
    }
    static {
        /**
         * Mixin additional DOM attributes. Required because `IconButton` is actually just a
         * `Button` (with additional child components).
         */
        mixinDOMProperties(this, (NameAttr), 
        // !! Handled by `public override disabled()`
        // NativeDisabledAttr<HTMLButtonElement>,
        (ValueAttr));
    }
}

/**
 * Apperance of the disclosure container.
 */
var DisclosureContainerAppearance;
(function (DisclosureContainerAppearance) {
    // START = left in `ltr` direction and right in `rtl` direction.
    // END = right in `ltr` direction and left in `rtl` direction.
    DisclosureContainerAppearance[DisclosureContainerAppearance["TOP_START"] = 0] = "TOP_START";
    DisclosureContainerAppearance[DisclosureContainerAppearance["TOP_END"] = 1] = "TOP_END";
    DisclosureContainerAppearance[DisclosureContainerAppearance["END_TOP"] = 2] = "END_TOP";
    DisclosureContainerAppearance[DisclosureContainerAppearance["END_BOTTOM"] = 3] = "END_BOTTOM";
    DisclosureContainerAppearance[DisclosureContainerAppearance["BOTTOM_END"] = 4] = "BOTTOM_END";
    DisclosureContainerAppearance[DisclosureContainerAppearance["BOTTOM_START"] = 5] = "BOTTOM_START";
    DisclosureContainerAppearance[DisclosureContainerAppearance["START_BOTTOM"] = 6] = "START_BOTTOM";
    DisclosureContainerAppearance[DisclosureContainerAppearance["START_TOP"] = 7] = "START_TOP";
})(DisclosureContainerAppearance || (DisclosureContainerAppearance = {}));
/** Custom 'disclose' event for disclosure containers. */
class DiscloseEvent extends ACustomComponentEvent {
    /**
     * Create DiscloseEvent event.
     * @param sender The event emitter (always `DisclosureContainer`).
     * @param disclosed `true`, if the DisclosureContainer was disclosed, otherwise `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, disclosed, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("disclose", sender, { Disclosed: disclosed }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/**
 * Container whose content can be disclosed/undisclosed.
 */
class DisclosureContainer extends AElementComponentWithInternalUI {
    _initialized = false;
    headerContainer;
    _disclosureButton;
    headerContent;
    contentContainer;
    _weakUndisclosed;
    _disclosed;
    disclosedBtnOptions = {};
    undisclosedBtnOptions = {};
    _appearance;
    vertical;
    _animatable = false;
    fncOnTransitionEnd = this.onTransitionEnd.bind(this);
    /**
     * Creates DisclosureContainer component.
     * @param header The header content (components or string). In the case of a single string, the
     * header content is a `Span` component with the string as the content. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param content The content components for the disclosure container. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param disclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _disclosed_ state. Default: `{ Caption: ["-"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param undisclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _undisclosed_ state. Default: `{ Caption: ["+"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param disclosed `true`, if the initial state of the disclosure container is 'disclosed',
     * otherwise `false`. Default: `true`.
     * @param weakUndisclosed There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the class names mentioned above) by _removing/adding_ the
     *   inner content container from/to the internal DOM.
     * If `weakUndisclosed` is `true`, only the mentioned class names are set and the inner content
     * container will be left as is (mounted). If `weakUndisclosed` is `false`, the inner content
     * container will be _removed/added_ from/to the internal DOM.\
     * `weakUndisclosed` can help to animate the states `disclosed`/`undisclosed`. Default: `false`.
     * @param appearance The disclosure container appearance (header position and orientation).
     * @param animatable `true`, to enable animations on disclosed state changes.\
     * __Note:__ If `animated` is `true`, `weakUndisclosed` must also be `true`!\
     *  Default: `false`.
     */
    constructor(header, content, disclosedBtnOptions = { Caption: ["-"] }, // eslint-disable-line jsdoc/require-jsdoc
    undisclosedBtnOptions = { Caption: ["+"] }, // eslint-disable-line jsdoc/require-jsdoc
    disclosed = true, weakUndisclosed = false, appearance = DisclosureContainerAppearance.TOP_START, animatable = false) {
        super();
        super.initialize()
            .disclosedButtonOptions(disclosedBtnOptions)
            .undisclosedButtonOptions(undisclosedBtnOptions)
            .appearance(appearance)
            .weakUndisclosed(weakUndisclosed)
            .animatable(animatable)
            .disclosed(disclosed)
            .header(header)
            .append(...(Array.isArray(content)
            ? content
            : [content]).map(e => typeof e === "string" ? new Text(e) : e));
        if (this._animatable && this._disclosed) {
            this.contentContainer.style({ "width": null, "height": null }); // eslint-disable-line jsdoc/require-jsdoc
        }
        this._initialized = true;
    }
    /**
     * Only for special purposes: Get the disclosure button component.
     * @see {@link IconButton}
     */
    get DisclosureButton() {
        return this._disclosureButton;
    }
    /**
     * Access the internal `IconButton` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `IconButton` component instance and
     * this instance as parameters.
     * @returns This instance.
     */
    disclosureButton(cb) {
        cb(this._disclosureButton, this);
        return this;
    }
    /**
     * Get/set the options for the disclosure button in _disclosed_ state. Returns a _copy_ of the
     * current options. Modifying this object has no effect except for the case where components in
     * `Caption` are accessed and modified (which should be avoided!).
     */
    get DisclosedButtonOptions() {
        return {
            ...this.disclosedBtnOptions,
            Caption: [...this.disclosedBtnOptions.Caption] // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    set DisclosedButtonOptions(v) {
        this.disclosedButtonOptions(v);
    }
    /**
     * Set the options for the disclosure button in _disclosed_ state.
     * @param v The new icon button options.
     * @returns This instance.
     */
    disclosedButtonOptions(v) {
        IconButton.mergeOptionsFromTo(v, this.disclosedBtnOptions);
        this._disclosed && this._disclosureButton.options(this.disclosedBtnOptions);
        return this;
    }
    /**
     * Get/set the options for the disclosure button in _undisclosed_ state. Returns a _copy_ of the
     * current options. Modifying this object has no effect except for the case where components in
     * `Caption` are accessed and modified (which should be avoided!).
     */
    get UndisclosedButtonOptions() {
        return {
            ...this.undisclosedBtnOptions,
            Caption: [...this.undisclosedBtnOptions.Caption] // eslint-disable-line jsdoc/require-jsdoc
        };
    }
    /** @inheritdoc */
    set UndisclosedButtonOptions(v) {
        this.undisclosedButtonOptions(v);
    }
    /**
     * Set the options for the disclosure button in _undisclosed_ state.
     * @param v The new icon button options.
     * @returns This instance.
     */
    undisclosedButtonOptions(v) {
        IconButton.mergeOptionsFromTo(v, this.undisclosedBtnOptions);
        !this._disclosed && this._disclosureButton.options(this.undisclosedBtnOptions);
        return this;
    }
    /**
     * Get the container component, that holds the header content (excluding the disclosure button).
     */
    get Header() {
        return this.headerContent;
    }
    /**
     * Get the container component, that holds the content of the disclosure container.\
     * __Note:__ This property __must not be used to add/remove/... components__, instead use the
     * respective functions of `DisclosureContainer` itself! `Content` should only be used for
     * styling or other (readonly) purposes!
     */
    get Content() {
        return this.contentContainer;
    }
    /**
     * Set new content for the header (the disclosure button is retained). Setting new content for
     * the header _disposes the former content if `extractTo is `undefined`_!
     * @param header The new header content (components or string). In the case of a string, the
     * header content is a `Span` component with the string as the content. If `undefined` or an
     * empty array, the header is emptied.
     * @param extractTo An array, that, if given, will receive the former header component(s).
     * @returns This instance.
     */
    header(header, extractTo) {
        extractTo
            ? this.headerContent.extract(extractTo)
            : this.headerContent.clear();
        this.headerContent.removeClass("header-text");
        this.headerContent.append(...(Array.isArray(header)
            ? header
            : [typeof header === "string" ? new Span(header).addClass("header-text") : header]).map(e => typeof e === "string" ? new Text(e) : e));
        return this;
    }
    /**
     * Get/set the disclosed state.
     */
    get Disclosed() {
        return this._disclosed;
    }
    /** @inheritdoc */
    set Disclosed(v) {
        this.disclosed(v);
    }
    /**
     * Disclose/undisclose this component.
     * @param disclosed `true`, if the state of the disclosure container shall be 'disclosed',
     * otherwise `false`.
     * @returns This instance.
     */
    disclosed(disclosed) {
        if (disclosed !== this._disclosed) {
            if (!this.dispatch(new DiscloseEvent(this, disclosed))) {
                return this;
            }
            this._disclosed = disclosed;
            this._initialized && this._animatable && this.supportAnimation();
            if (this._disclosed) {
                this
                    .removeClass("undisclosed")
                    .addClass("disclosed");
                this._disclosureButton.options(this.disclosedBtnOptions);
                this._weakUndisclosed || this.ui.append(this.contentContainer);
            }
            else {
                this
                    .removeClass("disclosed")
                    .addClass("undisclosed");
                this._disclosureButton.options(this.undisclosedBtnOptions);
                this._weakUndisclosed || this.ui.remove(this.contentContainer);
            }
        }
        return this;
    }
    /**
     * Toggle the `Disclosed` state of this this component.
     * @returns This instance.
     */
    toggleDisclosed() {
        this.disclosed(!this.Disclosed);
        return this;
    }
    /**
     * Get/set the 'weak undisclosed' property.
     * @see {@link DisclosureContainer.weakUndisclosed()}
     */
    get WeakUndisclosed() {
        return this._weakUndisclosed;
    }
    /** @inheritdoc */
    set WeakUndisclosed(v) {
        this.weakUndisclosed(v);
    }
    /**
     * Set the 'weak undisclosed' property.
     * @param weak There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the class names mentioned above) by _removing/adding_ the
     *   inner content container from/to the internal DOM.
     * If `weak` is `true`, only the mentioned class names are set and the inner content container
     * will be left as is (mounted). If `weak` is `false`, the inner content container will be
     * _removed/added_ from/to the internal DOM.
     *
     * __Note:__ `WeakUndisclosed` must also be `true` for the disclosure container to be
     * {@link animatable}. If `WeakUndisclosed` is set to `false` the property `Animatable`
     * will automatically be set to `false` as well!
     * @returns This instance.
     */
    weakUndisclosed(weak) {
        if (this._weakUndisclosed !== weak) {
            this._weakUndisclosed = weak;
            if (this._weakUndisclosed) {
                this.addClass("weak");
            }
            else {
                this.animatable(false);
                this.removeClass("weak");
            }
            if (!this.Disclosed) {
                this._weakUndisclosed
                    ? this.ui.append(this.contentContainer)
                    : this.ui.remove(this.contentContainer);
            }
        }
        return this;
    }
    /**
     * Get/set the appearance of the disclosure container.
     */
    get Appearance() {
        return this._appearance;
    }
    /** @inheritdoc */
    set Appearance(v) {
        this.appearance(v);
    }
    /**
     * Sets the appearance of the disclosure container.
     * @param appearance The new appearance. `BOTTOM_RIGHT`, for example, should set the header to
     * the bottom and the disclosure button to the right.
     * @returns This instance.
     */
    appearance(appearance) {
        if (this._appearance !== appearance) {
            const wasVertical = this.vertical;
            this._appearance = appearance;
            let clazz;
            switch (this._appearance) {
                case DisclosureContainerAppearance.TOP_START:
                    clazz = "top-start";
                    break;
                case DisclosureContainerAppearance.TOP_END:
                    clazz = "top-end";
                    break;
                case DisclosureContainerAppearance.END_TOP:
                    clazz = "end-top";
                    break;
                case DisclosureContainerAppearance.END_BOTTOM:
                    clazz = "end-bottom";
                    break;
                case DisclosureContainerAppearance.BOTTOM_START:
                    clazz = "bottom-start";
                    break;
                case DisclosureContainerAppearance.BOTTOM_END:
                    clazz = "bottom-end";
                    break;
                case DisclosureContainerAppearance.START_TOP:
                    clazz = "start-top";
                    break;
                case DisclosureContainerAppearance.START_BOTTOM:
                    clazz = "start-bottom";
                    break;
                default:
                    clazz = "top-start";
                    break;
            }
            this.vertical = ![
                DisclosureContainerAppearance.START_TOP,
                DisclosureContainerAppearance.START_BOTTOM,
                DisclosureContainerAppearance.END_TOP,
                DisclosureContainerAppearance.END_BOTTOM
            ].includes(this._appearance);
            this.ui
                .removeClass("vertical", "horizontal", "top-start", "top-end", "end-top", "end-bottom", "bottom-start", "bottom-end", "start-top", "start-bottom")
                .addClass(clazz, this.vertical ? "vertical" : "horizontal");
            if (wasVertical !== this.vertical && !this._disclosed && this._animatable) {
                this.removeClass("animatable");
                this.contentContainer.style({ "width": null, "height": null }); // eslint-disable-line jsdoc/require-jsdoc
                this.supportAnimation();
                this.addClass("animatable");
            }
        }
        return this;
    }
    /**
     * Enable/disable disclosure animations on the disclosure container.
     */
    get Animatable() {
        return this._animatable;
    }
    /** @inheritdoc */
    set Animatable(v) {
        this.animatable(v);
    }
    /**
     * Enable/disable disclosure animations on the disclosure container.
     * @param animatable `true`, if the disclosure container is animatable, otherwise `false`.\
     * __Note:__ If `Animatable` is set to `true`, `WeakUndisclosed` will automatically be set to
     * `true` as well!
     * @returns This instance.
     */
    animatable(animatable) {
        if (this._animatable !== animatable) {
            this._animatable = animatable;
            if (this._animatable) {
                this.weakUndisclosed(true);
                this._disclosed || this.supportAnimation();
                this.contentContainer.on("transitionend", this.fncOnTransitionEnd);
                this.addClass("animatable");
            }
            else {
                this.contentContainer.off("transitionend", this.fncOnTransitionEnd);
                this.removeClass("animatable");
                this.contentContainer.style({ "height": null, "width": null }); // eslint-disable-line jsdoc/require-jsdoc
            }
        }
        return this;
    }
    /**
     * Removes (_and disposes of_) all children from the disclosure container (except the header).
     * @returns This instance.
     */
    clearContent() {
        const extracted = [];
        this.extract(extracted);
        for (const component of extracted) {
            component.dispose();
        }
        return this;
    }
    /**
     * Support disclosure/undisclosure animations by setting the needed size.
     */
    supportAnimation() {
        const el = this.contentContainer.DOM;
        const size = this.vertical
            ? el.scrollHeight + "px"
            : el.scrollWidth + "px";
        const prop = this.vertical
            ? "height"
            : "width";
        el.style[prop] = size;
        // A variant of the hack shown in https://codepen.io/Sormano/pen/PReMjZ (forcibly prevent
        // render skipping, here without modifying any style).
        this.vertical
            ? el.style.setProperty("", el.scrollHeight + "")
            : el.style.setProperty("", el.scrollWidth + "");
        el.style[prop] = this._disclosed ? size : "0px";
    }
    /**
     * Removes the corresponding property after a width/heigth transitions.
     * @param ev The transition event.
     */
    onTransitionEnd(ev) {
        if (this._disclosed && ev.target === this.contentContainer.DOM) {
            ev.propertyName === "height"
                ? this.contentContainer.style("height", null)
                : ev.propertyName === "width" && this.contentContainer.style("width", null);
        }
    }
    /** @inheritdoc */
    clearOwner() {
        // Dispose of all components in the two disclosure button options.
        this._disclosureButton.rephrase();
        this.disclosedBtnOptions.Caption.forEach(e => typeof e === "string" || e.dispose());
        this.undisclosedBtnOptions.Caption.forEach(e => typeof e === "string" || e.dispose());
        // The content container is always cleared due to the `AChildren` mixin, but it is not
        // disposed of if it is not mounted. This is the case if `_weakUndisclosed` is `false` _and_
        // the `DisclosureContainer` instance is undisclosed.
        this.ui.contains(this.contentContainer) || this.contentContainer.dispose();
        super.clearOwner();
    }
    /**
     * Build UI of the component.
     * @returns This instance.
     */
    buildUI() {
        this.ui = new Div()
            .append(this.headerContainer = new Div()
            .addClass("header-container")
            .append(this._disclosureButton = new IconButton()
            .addClass("disclose", IconButton.DefaultCSSClassName)
            .on("click", () => this.disclosed(!this.Disclosed)), this.headerContent = new Div()
            .addClass("header-content")
        // Support toggling by clicking anywhere on the header content.
        // .on("pointerup", (_ev: PointerEvent) => this.toggleDisclosed()),
        ), this.contentContainer = new Div()
            .addClass("content-container"));
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }
    /** @inheritdoc */
    dispose() {
        this._animatable && this.contentContainer.off("transitionend", this.fncOnTransitionEnd);
        super.dispose();
    }
    static {
        /** Mixin the IChildren implementation (which targets `this.contentContainer`). */
        mixin(false, this, AChildren);
    }
}
/**
 * Factory for `DisclosureContainer` components.
 */
class DisclosureContainerFactory extends ComponentFactory$1 {
    /**
     * Create, set up and return DisclosureContainer component.
     * @param header The header content (components or string). In the case of a single string, the
     * header content is a `Span` component with the string as the content. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param content The content components for the disclosure container. In the case of an array,
     * every string element in the array is converted to a `Text` component. If `undefined` or an
     * empty array, the header is empty.
     * @param disclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _disclosed_ state. Default: `{ Caption: ["-"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param undisclosedBtnOptions The options for the disclosure button (`IconButton`) if the
     * disclosure container is in _undisclosed_ state. Default: `{ Caption: ["+"] }`.\
     * __Note:__ When the disclosure container is disposed of it will also dispose of any component
     * that is found in the array `Caption`! If the components in this array are to be retained, new
     * empty options must be set first before the disclosure container is disposed of.
     * @param disclosed `true`, if the initial state of the disclosure container is 'disclosed',
     * otherwise `false`. Default: `true`.
     * @param weakUndisclosed There are two ways of 'hiding'/'unhiding' the inner content container:
     * - by pure CSS, e.g. only the class names `disclosed`/`undisclosed` are set
     * - and (additionally to setting the class names mentioned above) by _removing/adding_ the
     *   inner content container from/to the internal DOM.
     * If `weakUndisclosed` is `true`, only the mentioned class names are set and the inner content
     * container will be left as is (mounted). If `weakUndisclosed` is `false`, the inner content
     * container will be _removed/added_ from/to the internal DOM.\
     * `weakUndisclosed` can help to animate the states `disclosed`/`undisclosed`. Default: `false`.
     * @param appearance The disclosure container appearance (header position and orientation).
     * @param animatable `true`, to enable animations on disclosed state changes.\
     * __Note:__ If `animated` is `true`, `weakUndisclosed` must also be `true`!\
     *  Default: `false`.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns DisclosureContainer component.
     */
    disclosureContainer(header, content, disclosedBtnOptions = { Caption: ["-"] }, // eslint-disable-line jsdoc/require-jsdoc
    undisclosedBtnOptions = { Caption: ["+"] }, // eslint-disable-line jsdoc/require-jsdoc
    disclosed = true, weakUndisclosed = false, appearance = DisclosureContainerAppearance.TOP_START, animatable = false, data) {
        return this.setupComponent(new DisclosureContainer(header, content, disclosedBtnOptions, undisclosedBtnOptions, disclosed, weakUndisclosed, appearance, animatable), data);
    }
}

/**
 * Position of the label.
 */
var LabelPosition;
(function (LabelPosition) {
    LabelPosition[LabelPosition["TOP"] = 1] = "TOP";
    LabelPosition[LabelPosition["END"] = 2] = "END";
    LabelPosition[LabelPosition["BOTTOM"] = 3] = "BOTTOM";
    LabelPosition[LabelPosition["START"] = 4] = "START";
})(LabelPosition || (LabelPosition = {}));
/**
 * Alignment of the label.
 */
var LabelAlignment;
(function (LabelAlignment) {
    LabelAlignment[LabelAlignment["START"] = 1] = "START";
    LabelAlignment[LabelAlignment["CENTER"] = 2] = "CENTER";
    LabelAlignment[LabelAlignment["END"] = 3] = "END";
})(LabelAlignment || (LabelAlignment = {}));
/**
 * Abstract base class for building labeled components that have a descriptive label or span
 * element. The label element itself is a compoment (`Label` or `Span`) so it can be used to display
 * styled text with, for example, `Span`, `Em` and other components appended to it.
 */
class LabeledComponent extends AElementComponentWithInternalUI {
    #initialized = false;
    _label;
    // This member exists only to temporarily store the value given to the contructor to be
    // available in `initialize()`. It will be set to `undefined` again after `initialize()`.
    #labelPhrase;
    lblPosition;
    lblAlignment;
    _component;
    /* The class name which should be set on the label/span of the labeled component. */
    static LCLabelClassname = "lc-label";
    /* The class name which should be set on the component of the labeled component. */
    static LCComponentClassname = "lc-component";
    /**
     * Create LabeledComponent component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase, lblPosition = LabelPosition.START, lblAlignment = LabelAlignment.START) {
        super();
        this.#labelPhrase = labelPhrase;
        this.lblPosition = lblPosition;
        this.lblAlignment = lblAlignment;
    }
    /** @inheritdoc */
    initialize(mountUI, ...args) {
        super
            .initialize(mountUI, ...args) // eslint-disable-line @typescript-eslint/no-unsafe-argument
            .labelPosition(this.lblPosition)
            .labelAlignment(this.lblAlignment);
        Array.isArray(this.#labelPhrase)
            ? this._label.phrase(...this.#labelPhrase)
            : this._label.phrase(this.#labelPhrase);
        this.#labelPhrase = undefined;
        this.#initialized = true;
        return this;
    }
    /**
     * Get component that is enclosed.
     */
    get Component() {
        return this._component;
    }
    /**
     * Access the internal component via a callback function. Useful for seamless chaining when
     * creating instances of this component.
     * @param cb A callback function that receives the current component instance and this instance
     * as parameters.
     * @returns This instance.
     */
    component(cb) {
        cb(this._component, this);
        return this;
    }
    /**
     * Get label component.
     */
    get Label() {
        return this._label;
    }
    /**
     * Access the internal label component via a callback function. Useful for seamless chaining
     * when creating instances of this component.
     * @param cb A callback function that receives the current label component instance and this
     * instance as parameters.
     * @returns This instance.
     */
    label(cb) {
        cb(this._label, this);
        return this;
    }
    /**
     * Set the phrasing content of the components label. __The setter `LabelPhrase` here is an alias
     * for the property `this.Label.Phrase`.__
     */
    set LabelPhrase(phrase) {
        this._label.Phrase = phrase;
    }
    /**
     * Set the phrasing content of the the components label. __The function `labelPhrase()` here is
     * an alias for the function `this.Label.phrase()` but it returns _this_ instance instead of the
     * 'Label' instance.__
     * @param phrase The phrasing content to be set for the label.
     * @returns This instance.
     */
    labelPhrase(...phrase) {
        this._label.phrase(...phrase);
        return this;
    }
    /**
     * Set the phrasing content of the components label. __The setter `LabelRephrase` here is an
     * alias for the property `this.Label.Rephrase`.__
     */
    set LabelRephrase(phrase) {
        this._label.Rephrase = phrase;
    }
    /**
     * Set the phrasing content of the the components label. __The function `labelRephrase()` here
     * is an alias for the function `this.Label.rephrase()` but it returns _this_ instance instead
     * of the 'Label' instance.__
     * @param phrase The phrasing content to be set for the label.
     * @returns This instance.
     */
    labelRephrase(...phrase) {
        this._label.rephrase(...phrase);
        return this;
    }
    /**
     * Get/set the position of the label.
     */
    get LabelPosition() {
        return this.lblPosition;
    }
    /** @inheritdoc */
    set LabelPosition(v) {
        this.labelPosition(v);
    }
    /**
     * Set the position of the label.
     * @param v The position of the label.
     * @returns This instance.
     */
    labelPosition(v) {
        if (this.#initialized && v === this.lblPosition) {
            return this;
        }
        this.lblPosition = v;
        this.removeClass("p-top", "p-end", "p-bottom", "p-start");
        switch (v) {
            case LabelPosition.TOP:
                this.ui.Children[0] !== this._label && this.ui.insert(0, this._label);
                this.addClass("p-top");
                break;
            case LabelPosition.END:
                this.ui.Children[1] !== this._label && this.ui.append(this._label);
                this.addClass("p-end");
                break;
            case LabelPosition.BOTTOM:
                this.ui.Children[1] !== this._label && this.ui.append(this._label);
                this.addClass("p-bottom");
                break;
            case LabelPosition.START:
                this.ui.Children[0] !== this._label && this.ui.insert(0, this._label);
                this.addClass("p-start");
                break;
        }
        return this;
    }
    /**
     * Get/set the alignment of the label.
     */
    get LabelAlignment() {
        return this.lblAlignment;
    }
    /** @inheritdoc */
    set LabelAlignment(v) {
        this.labelAlignment(v);
    }
    /**
     * Set the alignment of the label.
     * @param v The alignment of the label.
     * @returns This instance.
     */
    labelAlignment(v) {
        if (this.#initialized && v === this.lblAlignment) {
            return this;
        }
        this.lblAlignment = v;
        this.removeClass("a-start", "a-center", "a-end");
        switch (v) {
            case LabelAlignment.START:
                this.addClass("a-start");
                break;
            case LabelAlignment.CENTER:
                this.addClass("a-center");
                break;
            case LabelAlignment.END:
                this.addClass("a-end");
                break;
        }
        return this;
    }
    /** @inheritdoc */
    focus(options) {
        this._component.focus(options);
        return this;
    }
    /** @inheritdoc */
    blur() {
        this._component.blur();
        return this;
    }
}
/**
 * Abstract `LabeledComponentWithLabel` class. This class allows to implement components that use a
 * `Label` component for its label.
 */
class LabeledComponentWithLabel extends LabeledComponent {
    /**
     * Create LabeledComponentWithLabel component.
     * @param component The inner component of the labeled component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses/toggles/... the component (a unique ID has
     *   been set automatically on the component), if `lblAction` is `false`, clicking on the label
     *   does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the component).
     */
    constructor(component, labelPhrase, id, lblPosition, lblAlignment, lblAction) {
        super(labelPhrase, lblPosition, lblAlignment);
        this._component = component.addClass(LabeledComponent.LCComponentClassname);
        this.initialize(undefined, labelPhrase, id, lblAction);
    }
    /** @inheritdoc */
    buildUI(labelPhrase, id, lblAction) {
        this._label = new Label(id && (lblAction === undefined || lblAction === true)
            ? id
            : undefined)
            .phrase(...[labelPhrase ?? []].flat())
            .addClass(LabeledComponent.LCLabelClassname);
        this.ui = ((this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? new Div().append(this._label, this._component)
            : new Div().append(this._component, this._label)).addClass(LabeledComponent.DefaultCSSClassName);
        return this;
    }
}

/**
 * Labeled textarea component.
 */
class LabeledTextArea extends LabeledComponentWithLabel {
    /**
     * Create LabeledTextArea component.
     * @param labelPhrase The phrasing content for the label.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the textarea element.
     * @param cols The visible width of the textarea element, in average character widths.
     * @param id The id (attribute) of the textarea element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param name The `name` attribute for the textarea element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the textarea element (a unique ID has been set
     *   automatically on the textarea element), if `lblAction` is `false`, clicking on the label
     *   does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the textarea element).
     */
    constructor(labelPhrase, text, rows, cols, id, name, lblPosition, lblAlignment, lblAction) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(new TextArea(text, rows, cols, _id, name), labelPhrase, _id, lblPosition ?? LabelPosition.TOP, lblAlignment, lblAction);
    }
    /**
     * Get TextArea component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    get TextArea() {
        return this._component;
    }
    /**
     * Access the internal `TextArea` component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `TextArea` component instance and
     * this
     * instance as parameters.
     * @returns This instance.
     */
    textArea(cb) {
        cb(this._component, this);
        return this;
    }
    /**
     * __The property `Value` here is an alias for the property `this.TextArea.Value`.__
     */
    get Value() {
        return this._component.DOM.value;
    }
    /** @inheritdoc */
    set Value(v) {
        this._component.DOM.value = v;
    }
    /**
     * __The function `value()` here is an alias for the function `this.TextArea.value()` but it
     * returns _this_ instance instead of the 'TextArea' instance.__
     * @param v The value to be set.
     * @returns This instance.
     */
    value(v) {
        this._component.DOM.value = v;
        return this;
    }
    /**
     * \
     * \
     * __The property `Text` here is an alias for the property `this.TextArea.Text`.__
     * @inheritdoc
     */
    get Text() {
        return this._component.DOM.textContent;
    }
    /**
     * \
     * \
     * __The property `Text` here is an alias for the property `this.TextArea.Text`.__
     * @inheritdoc
     */
    set Text(v) {
        this._component.DOM.textContent = v;
    }
    /**
     * \
     * \
     * __The function `text()` here is an alias for the function `this.TextArea.text()` but it
     * returns _this_ instance instead of the 'TextArea' instance.__
     * @inheritdoc
     */
    text(text) {
        this._component.DOM.textContent = text;
        return this;
    }
}
/**
 * Factory for `LabeledTextArea` components.
 */
class LabeledTextAreaFactory extends ComponentFactory$1 {
    /**
     * Create, set up and return LabeledTextArea component.
     * @param labelPhrase The phrasing content for the label.
     * @param text The text content for the textarea element.
     * @param rows The number of visible text lines for the textarea element.
     * @param cols The visible width of the textarea element, in average character widths.
     * @param id The id (attribute) of the textarea element. If `id` is `undefined` or omitted, a
     * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param name The `name` attribute for the textarea element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the textarea element (a unique ID has been set
     *   automatically on the textarea element), if `lblAction` is `false`, clicking on the label
     *   does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the textarea element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledTextArea component.
     */
    labeledTextArea(labelPhrase, text, rows, cols, id, name, lblPosition, lblAlignment, lblAction, data) {
        return this.setupComponent(new LabeledTextArea(labelPhrase, text, rows, cols, id, name, lblPosition, lblAlignment, lblAction), data);
    }
}

/**
 * The splitter area which is affected by dragging the splitter handle. Dragging the handle sets the
 * CSS style setting `width`/`height` _only on this area_, not on the opposite area.\
 * Default: `SplitterRefArea.START`.
 */
var SplitterActiveArea;
(function (SplitterActiveArea) {
    /** Logical first area. */
    SplitterActiveArea[SplitterActiveArea["START"] = 0] = "START";
    /** Logical second area. */
    SplitterActiveArea[SplitterActiveArea["END"] = 1] = "END";
})(SplitterActiveArea || (SplitterActiveArea = {}));
/** The state of a splitter. */
var SplitterState;
(function (SplitterState) {
    /** The splitter is active. */
    SplitterState[SplitterState["ACTIVE"] = 0] = "ACTIVE";
    /**
     * The splitter is inactive (the size of the active area cannot be changed manually, only
     * programmatically). Normally, the splitter handle should still be visible.
     */
    SplitterState[SplitterState["INACTIVE"] = 1] = "INACTIVE";
    /**
     * The splitter is disabled completely (the size of the active area cannot be changed manually,
     * only programmatically). Additionally the splitter handle should be invisible.\
     * __Note:__ With appropriate settings (e.g. if `StartMinSize` is set to a percentage value),
     * the splitter will still adjust its internal layout if its size changes.
     */
    SplitterState[SplitterState["OFF"] = 2] = "OFF";
})(SplitterState || (SplitterState = {}));
/** The state `Collapsed` of a splitter. */
var SplitterCollapsedState;
(function (SplitterCollapsedState) {
    /** No splitter area is collapsed. */
    SplitterCollapsedState[SplitterCollapsedState["NONE"] = 0] = "NONE";
    /** The logical start area is collapsed. */
    SplitterCollapsedState[SplitterCollapsedState["START"] = 1] = "START";
    /** The logical end area is collapsed. */
    SplitterCollapsedState[SplitterCollapsedState["END"] = 2] = "END";
})(SplitterCollapsedState || (SplitterCollapsedState = {}));
/** Custom 'splitter-area-resize-start' event for `Splitter`. */
class SplitterAreaResizeStartEvent extends ACustomComponentEvent {
    /**
     * Create SplitterAreaResizeStartEvent event. Event handlers can prevent changing the options by
     * calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("splitter-area-resize-start", sender, undefined, customEventInitDict);
    }
}
/** Custom 'splitter-area-resize' event for `Splitter`. */
class SplitterAreaResizeEvent extends ACustomComponentEvent {
    /**
     * Create SplitterAreaResizeEvent event. Event handlers can prevent changing the size by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param size The new size of the active area in pixels. This size is the actual size after
     * applying the constraints for the minimum sizes given through the options.
     * @param desiredSize The desired size of the active area in pixels. This size is the size that
     * would be set _if there were no constraints_ for the minimum sizes given through the options.
     * The difference between `Size` and `DesiredSize` can be used to implement, for example, a
     * 'snap' effect when the pointer is moved a certain amount beyond the minimum size.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, size, desiredSize, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("splitter-area-resize", sender, { Size: size, DesiredSize: desiredSize }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'splitter-area-resize-end' event for `Splitter`. */
class SplitterAreaResizeEndEvent extends ACustomComponentEvent {
    /**
     * Create SplitterAreaResizeEndEvent event. This event is only informative, it cannot be
     * prevented by calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, customEventInitDict = DEFAULT_EVENT_INIT_DICT) {
        super("splitter-area-resize-end", sender, undefined, customEventInitDict);
    }
}
/** Custom 'splitter-collapsed' event for `Splitter`. */
class SplitterCollapsedEvent extends ACustomComponentEvent {
    /**
     * Create SplitterCollapsedEvent event. This event is only informative, it cannot be prevented
     * by calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param state The splitter collapsed state which has been set.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, state, customEventInitDict = DEFAULT_EVENT_INIT_DICT) {
        super("splitter-collapsed", sender, { State: state }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'splitter-resize' event for `Splitter`. */
class SplitterResizeEvent extends ACustomComponentEvent {
    /**
     * Create SplitterResizeEvent event. This event is only informative, it cannot be prevented by
     * calling `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     */
    constructor(sender) {
        super("splitter-resize", sender, undefined, DEFAULT_EVENT_INIT_DICT);
    }
}
/** Custom 'splitter-options' event for `Splitter`. */
class SplitterOptionsEvent extends ACustomComponentEvent {
    /**
     * Create SplitterOptionsEvent event. Event handlers can prevent changing the options by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Splitter`).
     * @param options The new options for the splitter.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, options, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("splitter-options", sender, { Options: options }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/**
 * A Splitter component with two resizable areas. The splitter only ever has one active area, namely
 * the area whose size is being changed (`SplitterOptions.ActiveArea`). The opposite area fills the
 * remaining space of the splitter. Minimum sizes can be defined for both sides with numeric(!) CSS
 * length units. The size of the active area can also be defined programmatically in the constructor
 * or at any later point in time (like all other options). Splitters can be nested for more complex
 * layouts.
 *
 * The splitter always tries to set the size of both areas and a correct minimum size based on the
 * configured settings, but this can fail if the settings are too 'extreme'. This can happen in
 * particular if the minimum sizes (`StartMinSize`, `EndMinSize`) are very large or too large
 * compared to the size of the splitter itself or if the size of the active area plus the minimum
 * size of the opposite area is larger than splitters size itself. The calculated minimum sizes may
 * then 'destroy' the surrounding layout or lead to cut-off inner areas. However, the existing
 * splitter events (`splitter-resize`, `splitter-area-resize`) can be used to react to size changes
 * accordingly.
 *
 * If a splitter is changed (`options`, `mirror()`, `setEven`) _while it is not mounted in the DOM
 * or invisible (`display: none;`)_, these changes are 'recorded' internally and applied when the
 * splitter is mounted in the DOM again. This may not lead to the same result as if the splitter was
 * mounted in the DOM, and the application of the recorded changes may lead to a brief flicker on
 * repainting the splitter.
 */
class Splitter extends AElementComponentWithInternalUI {
    _initialized = false;
    mountedOnce = false;
    tmpCSSStyleSheet;
    tmpCSSClass;
    _options = {};
    recordedChanges = [];
    applyingRecordedChanges = 0;
    _start;
    _handle;
    _end;
    activeArea;
    activeAreaFixed;
    sizeProp = "width";
    minSizeProp = "minWidth";
    clientSizeProp = "clientWidth";
    startMinSize = 0;
    endMinSize = 0;
    activeAreaSize = 0;
    debouncedSplitterResize = getDebouncedFnc(this.onSplitterResize.bind(this), 16)[0];
    resizing = false;
    resizeStart = { X: 0, Y: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    resizeAreaSize = 0;
    resizeObserver;
    isRTL;
    geometry = { Horizontal: true, Start: new DOMRect(), StartMinSize: 0, StartPercentage: 0, End: new DOMRect(), EndMinSize: 0, EndPercentage: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    listenerOptions = { passive: false, capture: true }; // eslint-disable-line jsdoc/require-jsdoc
    realigning = false;
    fncSetEven = this.setEven.bind(this);
    fncOnPointerDown = this.onPointerDown.bind(this);
    fncOnPointerMove = this.onPointerMove.bind(this);
    fncOnPointerUp = this.onPointerUp.bind(this);
    // protected fncOnTouchStart = this.onTouchStart.bind(this);
    // protected fncOnTouchMove = this.onTouchMove.bind(this);
    // protected fncOnTouchEnd = this.onTouchEnd.bind(this);
    /**
     * Create Splitter component.
     * @param options The options for the splitter.
     * @param startContent The content (components or strings) to be added to the start area of the
     * splitter.
     * @param endContent The content (components or strings) to be added to the end area of the
     * splitter.
     */
    constructor(options = {}, startContent = [], endContent = []) {
        super();
        super
            .initialize(undefined, startContent, endContent)
            .on("animationend", (ev) => this.onAnimationEnd(ev))
            .options(options ?? this._options);
        this._initialized = true;
    }
    /**
     * Get/set the splitter options. The returned object is a _copy_, modifying this copy has no
     * effect on the corresponding splitter instance.
     */
    get Options() {
        return {
            ...this._options,
        };
    }
    /** @inheritdoc */
    set Options(v) {
        this.options(v);
    }
    /**
     * Sets new options for the splitter. If the splitter is currently being resized, the options
     * are ignored.
     * @see {@link SplitterOptions}
     * @param options The new splitter options.
     * @returns This instance.
     */
    options(options) {
        if (this.resizing || (this._initialized && !this.dispatch(new SplitterOptionsEvent(this, options)))) {
            return this;
        }
        if (this._initialized && !this.isVisible()) {
            this.recordedChanges.push(options);
            return this;
        }
        const prevOptions = { ...this._options };
        this._options.State = options.State ?? this._options.State ?? SplitterState.ACTIVE;
        this._options.Collapsed = options.Collapsed ?? this._options.Collapsed ?? SplitterCollapsedState.NONE;
        this._options.CollapsedStartSize = (options.CollapsedStartSize ?? this._options.CollapsedStartSize ?? "0px").trim();
        ["0", ""].includes(this._options.CollapsedStartSize) && (this._options.CollapsedStartSize = "0px");
        this._options.CollapsedEndSize = (options.CollapsedEndSize ?? this._options.CollapsedEndSize ?? "0px").trim();
        ["0", ""].includes(this._options.CollapsedEndSize) && (this._options.CollapsedEndSize = "0px");
        this._options.Horizontal = options.Horizontal ?? this._options.Horizontal ?? true;
        this._options.ActiveArea = options.ActiveArea ?? this._options.ActiveArea ?? SplitterActiveArea.START;
        this._options.ActiveAreaSize = (options.ActiveAreaSize ?? this._options.ActiveAreaSize ?? "50%").trim();
        this._options.StartMinSize = (options.StartMinSize ?? this._options.StartMinSize ?? "10rem").trim();
        this._options.EndMinSize = (options.EndMinSize ?? this._options.EndMinSize ?? "10rem").trim();
        this.activeAreaFixed = !this._options.ActiveAreaSize.endsWith("%");
        this.activeAreaFixed
            ? this.addClass("fixed")
            : this.removeClass("fixed");
        if (prevOptions.State !== this._options.State) {
            this.setState();
        }
        if (prevOptions.StartMinSize !== this._options.StartMinSize || prevOptions.EndMinSize !== this._options.EndMinSize) {
            this.setMinSizes();
        }
        if (prevOptions.Horizontal !== this._options.Horizontal || prevOptions.ActiveArea !== this._options.ActiveArea) {
            this.realign();
        }
        if (prevOptions.ActiveAreaSize !== this._options.ActiveAreaSize) {
            this.setSize();
        }
        if (prevOptions.Collapsed !== this._options.Collapsed) {
            this.setCollapsed();
        }
        this.ui.DOM.style.setProperty("--splitter-collapsed-start-size", this._options.CollapsedStartSize);
        this.ui.DOM.style.setProperty("--splitter-collapsed-end-size", this._options.CollapsedEndSize);
        return this;
    }
    /**
     * Get the inner container that contains the components on the logical start side of the
     * splitter (left/top side with `dir="ltr"`, right/top side with `dir="rtl"`). This component
     * should never by styled, it must only be used to add/remove children!
     */
    get Start() {
        return this._start;
    }
    /**
     * Access the internal `Start` container component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `Start` container component instance
     * and this instance as parameters.
     * @see {@link Splitter.Start}
     * @returns This instance.
     */
    start(cb) {
        cb(this._start, this);
        return this;
    }
    /**
     * Get the inner container that contains the components on the logical end side of the splitter
     * (right/bottom side with `dir="ltr"`, left/bottom side with `dir="rtl"`). This component
     * should never by styled, it must only be used to add/remove children!
     */
    get End() {
        return this._end;
    }
    /**
     * Access the internal `End` container component via a callback function. Useful for seamless
     * chaining when creating instances of this component.
     * @param cb A callback function that receives the current `End` container component instance and
     * this instance as parameters.
     * @see {@link Splitter.End}
     * @returns This instance.
     */
    end(cb) {
        cb(this._end, this);
        return this;
    }
    /**
     * Get the splitters handle component. Care must be taken when modifying this component, as the
     * internal calculation of the splitter geometry is only based on `clientWidth`/`clientHeight`
     * and never on `offsetWidth`/`offsetHeight`!
     */
    get Handle() {
        return this._handle;
    }
    /**
     * Access the internal handle component via a callback function. Useful for seamless chaining
     * when creating instances of this component.
     * @param cb A callback function that receives the current handle component instance and this
     * instance as parameters.
     * @see {@link Splitter.Handle}
     * @returns This instance.
     */
    handle(cb) {
        cb(this._handle, this);
        return this;
    }
    /**
     * Get the current splitter geometry. Modifying the returned object has no effect on the
     * splitter instance.
     * @see {@link SplitterGeometry}
     */
    get Geometry() {
        return {
            /* eslint-disable jsdoc/require-jsdoc */
            ...this.geometry,
            Start: DOMRect.fromRect(this.geometry.Start),
            End: DOMRect.fromRect(this.geometry.End),
            /* eslint-enable */
        };
    }
    /**
     * Set both areas of the splitter to the same width/height.
     * @returns This instance.
     */
    setEven() {
        if (!this.isVisible()) {
            this.recordedChanges.push("setEven");
            return this;
        }
        this.activeArea.style(this.sizeProp, this.activeAreaFixed
            ? (this._dom[this.clientSizeProp] - this._handle.DOM[this.clientSizeProp]) / 2 + "px"
            : "50%");
        this.updateGeometry();
        return this;
    }
    /**
     * Mirrors the visual appearance of the splitter. This includes swapping the active area and
     * also the minimum sizes for both areas. Calling `mirror()` also changes the current options!
     * @returns This instance.
     */
    mirror() {
        if (!this.isVisible()) {
            this.recordedChanges.push("mirror");
            return this;
        }
        // Update the sizes to get the size of the active area (in uncollapsed state).
        this.getAreaMinSizes();
        const mirroredSize = this.activeAreaFixed
            ? this.activeAreaSize + "px"
            : (this.activeAreaSize / this._dom[this.clientSizeProp]) * 100 + "%";
        this.options({
            /* eslint-disable jsdoc/require-jsdoc */
            ActiveArea: this._options.ActiveArea === SplitterActiveArea.START ? SplitterActiveArea.END : SplitterActiveArea.START,
            StartMinSize: this._options.EndMinSize,
            EndMinSize: this._options.StartMinSize
            /* eslint-enable */
        });
        this.activeArea.style(this.sizeProp, mirroredSize);
        this.updateGeometry();
        return this;
    }
    /**
     * Update the current splitter `geometry` object.
     */
    updateGeometry() {
        if (!this.isVisible()) {
            return;
        }
        this.geometry.Horizontal = this._options.Horizontal;
        this.geometry.Start = getClientRect(this._start.DOM);
        this.geometry.StartMinSize = this.startMinSize;
        this.geometry.StartPercentage = this._start.DOM[this.clientSizeProp] / this._dom[this.clientSizeProp] * 100;
        this.geometry.End = getClientRect(this._end.DOM);
        this.geometry.EndMinSize = this.endMinSize;
        this.geometry.EndPercentage = (this._dom[this.clientSizeProp] - this._handle.DOM[this.clientSizeProp] - this._start.DOM[this.clientSizeProp]) / this._dom[this.clientSizeProp] * 100;
    }
    /**
     * Get and store the current minimum sizes in pixels of both areas and also the size of the
     * active area. An ugly hack, but it seems to work.
     */
    getAreaMinSizes() {
        if (!this.isVisible()) {
            return;
        }
        const div = new Div()
            .hidden(true)
            .style("position", "relative");
        this.ui.append(div);
        div.style(this.minSizeProp, this._options.StartMinSize, true);
        this.startMinSize = parseFloat(getComputedStyle(div.DOM)[this.sizeProp].slice(0, -2));
        div.style(this.minSizeProp, this._options.EndMinSize, true);
        this.endMinSize = parseFloat(getComputedStyle(div.DOM)[this.sizeProp].slice(0, -2));
        div.style(this.minSizeProp, this.activeArea.Style[this.sizeProp], true);
        this.activeAreaSize = parseFloat(getComputedStyle(div.DOM)[this.sizeProp].slice(0, -2));
        this.ui.remove(div);
    }
    /**
     * Set the minimum size of the splitter component.
     */
    setSplitterMinSize() {
        if (!this.isVisible()) {
            return;
        }
        const activeAreaPercentage = this.activeArea.Style.width.endsWith("%");
        const handleSize = this._handle.DOM[this.clientSizeProp];
        const oppositeMinSize = this._options.ActiveArea === SplitterActiveArea.START
            ? this.endMinSize
            : this.startMinSize;
        let minsize;
        if (this._options.ActiveArea === SplitterActiveArea.START && this._start.Style.minWidth.endsWith("%") && activeAreaPercentage
            || this._options.ActiveArea === SplitterActiveArea.END && this._end.Style.minWidth.endsWith("%") && activeAreaPercentage) {
            const percentage = parseFloat(this.activeArea.Style.width.slice(0, -1));
            minsize = 100 / (100 - percentage) * oppositeMinSize + handleSize;
        }
        else {
            // minsize = this.activeArea.DOM[this.clientSizeProp] + oppositeMinSize + handleSize;
            minsize = this.activeAreaSize + oppositeMinSize + handleSize;
        }
        this.style({
            /* eslint-disable jsdoc/require-jsdoc */
            [this._options.Horizontal ? "minHeight" : "minWidth"]: null,
            [this.minSizeProp]: minsize + "px"
            /* eslint-enable */
        });
    }
    /**
     * Set the state of the splitter.
     */
    setState() {
        this.removeClass("inactive", "off");
        if (this._options.State === SplitterState.INACTIVE) {
            this.addClass("inactive");
        }
        else if (this._options.State === SplitterState.OFF) {
            this.addClass("off");
        }
        this.updateGeometry();
    }
    /**
     * Set the current minimum sizes of all parts.
     */
    setMinSizes() {
        if (!this.isVisible()) {
            this._start.style(this.minSizeProp, this._options.StartMinSize);
            this._end.style(this.minSizeProp, this._options.EndMinSize);
            return;
        }
        const prevStartMinSize = this.startMinSize;
        const prevEndMinSize = this.endMinSize;
        this.getAreaMinSizes();
        this._start.style(this.minSizeProp, this._options.StartMinSize);
        this._end.style(this.minSizeProp, this._options.EndMinSize);
        this.setSplitterMinSize();
        // Update the style of the active area if one of the minimum sizes has become larger. Only
        // necessary if resizing is based on absolute values.
        if (this.activeAreaFixed && (this.startMinSize > prevStartMinSize || this.endMinSize > prevEndMinSize)) {
            this.activeArea.style(this.sizeProp, getComputedStyle(this.activeArea.DOM)[this.sizeProp]);
        }
        this.updateGeometry();
    }
    /**
     * Realign the splitter if its alignment is changed.
     */
    realign() {
        this.realigning = true;
        const isActiveAreaStart = this._options.ActiveArea === SplitterActiveArea.START;
        this.activeArea = isActiveAreaStart
            ? this._start
            : this._end;
        this
            .removeClass("active-area-start", "active-area-end")
            .addClass(isActiveAreaStart ? "active-area-start" : "active-area-end");
        [this._start, this._end].forEach((e) => {
            e.style({
                /* eslint-disable jsdoc/require-jsdoc */
                width: null,
                height: null,
                minWidth: null,
                minHeight: null
                /* eslint-enable */
            });
        });
        if (this._options.Horizontal) {
            this.replaceClass("vertical", "horizontal");
            this.sizeProp = "width";
            this.minSizeProp = "minWidth";
            this.clientSizeProp = "clientWidth";
        }
        else {
            this.replaceClass("horizontal", "vertical");
            this.sizeProp = "height";
            this.minSizeProp = "minHeight";
            this.clientSizeProp = "clientHeight";
        }
        this._start.style(this.minSizeProp, this._options.StartMinSize);
        this._end.style(this.minSizeProp, this._options.EndMinSize);
        // Set sizes based on the previous relative sizes.
        isActiveAreaStart
            ? this._start.style(this.sizeProp, this.geometry.StartPercentage + "%")
            : this._end.style(this.sizeProp, this.geometry.EndPercentage + "%");
        // Recalculate and set minimum sizes.
        if (this.isVisible()) {
            this.getAreaMinSizes();
            this.setSplitterMinSize();
            // Switch size style to absolute, if necessary.
            if (this.activeAreaFixed) {
                isActiveAreaStart
                    ? this._start.style(this.sizeProp, this._start.DOM[this.clientSizeProp] + "px")
                    : this._end.style(this.sizeProp, this._end.DOM[this.clientSizeProp] + "px");
            }
            this.updateGeometry();
        }
        this.realigning = false;
    }
    /**
     * Set the size of the active area.
     */
    setSize() {
        this.activeArea.style(this.sizeProp, this._options.ActiveAreaSize);
        if (!this.isVisible()) {
            return;
        }
        this.getAreaMinSizes();
        this.setSplitterMinSize();
        this.updateGeometry();
    }
    /**
     * Collapse/uncollapse splitter areas.
     */
    setCollapsed() {
        // Do nothing if the element hasn't been mounted once.
        if (!this.mountedOnce) {
            return;
        }
        // Both classes are set _after_ the CSS animation finished so `this._options` can't be used.
        const isStartCollapsed = this.hasClass("start-collapsed");
        const isEndCollapsed = this.hasClass("end-collapsed");
        this
            .removeClass("start-collapsing", "start-uncollapsing", "start-collapsed", "start-collapsed0", "end-collapsing", "end-uncollapsing", "end-collapsed", "end-collapsed0");
        // Skip animations, if the splitter only switches between collapsed states.
        if (this._options.Collapsed !== SplitterCollapsedState.NONE && (isStartCollapsed || isEndCollapsed)) {
            this.addClass(isStartCollapsed
                ? "end-collapsed"
                : "start-collapsed", isStartCollapsed && this.isCSSRulePropZero(this._options.CollapsedEndSize) ? "end-collapsed0" : null, isEndCollapsed && this.isCSSRulePropZero(this._options.CollapsedStartSize) ? "start-collapsed0" : null);
            this._initialized && this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed));
        }
        else if (this._options.Collapsed === SplitterCollapsedState.NONE) {
            this.ui.insert(this._end, this._handle);
            // Only use animations if the splitter is visible and isn't applying recorded changes.
            if (this.isVisible() && this.applyingRecordedChanges === 0) {
                if (isStartCollapsed) {
                    this.addClass("start-uncollapsing");
                }
                else if (isEndCollapsed) {
                    this.addClass("end-uncollapsing");
                }
            }
            else {
                this._initialized && this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed));
            }
        }
        else {
            this.ui.remove(this._handle);
            // Only use animations if the splitter is visible and isn't applying recorded changes.
            if (this.isVisible() && this.applyingRecordedChanges === 0) {
                this.addClass(this._options.Collapsed === SplitterCollapsedState.START
                    ? "start-collapsing"
                    : "end-collapsing");
            }
            else {
                this._options.Collapsed === SplitterCollapsedState.START
                    ? this.addClass("start-collapsed", this.isCSSRulePropZero(this._options.CollapsedStartSize) ? "start-collapsed0" : null)
                    : this.addClass("end-collapsed", this.isCSSRulePropZero(this._options.CollapsedEndSize) ? "end-collapsed0" : null);
                this._initialized && this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed));
            }
        }
        this.updateGeometry();
    }
    /**
     * Apply all modifications which have been made while the splitter wasn't mounted to the DOM.
     */
    applyRecordedChanges() {
        if (this.recordedChanges.length === 0 || !this.isVisible()) {
            return;
        }
        this.applyingRecordedChanges++;
        try {
            for (const opts of this.recordedChanges) {
                if (opts === "mirror") {
                    this.mirror();
                }
                else if (opts === "setEven") {
                    this.setEven();
                }
                else {
                    this.options(opts);
                }
            }
        }
        finally {
            this.recordedChanges.length = 0;
            this.applyingRecordedChanges--;
        }
    }
    /**
     * Set new minimum sizes if the splitter component has been resized.
     */
    onSplitterResize() {
        requestAnimationFrame(() => {
            if (this.mountedOnce) {
                this.setMinSizes();
                this.applyRecordedChanges();
                this.emit(new SplitterResizeEvent(this));
            }
            else {
                this.updateGeometry();
                if (this._options.Collapsed !== SplitterCollapsedState.NONE) {
                    this.ui.remove(this._handle);
                    this._options.Collapsed === SplitterCollapsedState.START
                        ? this.addClass("start-collapsed")
                        : this.addClass("end-collapsed");
                }
                this.removeClass(this.tmpCSSClass);
                this.mountedOnce = true;
                queueMicrotask(() => {
                    const index = document.adoptedStyleSheets.indexOf(this.tmpCSSStyleSheet);
                    index !== -1 && document.adoptedStyleSheets.splice(index, 1);
                    delete this?.tmpCSSStyleSheet;
                    delete this?.tmpCSSClass;
                    this.getAreaMinSizes();
                });
            }
        });
    }
    /**
     * Handle the `pointerdown` event on the handle.
     * @param ev The pointer event.
     */
    onPointerDown(ev) {
        if (this._options.State || this.resizing || !this.dispatch(new SplitterAreaResizeStartEvent(this))) {
            return;
        }
        ev.preventDefault();
        ev.stopImmediatePropagation();
        this._handle.DOM.setPointerCapture(ev.pointerId);
        this._handle.on("pointermove", this.fncOnPointerMove, this.listenerOptions);
        this.onStartResize(ev);
    }
    /**
     * Handle the `pointermove` event on the handle.
     * @param ev The pointer event.
     */
    onPointerMove(ev) {
        if (!this.resizing) {
            return;
        }
        ev.preventDefault();
        ev.stopImmediatePropagation();
        this.onResize(ev);
    }
    /**
     * Handle the `pointerup` event on the handle.
     * @param ev The pointer event.
     */
    onPointerUp(ev) {
        if (!this.resizing) {
            return;
        }
        this._handle.DOM.releasePointerCapture(ev.pointerId);
        this._handle.off("pointermove", this.fncOnPointerMove, this.listenerOptions);
        this.onResizeEnd();
    }
    /**
     * Start dragging the handle.
     * @param ev The pointer event or touch.
     */
    onStartResize(ev) {
        this.resizing = true;
        this.addClass("resizing");
        this.resizeStart.X = ev.clientX;
        this.resizeStart.Y = ev.clientY;
        this.resizeAreaSize = this.activeArea.DOM[this.clientSizeProp];
        this.isRTL = getComputedStyle(this._dom).direction === "rtl";
    }
    /**
     * Drag the handle.
     * @param ev The pointer event or touch.
     */
    onResize(ev) {
        const isActiveAreaStart = this._options.ActiveArea === SplitterActiveArea.START;
        const minSize = isActiveAreaStart
            ? this.startMinSize
            : this.endMinSize;
        const oppositeMinSize = this._options.ActiveArea === SplitterActiveArea.START
            ? this.endMinSize
            : this.startMinSize;
        const f1 = isActiveAreaStart
            ? 1
            : -1;
        const f2 = this.isRTL && this._options.Horizontal
            ? -1
            : 1;
        const dist = this._options.Horizontal
            ? f1 * (ev.clientX - this.resizeStart.X)
            : f1 * (ev.clientY - this.resizeStart.Y);
        const newSize = Math.max(minSize, Math.min((this.resizeAreaSize + f2 * dist), this._dom[this.clientSizeProp] - this._handle.DOM[this.clientSizeProp] - oppositeMinSize));
        if (this.dispatch(new SplitterAreaResizeEvent(this, newSize, this.resizeAreaSize + (this.isRTL ? -dist : dist)))) {
            this.activeArea.style(this.sizeProp, this.activeAreaFixed
                ? newSize + "px"
                : newSize / this._dom[this.clientSizeProp] * 100 + "%");
        }
        else {
            this.onResizeEnd();
        }
    }
    /**
     * Stop dragging the handle.
     */
    onResizeEnd() {
        this.getAreaMinSizes();
        this.setSplitterMinSize();
        this.updateGeometry();
        this.removeClass("resizing");
        this.resizing = false;
        this.emit(new SplitterAreaResizeEndEvent(this));
    }
    /**
     * Handle animation events.
     * @param ev The animation event to be handled.
     */
    onAnimationEnd(ev) {
        if ((ev.target !== this._start.DOM && ev.target !== this._end.DOM)
            || !["hsplitter-to-0", "hsplitter-to-100", "hsplitter-from-0-to-previous", "hsplitter-from-100-to-previous",
                "vsplitter-to-0", "vsplitter-to-100", "vsplitter-from-0-to-previous", "vsplitter-from-100-to-previous"]
                .includes(ev.animationName)) {
            return;
        }
        this.removeClass("start-collapsed", "start-collapsed0", "start-collapsing", "start-uncollapsing", "end-collapsed", "end-collapsed0", "end-collapsing", "end-uncollapsing");
        if (this._options.Collapsed === SplitterCollapsedState.START) {
            this.addClass("start-collapsed", this.isCSSRulePropZero(this._options.CollapsedStartSize) ? "start-collapsed0" : null);
        }
        else if (this._options.Collapsed === SplitterCollapsedState.END) {
            this.addClass("end-collapsed", this.isCSSRulePropZero(this._options.CollapsedEndSize) ? "end-collapsed0" : null);
        }
        this.updateGeometry();
        this.emit(new SplitterCollapsedEvent(this, this._options.Collapsed));
    }
    /**
     * Checks, if the splitter is visible (allows the inspection of DOM elements).
     * @returns `true`, if the splitter is visible, otherwise `false`.
     */
    isVisible() {
        return this.DOM.checkVisibility();
    }
    /**
     * Checks, if the given CSS rule property is zero. This is true, if the rule without the unit is
     * `0` or if the rule is explicitly set to `0`.
     * @param prop The CSS rule property to be checked, e.g. `CollapsedEndSize`, `StartMinSize` etc.
     * @returns `true`, if the CSS rule property is zero, otherwise `false`.
     */
    isCSSRulePropZero(prop) {
        return (prop ?? "").trim().replace(/[a-z%]+$/i, "") === "0";
    }
    /**
     * Build UI of the component.
     * @param startContent An array of components to be added to the start area of the splitter.
     * @param endContent An array of components to be added to the end area of the splitter.
     * @returns This instance.
     */
    buildUI(startContent, endContent) {
        this.tmpCSSClass = "r" + Math.floor(Math.random() * 1000000);
        this.tmpCSSStyleSheet = new CSSStyleSheet();
        this.tmpCSSStyleSheet.insertRule(`.${this.tmpCSSClass} {visibility: hidden !important;}`);
        document.adoptedStyleSheets.push(this.tmpCSSStyleSheet);
        this.ui = new Div()
            .addClass("horizontal", "active-area-start", this.tmpCSSClass)
            .addClass("horizontal", "active-area-start")
            .append(this._start = new Div()
            .addClass("start")
            .append(...startContent), this._handle = new Div()
            .addClass("handle")
            .append(new Div())
            .on("dblclick", this.fncSetEven)
            .on("pointerdown", this.fncOnPointerDown, this.listenerOptions)
            .on("pointerup", this.fncOnPointerUp, this.listenerOptions), 
        // .on("touchstart", this.fncOnTouchStart, this.listenerOptions)
        // .on("touchend", this.fncOnTouchEnd, this.listenerOptions)
        // .on("touchcancel", this.fncOnTouchEnd, this.listenerOptions),
        this._end = new Div()
            .addClass("end")
            .append(...endContent));
        this.activeArea = this._start;
        this.resizeObserver = new ResizeObserver((entries => {
            if (this.isVisible()) {
                for (const entry of entries) {
                    // Set the minimum sizes and the size of the active area on resizing.
                    if (entry.target === this.ui.DOM && !this.realigning) {
                        void this.debouncedSplitterResize();
                        // this.onSplitterResize();
                        break;
                    }
                }
            }
        }));
        this.resizeObserver.observe(this.ui.DOM);
        return this;
    }
}
/**
 * Factory for `Splitter` components.
 */
class SplitterFactory extends ComponentFactory$1 {
    /**
     * Create, set up and return Splitter component.
     * @param options The options for the splitter.
     * @param startContent The content (components or strings) to be added to the start area of the
     * splitter.
     * @param endContent The content (components or strings) to be added to the end area of the
     * splitter.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Splitter component.
     */
    splitter(options = {}, startContent = [], endContent = [], data) {
        return this.setupComponent(new Splitter(options, startContent, endContent), data);
    }
}

/**
 * Just a primitive container for the main content of the app.
 */
class ContentContainer extends Div {
    constructor() {
        super();
        this.addClass("content-container");
    }
}

/**
 * All corners/edges that can be used to change the size of a dialog. The values must be set as a
 * bit mask on {@link DialogOptions.Resizers} in the dialog options.
 */
var DlgResizers;
(function (DlgResizers) {
    DlgResizers[DlgResizers["NONE"] = 0] = "NONE";
    DlgResizers[DlgResizers["N"] = 1] = "N";
    DlgResizers[DlgResizers["NE"] = 2] = "NE";
    DlgResizers[DlgResizers["E"] = 4] = "E";
    DlgResizers[DlgResizers["SE"] = 8] = "SE";
    DlgResizers[DlgResizers["S"] = 16] = "S";
    DlgResizers[DlgResizers["SW"] = 32] = "SW";
    DlgResizers[DlgResizers["W"] = 64] = "W";
    DlgResizers[DlgResizers["NW"] = 128] = "NW";
})(DlgResizers || (DlgResizers = {}));
/**
 * Bit mask for {@link DialogOptions.Resizers} in the dialog options that allows resizing the
 * dialog on _all_ corners/edges.
 */
const DLG_RESIZERS_ALL = DlgResizers.N |
    DlgResizers.NE |
    DlgResizers.E |
    DlgResizers.SE |
    DlgResizers.S |
    DlgResizers.SW |
    DlgResizers.W |
    DlgResizers.NW;
/**
 * State of a dialog.
 */
var DialogState;
(function (DialogState) {
    /** The dialog is not showing (closed). */
    DialogState[DialogState["CLOSED"] = 0] = "CLOSED";
    /** The dialog is shown non-modally. */
    DialogState[DialogState["NON_MODAL"] = 1] = "NON_MODAL";
    /** The dialog is shown modally. */
    DialogState[DialogState["MODAL"] = 2] = "MODAL";
})(DialogState || (DialogState = {}));
/** Custom 'dlg-show' event for dialogs. */
class DialogShowEvent extends ACustomComponentEvent {
    /**
     * Create dialog show event. Event handlers can prevent showing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param modal `true` if the dialog is about to be displayed modal, otherwise false.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, modal, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-show", sender, { Modal: modal }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-shown' event for dialogs. */
class DialogShownEvent extends ACustomComponentEvent {
    /**
     * Create dialog shown event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param modal `true` if the dialog is shown modal, otherwise false.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, modal, customEventInitDict = DEFAULT_EVENT_INIT_DICT) {
        super("dlg-shown", sender, { Modal: modal }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-close' event for dialogs. */
class DialogCloseEvent extends ACustomComponentEvent {
    /**
     * Create dialog close event. Event handlers can prevent closing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param returnValue The return value with which the dialog is to be closed/cancelled.\
     * __Note:__ The `ReturnValue` property of the events `detail` property is either
     * - the current `ReturnValue` property of the dialog,
     * - the return value which has been set through calling `close(someReturnValue)` (if any)
     * - or `DLG_CANCELLED`, if the dialog is to be cancelled (then `Cancel` is also `true`).
     * @param cancel `true`, if the dialog was cancelled instead of closed regularly, otherwise
     * `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, returnValue, cancel, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-close", sender, { ReturnValue: cancel ? DLG_CANCELLED : returnValue, Cancel: cancel }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-closed' event for dialogs. */
class DialogClosedEvent extends ACustomComponentEvent {
    /**
     * Create dialog closed event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param returnValue The return value with which the dialog was closed/cancelled.\
     * __Note:__ The `ReturnValue` property of the events `detail` property is either
     * - the current `ReturnValue` property of the dialog,
     * - the return value which has been set through calling `close(someReturnValue)` (if any)
     * - or `DLG_CANCELLED`, if the dialog was cancelled (then `Cancel` is also `true`).
     * @param cancel `true`, if the dialog was cancelled instead of closed regularly, otherwise
     * `false`.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, returnValue, cancel, customEventInitDict = DEFAULT_EVENT_INIT_DICT) {
        super("dlg-closed", sender, { ReturnValue: cancel ? DLG_CANCELLED : returnValue, Cancel: cancel }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-move-start' event for dialogs. */
class DialogMoveStartEvent extends ACustomComponentEvent {
    /**
     * Create dialog move start event. Event handlers can prevent moving the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-move-start", sender, undefined, customEventInitDict);
    }
}
/** Custom 'dlg-move' event for dialogs. */
class DialogMoveEvent extends ACustomComponentEvent {
    /**
     * Create dialog move event. Event handlers can prevent moving the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param offset The offset of the move event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, offset, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-move", sender, { Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-moved' event for dialogs. */
class DialogMovedEvent extends ACustomComponentEvent {
    /**
     * Create dialog moved event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param offset The offset of the move event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, offset, customEventInitDict = DEFAULT_EVENT_INIT_DICT) {
        super("dlg-moved", sender, { Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-resize-start' event for dialogs. */
class DialogResizeStartEvent extends ACustomComponentEvent {
    /**
     * Create dialog resize start event. Event handlers can prevent resizing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param resizer The resizer which is used to resize the dialog.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, resizer, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-resize-start", sender, { Resizer: resizer }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-resize' event for dialogs. */
class DialogResizeEvent extends ACustomComponentEvent {
    /**
     * Create dialog resize event. Event handlers can prevent resizing the dialog by calling
     * `preventDefault()`.
     * @param sender The event emitter (always `Dialog`).
     * @param resizer The resizer which is used to resize the dialog.
     * @param offset The offset of the resize event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, resizer, offset, customEventInitDict = DEFAULT_CANCELABLE_EVENT_INIT_DICT) {
        super("dlg-resize", sender, { Resizer: resizer, Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/** Custom 'dlg-resized' event for dialogs. */
class DialogResizedEvent extends ACustomComponentEvent {
    /**
     * Create dialog resized event. This event is purely informative and can't be cancelled.
     * @param sender The event emitter (always `Dialog`).
     * @param resizer The resizer which was used to resize the dialog.
     * @param offset The offset of the resize event.
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param customEventInitDict Optional event properties.
     */
    constructor(sender, resizer, offset, customEventInitDict = DEFAULT_EVENT_INIT_DICT) {
        super("dlg-resized", sender, { Resizer: resizer, Offset: offset }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
    }
}
/**
 * Special return value of dialogs in the case where the internal `Dialog` DOM element is closed
 * bypassing the regular `close()`/`forceClose()` functions. This should never happen, except the
 * browser has a bug or the component is misused by accessing protected properties.\
 * __Note:__ Do _not_ use this constant as a regular return value for dialogs!
 */
const DLG_IRREGULAR_CLOSE = "__DLG_IRREGULAR_CLOSE__";
/**
 * Default return value of dialogs which have been cancelled using `cancel()`/`forceCancel()`.\
 * __Note:__ Do _not_ use this constant as a regular return value for dialogs!
 */
const DLG_CANCELLED = "__DLG_CANCELLED__";
/**
 * Dialog component for displaying modal and non-modal dialogs.
 */
class Dialog extends AElementComponentWithInternalUI {
    static nonModals = [];
    static modals = [];
    static baseZIndex;
    dlg;
    _options = {};
    modalResolver;
    state = DialogState.CLOSED;
    contentContainer;
    lastActiveElement;
    closedRegularly;
    isRTL;
    rsObserver;
    fncOnResize = this.onResize.bind(this);
    moveResizeStart;
    pointerDownStart = { X: 0, Y: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    moving = false;
    moveStartPositionOffset = { X: 0, Y: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    fncOnNonModalPointerDown = this.onNonModalPointerDown.bind(this);
    fncOnModalPointerDown = this.onModalPointerDown.bind(this);
    fncOnPointerDown = this.onPointerDown.bind(this);
    fncOnPointerMove = this.onPointerMove.bind(this);
    fncOnPointerUp = this.onPointerUp.bind(this);
    resizing = false;
    resizers = [];
    rsN;
    rsNE;
    rsE;
    rsSE;
    rsS;
    rsSW;
    rsW;
    rsNW;
    fncOnResizerPointerDown = this.onResizerPointerDown.bind(this);
    fncOnResizerPointerMove = this.onResizerPointerMove.bind(this);
    fncOnResizerPointerUp = this.onResizerPointerUp.bind(this);
    resizeDir;
    resizer;
    resizeStart = { X: 0, Y: 0, W: 0, H: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    minSize = { W: 0, H: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    maxSize = { W: 0, H: 0 }; // eslint-disable-line jsdoc/require-jsdoc
    /**
     * Create dialog component.\
     * __Note:__ In contrast to the vast majority of other components, instances of `Dialog` usually
     * should not be mounted in another component (with `append()` or insert()) since this can cause
     * problems when centering or positioning the dialog (by default relative to the viewport). This
     * is especially true for modal dialogs where it can be hard to calculate the position of the
     * dialog with regard to its parent. For non-modal dialogs centering and positioning the dialog
     * relative to its parent usually works as expected, but use cases for this scenario are rather
     * rare.\
     * If an instance of `Dialog` is not mounted in another component, it is automatically added to
     * `document.body` as a child element in `show()`/`showModal()` and removed again in `close()`.
     * @param options Options for the dialog.
     * @param children The initial components that make up the content of this dialog.\
     * __Important note:__ If a dialog is disposed of (using `dispose()`), _all_ components given
     * in the constructor that are still children of this dialog (`Dialog` implements `IChildren`)
     * are also disposed of! If these components are to be used elsewhere after the dialog has been
     * disposed of, they must be extracted or removed using `dlg.extract(...)` or `dlg.remove()`
     * before the dialog is disposed of!
     */
    constructor(options, ...children) {
        super();
        super
            .initialize()
            .options(options ?? {})
            .append(...children);
    }
    /**
     * Get/set the options for this dialog. The getter returns a _copy_ of the options.\
     * __Note:__ If the dialog is currently moved, setting `Options` does nothing.
     */
    get Options() {
        return { ...this._options };
    }
    /** @inheritdoc */
    set Options(v) {
        this.options(v);
    }
    /**
     * Set the options for this dialog. See also the documentation for `DialogOptions`.\
     * __Note:__ If the dialog is currently moved or resized, `options()` does nothing.
     * @param opts The new dialog options.
     * @returns This instance.
     */
    options(opts) {
        if (this.moving || this.resizing) {
            return this;
        }
        this._options.MoveHandle?.off("pointerup", this.fncOnPointerUp)
            .off("pointerdown", this.fncOnPointerDown)
            .removeClass("move-handle", "custom-move-handle");
        this._options = {
            /* eslint-disable jsdoc/require-jsdoc */
            Position: getProp(opts, this._options, "Position", { X: 0, Y: 0 }),
            HCentered: getProp(opts, this._options, "HCentered", true),
            VCentered: getProp(opts, this._options, "VCentered", true),
            CloseWithEscape: getProp(opts, this._options, "CloseWithEscape", true),
            CloseWithClickOutside: getProp(opts, this._options, "CloseWithClickOutside", false),
            Movable: getProp(opts, this._options, "Movable", false),
            MoveHandle: getProp(opts, this._options, "MoveHandle", this.contentContainer),
            Resizers: getProp(opts, this._options, "Resizers", DlgResizers.NONE),
            CenteredResize: getProp(opts, this._options, "CenteredResize", false),
            LockFocusInside: getProp(opts, this._options, "LockFocusInside", true),
            BaseZIndex: Math.max(getProp(opts, this._options, "BaseZIndex", 1000), 0),
            /* eslint-enable */
        };
        if (this._options.Movable) {
            this._options.MoveHandle.on("pointerdown", this.fncOnPointerDown)
                .on("pointerup", this.fncOnPointerUp)
                .addClass(this._options.MoveHandle === this.contentContainer ? "move-handle" : "custom-move-handle");
        }
        const resizable = [DlgResizers.N, DlgResizers.NE, DlgResizers.E, DlgResizers.SE, DlgResizers.S, DlgResizers.SW, DlgResizers.W, DlgResizers.NW];
        for (let i = 0; i < this.resizers.length; i++) {
            ((this._options.Resizers & resizable[i]) === resizable[i]) // eslint-disable-line @typescript-eslint/no-unsafe-enum-comparison
                ? this.ui.DOM.appendChild(this.resizers[i])
                : this.resizers[i].remove();
        }
        Dialog.baseZIndex = this._options.BaseZIndex;
        this.setZIndexes();
        this
            .removeClass("h-centered", "v-centered", "movable", "resizable")
            .addClass(this._options.HCentered ? "h-centered" : null, this._options.VCentered ? "v-centered" : null, this._options.Movable ? "movable" : null, (this._options.Resizers !== DlgResizers.NONE) ? "resizable" : null);
        this.state !== DialogState.CLOSED && this.placeDlg(this.getPosition());
        return this;
    }
    /**
     * Get the state of this dialog.
     */
    get State() {
        return this.state;
    }
    /**
     * Get an array with all existing _open_ non-modal dialog instances.
     */
    get NonModals() {
        return Dialog.nonModals.slice(0);
    }
    /**
     * Get an array with all existing _open_ modal dialog instances.
     */
    get Modals() {
        return Dialog.modals.slice(0);
    }
    /**
     * Get/set the `ReturnValue` property of the dialog (the `returnValue` of the internal DOM
     * dialog element).
     */
    get ReturnValue() {
        return this.dlg.ReturnValue;
    }
    /** @inheritdoc */
    set ReturnValue(v) {
        this.dlg.ReturnValue = v;
    }
    /**
     * Set the `returnValue` property of the dialog (the `returnValue` of the internal DOM dialog
     * element).
     * @param v The value to be set.
     * @returns This instance.
     */
    returnValue(v) {
        this.dlg.ReturnValue = v;
        return this;
    }
    /**
     * Get the inner content container of the dialog.\
     * __Note:__ This property __must not be used to add/remove/... components__, instead use the
     * respective functions of `Dialog` itself! `Content` should only be used for styling or other
     * (readonly) purposes!
     */
    get Content() {
        return this.contentContainer;
    }
    /**
     * Get the current bounding rectangle of the dialog with regard to the viewport (in pixels).
     * This value is only useful if the dialog is shown (`<dlg>.State !== DialogState.CLOSED`).
     */
    get BoundingRect() {
        return this.DOM.getBoundingClientRect();
    }
    /**
     * Closes the dialog. `dlg-close` event handlers may prevent closing the dialog.
     * @param returnValue An overridden/individual value for the `ReturnValue` of the dialog. This
     * does _not_ change the _current_ value of `ReturnValue` on this instance!
     * @returns This instance.
     */
    close(returnValue) {
        return this.dispatch(new DialogCloseEvent(this, returnValue ?? this.ReturnValue, false))
            ? this.doClose(returnValue)
            : this;
    }
    /**
     * Forcibly closes the dialog. `dlg-close` event handlers _are not called_ and thus _cannot_
     * prevent closing the dialog.
     * @param returnValue An overridden/individual value for the `ReturnValue` of the dialog. This
     * does _not_ change the _current_ value of `ReturnValue` on this instance!
     * @returns This instance.
     */
    forceClose(returnValue) {
        return this.doClose(returnValue);
    }
    /**
     * Cancels (and closes) the dialog. `dlg-close` event handlers may prevent canceling the dialog.
     * The `ReturnValue` of the dialog is set to {@link DLG_CANCELLED}.
     * @returns This instance.
     */
    cancel() {
        return this.dispatch(new DialogCloseEvent(this, DLG_CANCELLED, true))
            ? this.doClose(DLG_CANCELLED)
            : this;
    }
    /**
     * Forcibly cancels (and closes) the dialog. `dlg-close` event handlers _are not called_ and
     * thus _cannot_ prevent canceling the dialog. The `ReturnValue` of the dialog is set to
     * {@link DLG_CANCELLED}.
     * @returns This instance.
     */
    forceCancel() {
        return this.doClose(DLG_CANCELLED);
    }
    /**
     * Displays the dialog (non-modal) and adds the class name `non-modal` to the dialog. `dlg-show`
     * event handlers may prevent showing the dialog.
     * @param focus The component to be focused after showing the dialog. `focus` can have the
     * following values:
     * - An instance of `IElementComponent`: if the instance is a child of this dialog this instance
     *   is focused, otherwise the dialog itself is focused.
     * - Not given or `undefined`: If the dialog is shown _for the first time_ the dialog will be
     *   focused. Subsequent calls to `show()` or `show(undefined)` try to focus the element that
     *   was active _immediately before the dialog was closed_ (if the dialog contains it, otherwise
     *   the dialog itself is focused).
     * - `null`: Normally, displaying a dialog removes the focus from the currently active element
     *   in the document (`document.activeElement`). By passing `null`, the currently active element
     *   is saved before the dialog is displayed and refocused after the dialog became visible (of
     *   course, this only works if `document.activeElement` is not `null`, otherwise the dialog
     *   itself is focused).\
     *   `null` can be useful for creating toolbars/palettes/overlays, etc. that do not destroy the
     *   current focus state when displayed.
     * @throws {DOMException} `DOMException.InvalidStateError` (if the dialog is already open and
     * modal).
     * @returns This instance.
     */
    show(focus) {
        return this.dispatch(new DialogShowEvent(this, false))
            ? this.doShow(focus)
            : this;
    }
    /**
     * Forcibly displays the dialog (non-modal) and adds the class name `non-modal` to the dialog.
     * `dlg-show` event handlers _are not called_ and thus _cannot_ prevent showing the dialog.
     * @param focus see {@link show()}
     * @throws {DOMException} `DOMException.InvalidStateError` (see {@link show()}).
     * @returns This instance.
     */
    forceShow(focus) {
        return this.doShow(focus);
    }
    /**
     * Displays the dialog (modal) and adds the class name `modal` to the dialog. If this is the
     * first modal dialog instance currently open, the class name `modal-dialog-first` is added to
     * the dialog. `dlg-show` event handlers may prevent showing the dialog.
     * @param focus The component to be focused after showing the dialog. `focus` can have the
     * following values:
     * - An instance of `IElementComponent`: if the instance is a child of this dialog this instance
     *   is focused, otherwise the dialog itself is focused.
     * - Not given or `undefined`: If the dialog is shown _for the first time_ the dialog will be
     *   focused. Subsequent calls to `show()` or `show(undefined)` try to focus the element that
     *   was active _immediately before the dialog was closed_ (if the dialog contains it, otherwise
     *   the dialog itself is focused).
     * @throws {DOMException} `DOMException.InvalidStateError` (if the dialog is already open and
     * non-modal).
     * @returns This instance.
     */
    async showModal(focus) {
        return this.dispatch(new DialogShowEvent(this, true))
            ? await this.doShowModal(focus)
            : this;
    }
    /**
     * Forcibly displays the dialog (modal) and adds the class name `modal` to the dialog. If this
     * is the first modal dialog instance currently open, the class name `modal-dialog-first` is
     * added to the dialog. `dlg-show` event handlers  _are not called_ and thus _cannot_ prevent
     * showing the dialog.
     * @param focus see {@link showModal()}
     * @throws {DOMException} `DOMException.InvalidStateError` (see {@link showModal()}).
     * @returns This instance.
     */
    async forceShowModal(focus) {
        return await this.doShowModal(focus);
    }
    /**
     * Closes the dialog.
     * @param returnValue An updated value for the `ReturnValue` of the dialog.
     * @returns This instance.
     */
    doClose(returnValue) {
        this.closedRegularly = true;
        this.Parent
            ? this.rsObserver.unobserve(this.Parent.DOM)
            : window.removeEventListener("resize", this.fncOnResize);
        const lastActive = document.activeElement;
        this.lastActiveElement = (lastActive instanceof HTMLElement && this.DOM.contains(lastActive)) ? lastActive : undefined;
        this.ui.close(returnValue);
        document.removeEventListener("pointerdown", this.fncOnNonModalPointerDown);
        this.off("pointerdown", this.fncOnModalPointerDown);
        if (this.state === DialogState.MODAL) {
            for (const dlg of Dialog.modals) {
                dlg.removeClass("modal-dialog-first");
            }
            const index = Dialog.modals.indexOf(this);
            (index !== -1) && Dialog.modals.splice(index, 1);
            Dialog.modals[0]?.addClass("modal-dialog-first");
            this.modalResolver?.();
        }
        else if (this.state === DialogState.NON_MODAL) {
            const index = Dialog.nonModals.indexOf(this);
            (index !== -1) && Dialog.nonModals.splice(index, 1);
            this.style("zIndex", null);
            this.setZIndexes();
        }
        if (!this.Parent) {
            this.DOM.remove();
        }
        this.state = DialogState.CLOSED;
        this.emit(new DialogClosedEvent(this, returnValue ?? this.ReturnValue, false));
        return this;
    }
    /**
     * See {@link show()} and {@link forceShow()}.
     * @param focus see {@link show()}
     * @throws {DOMException} `DOMException.InvalidStateError` (see {@link show()}).
     * @returns This instance.
     */
    doShow(focus) {
        this.addClass("non-modal", "--calc-size");
        const lastActive = document.activeElement;
        this.Parent || document.body.appendChild(this.DOM);
        document.addEventListener("pointerdown", this.fncOnNonModalPointerDown);
        this.ui.show();
        this.closedRegularly = false;
        this.state = DialogState.NON_MODAL;
        Dialog.nonModals.indexOf(this) === -1 && Dialog.nonModals.push(this);
        this.makeTopMost();
        this.placeDlg(this.getPosition());
        this.Parent
            ? this.rsObserver.observe(this.Parent.DOM)
            : window.addEventListener("resize", this.fncOnResize);
        this.removeClass("--calc-size");
        (focus === null && lastActive && lastActive instanceof HTMLElement
            ? lastActive
            : focus === undefined && this.lastActiveElement
                ? this.lastActiveElement
                : focus instanceof AElementComponent && this.contains(focus)
                    ? focus
                    : this).focus();
        this.emit(new DialogShownEvent(this, false));
        return this;
    }
    /**
     * See {@link showModal()} and {@link forceShowModal()}.
     * @param focus see {@link showModal()}
     * @throws {DOMException} `DOMException.InvalidStateError` (see {@link showModal()}).
     * @returns This instance.
     */
    async doShowModal(focus) {
        this.addClass("modal", "--calc-size");
        this.Parent || document.body.appendChild(this.DOM);
        this.on("pointerdown", this.fncOnModalPointerDown);
        this.ui.showModal();
        this.closedRegularly = false;
        this.state = DialogState.MODAL;
        const index = Dialog.modals.indexOf(this);
        index === -1
            ? Dialog.modals.push(this)
            : Dialog.modals.push(Dialog.modals.splice(index, 1)[0]);
        for (const dlg of Dialog.modals) {
            dlg.removeClass("modal-dialog-first");
        }
        Dialog.modals[0]?.addClass("modal-dialog-first");
        this.placeDlg(this.getPosition());
        this.Parent
            ? this.rsObserver.observe(this.Parent.DOM)
            : window.addEventListener("resize", this.fncOnResize);
        this.removeClass("--calc-size");
        (focus === undefined && this.lastActiveElement
            ? this.lastActiveElement
            : focus instanceof AElementComponent && this.contains(focus)
                ? focus
                : this).focus();
        this.emit(new DialogShownEvent(this, true));
        await new Promise(resolve => this.modalResolver = resolve);
        return this;
    }
    /**
     * Set the position and size of the dialog.
     * @param offset The left/top dialog offset (in pixels)
     * @param offset.X Horizontal offset.
     * @param offset.Y Vertical offset.
     * @param width The width of the dialog.
     * @param height The height of the dialog.
     * @returns This instance.
     */
    placeDlg(offset, width, height) {
        width !== undefined && this.style("width", width + "px");
        height !== undefined && this.style("height", height + "px");
        this
            .style({
            /* eslint-disable jsdoc/require-jsdoc */
            insetInlineStart: `${offset.X}px`,
            insetBlockStart: `${offset.Y}px`
            /* eslint-enable */
        });
        return this;
    }
    /**
     * Make the dialog the topmost dialog.
     * @param _ev The `focus` event.
     */
    makeTopMost(_ev) {
        if (this.state === DialogState.NON_MODAL) {
            const index = Dialog.nonModals.indexOf(this);
            index !== -1 && Dialog.nonModals.push(Dialog.nonModals.splice(index, 1)[0]);
            this.setZIndexes();
        }
    }
    /**
     * Changes the (CSS) Z-order of non-modal dialogs in ascending order. The dialog with the
     * highest Z-order becomes the topmost dialog.
     */
    setZIndexes() {
        let zIndex = Dialog.baseZIndex;
        for (const dlg of Dialog.nonModals) {
            // Just in case ...
            dlg.removeClass("modal-dialog-first");
            dlg.style("zIndex", (++zIndex).toString());
        }
    }
    /**
     * Keyboard handling for the dialog.
     * @param ev The keyboard event.
     */
    onKeyDown(ev) {
        switch (ev.key) {
            // case "Enter":
            //     break;
            case "Escape":
                ev.preventDefault();
                ev.stopImmediatePropagation();
                if (this._options.CloseWithEscape) {
                    this.cancel();
                }
                break;
            case "Tab":
                this._options.LockFocusInside
                    && !ev.ctrlKey
                    && !ev.altKey
                    && !ev.metaKey
                    && tabKeyFocusCycle(this.dlg.DOM, ev);
                break;
            default:
                return;
        }
    }
    /**
     * Handle window and parente resizing.
     */
    onResize() {
        this.state == DialogState.CLOSED || this.placeDlg(this.getPosition());
    }
    /**
     * Handle the `pointerdown` event on the document in non-modal state.
     * @param ev The pointer event.
     */
    onNonModalPointerDown(ev) {
        if (this._options.CloseWithClickOutside
            && ev.target
            && ev.target instanceof HTMLElement
            && !this.DOM.contains(ev.target)) {
            this.cancel();
        }
    }
    /**
     * Handle the `pointerdown` event on the dialog in modal state.
     * @param ev The pointer event.
     */
    onModalPointerDown(ev) {
        const rect = this.BoundingRect;
        if (ev.offsetX < 0
            || ev.offsetY < 0
            || ev.offsetX > rect.width
            || ev.offsetY > rect.height) {
            if (this._options.CloseWithClickOutside) {
                this.cancel();
            }
            else {
                ev.preventDefault();
                ev.stopImmediatePropagation();
            }
        }
    }
    /**
     * Handle the `pointerdown` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    onPointerDown(ev) {
        if (this.moving) {
            return;
        }
        if (ev.target instanceof HTMLElement
            && ((this._options.MoveHandle === this.contentContainer && ev.target === this._options.MoveHandle?.DOM)
                || (this._options.MoveHandle !== this.contentContainer && this._options.MoveHandle.DOM.contains(ev.target)))) {
            if (!this.dispatch(new DialogMoveStartEvent(this))) {
                return;
            }
            this.isRTL = this.DOM.parentElement !== null && getComputedStyle(this.DOM.parentElement).direction === "rtl";
            this.pointerDownStart.X = ev.clientX;
            this.pointerDownStart.Y = ev.clientY;
            this.moveStartPositionOffset.X = parseFloat(this.Style.insetInlineStart?.slice(0, -2)) || 0;
            this.moveStartPositionOffset.Y = parseFloat(this.Style.insetBlockStart?.slice(0, -2)) || 0;
            this.addClass("move-start");
            this._options.MoveHandle.DOM.setPointerCapture(ev.pointerId);
            this._options.MoveHandle.on("pointermove", this.fncOnPointerMove);
            this.moveResizeStart = true;
            this.moving = true;
        }
    }
    /**
     * Handle the `pointermove` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    onPointerMove(ev) {
        if (!this.moving) {
            return;
        }
        const offset = {
            /* eslint-disable jsdoc/require-jsdoc */
            X: ev.clientX - this.pointerDownStart.X,
            Y: ev.clientY - this.pointerDownStart.Y
            /* eslint-enable */
        };
        if (!this.dispatch(new DialogMoveEvent(this, offset))) {
            return;
        }
        if (this.moveResizeStart) {
            this.moveResizeStart = false;
            this._options.HCentered = false;
            this._options.VCentered = false;
            this
                .removeClass("h-centered", "v-centered", "move-start")
                .addClass("moving", "moved");
        }
        this._options.Position.X = this.moveStartPositionOffset.X + (this.isRTL ? -offset.X : offset.X);
        this._options.Position.Y = this.moveStartPositionOffset.Y + offset.Y;
        this.placeDlg(this._options.Position);
    }
    /**
     * Handle the `pointerup` event on the component that is the drag handle.
     * @param ev The pointer event.
     */
    onPointerUp(ev) {
        if (!this.moving) {
            return;
        }
        this.moveResizeStart = false;
        this.moving = false;
        this._options.MoveHandle?.DOM.releasePointerCapture(ev.pointerId);
        this._options.MoveHandle?.off("pointermove", this.fncOnPointerMove);
        this
            .removeClass("move-start")
            .addClass(this.hasClass("moving") ? "moved" : null)
            .removeClass("moving");
        this.emit(new DialogMovedEvent(this, { X: ev.clientX - this.pointerDownStart.X, Y: ev.clientY - this.pointerDownStart.Y })); // eslint-disable-line jsdoc/require-jsdoc
    }
    /**
     * Handle the `pointerdown` event on a resizer element.
     * @param ev The pointer event.
     */
    onResizerPointerDown(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (this.resizing || !(ev.target instanceof HTMLDivElement)) {
            return;
        }
        switch (ev.target) {
            case this.rsN:
                this.resizeDir = DlgResizers.N;
                break;
            case this.rsNE:
                this.resizeDir = DlgResizers.NE;
                break;
            case this.rsE:
                this.resizeDir = DlgResizers.E;
                break;
            case this.rsSE:
                this.resizeDir = DlgResizers.SE;
                break;
            case this.rsS:
                this.resizeDir = DlgResizers.S;
                break;
            case this.rsSW:
                this.resizeDir = DlgResizers.SW;
                break;
            case this.rsW:
                this.resizeDir = DlgResizers.W;
                break;
            case this.rsNW:
                this.resizeDir = DlgResizers.NW;
                break;
            default:
                return;
        }
        if (!this.dispatch(new DialogResizeStartEvent(this, this.resizeDir))) {
            return;
        }
        this.isRTL = this.DOM.parentElement !== null && getComputedStyle(this.DOM.parentElement).direction === "rtl";
        this.pointerDownStart.X = ev.clientX;
        this.pointerDownStart.Y = ev.clientY;
        const pos = this.getPosition();
        const rect = this.DOM.getBoundingClientRect();
        this.resizeStart.X = pos.X;
        this.resizeStart.Y = pos.Y;
        this.resizeStart.W = rect.width;
        this.resizeStart.H = rect.height;
        const gcs = getComputedStyle(this.DOM);
        this.minSize.W = parseFloat(gcs.minWidth.slice(0, -2)) || 0;
        this.minSize.H = parseFloat(gcs.minHeight.slice(0, -2)) || 0;
        this.maxSize.W = parseFloat(gcs.maxWidth.slice(0, -2)) || Infinity;
        this.maxSize.H = parseFloat(gcs.maxHeight.slice(0, -2)) || Infinity;
        this.addClass("resize-start");
        this.resizer = ev.target;
        this.resizer.setPointerCapture(ev.pointerId);
        this.resizer.addEventListener("pointermove", this.fncOnResizerPointerMove);
        this.moveResizeStart = true;
        this.resizing = true;
    }
    /**
     * Handle the `pointermove` event on a resizer element.
     * @param ev The pointer event.
     */
    onResizerPointerMove(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (!this.resizing) {
            return;
        }
        const offset = {
            /* eslint-disable jsdoc/require-jsdoc */
            X: ev.clientX - this.pointerDownStart.X,
            Y: ev.clientY - this.pointerDownStart.Y
            /* eslint-enable */
        };
        if (!this.dispatch(new DialogResizeEvent(this, this.resizeDir, offset))) {
            return;
        }
        let width = undefined;
        let height = undefined;
        const centered = typeof this._options.CenteredResize === "boolean"
            ? this._options.CenteredResize
            : this._options.CenteredResize(this);
        const fCentered = centered ? 2 : 1;
        const rss = this.resizeStart;
        const minSize = this.minSize;
        const maxSize = this.maxSize;
        const pos = this.moveResizeStart
            ? this.getPosition()
            : { ...this._options.Position };
        // - Return early if resizing violates the `minSize` constraint.
        // - For the edges and corners the offset and position have to be adjusted.
        let cv = false; // constraintViolation
        switch (this.resizer) {
            case this.rsN:
                height = rss.H - offset.Y;
                if (rss.H - offset.Y < minSize.H || rss.H - offset.Y > maxSize.H) {
                    return;
                }
                pos.Y = rss.Y + offset.Y / fCentered;
                break;
            case this.rsNE:
                width = rss.W + offset.X;
                if (rss.W + offset.X < minSize.W) {
                    offset.X = -(rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W + offset.X > maxSize.W) {
                    offset.X = -(rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H - offset.Y;
                if (rss.H - offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = rss.H - minSize.H;
                }
                if (rss.H - offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = rss.H - maxSize.H;
                }
                this.isRTL
                    ? pos.X = rss.X - offset.X / fCentered
                    : centered && (pos.X = rss.X - offset.X / fCentered);
                pos.Y = rss.Y + offset.Y / fCentered;
                break;
            case this.rsE:
                width = rss.W + offset.X;
                if ((rss.W + offset.X < minSize.W) || (rss.W + offset.X > maxSize.W)) {
                    return;
                }
                this.isRTL
                    ? pos.X = rss.X - offset.X / fCentered
                    : centered && (pos.X = rss.X - offset.X / fCentered);
                break;
            case this.rsSE:
                width = rss.W + offset.X;
                if (rss.W + offset.X < minSize.W) {
                    offset.X = -(rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W + offset.X > maxSize.W) {
                    offset.X = -(rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H + offset.Y;
                if (rss.H + offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - minSize.H);
                }
                if (rss.H + offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - maxSize.H);
                }
                this.isRTL
                    ? pos.X = rss.X - offset.X / fCentered
                    : centered && (pos.X = rss.X - offset.X / fCentered);
                centered && (pos.Y = rss.Y - offset.Y / fCentered);
                break;
            case this.rsS:
                height = rss.H + offset.Y;
                if (rss.H + offset.Y < minSize.H || rss.H + offset.Y > maxSize.H) {
                    return;
                }
                centered && (pos.Y = rss.Y - offset.Y / fCentered);
                break;
            case this.rsSW:
                width = rss.W - offset.X;
                if (rss.W - offset.X < minSize.W) {
                    offset.X = (rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W - offset.X > maxSize.W) {
                    offset.X = (rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H + offset.Y;
                if (rss.H + offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - minSize.H);
                }
                if (rss.H + offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = -(rss.H - maxSize.H);
                }
                this.isRTL
                    ? centered && (pos.X = rss.X + offset.X / fCentered)
                    : pos.X = rss.X + offset.X / fCentered;
                centered && (pos.Y = rss.Y - offset.Y / fCentered);
                break;
            case this.rsW:
                width = rss.W - offset.X;
                if ((rss.W - offset.X < minSize.W) || (rss.W - offset.X > maxSize.W)) {
                    return;
                }
                this.isRTL
                    ? centered && (pos.X = rss.X + offset.X / fCentered)
                    : pos.X = rss.X + offset.X / fCentered;
                break;
            case this.rsNW:
                width = rss.W - offset.X;
                if (rss.W - offset.X < minSize.W) {
                    offset.X = (rss.W - minSize.W);
                    cv = true;
                }
                if (rss.W - offset.X > maxSize.W) {
                    offset.X = (rss.W - maxSize.W);
                    cv = true;
                }
                height = rss.H - offset.Y;
                if (rss.H - offset.Y < minSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = (rss.H - minSize.H);
                }
                if (rss.H - offset.Y > maxSize.H) {
                    if (cv) {
                        return;
                    }
                    offset.Y = (rss.H - maxSize.H);
                }
                this.isRTL
                    ? centered && (pos.X = rss.X + offset.X / fCentered)
                    : pos.X = rss.X + offset.X / fCentered;
                pos.Y = rss.Y + offset.Y / fCentered;
                break;
            default:
                return;
        }
        if (this.moveResizeStart) {
            this.moveResizeStart = false;
            this._options.HCentered = false;
            this._options.VCentered = false;
            this
                .removeClass("h-centered", "v-centered", "resize-start")
                .addClass("resizing", "resized");
        }
        this._options.Position.X = pos.X;
        this._options.Position.Y = pos.Y;
        this.placeDlg(pos, Math.min(maxSize.W, Math.max(minSize.W, width ?? rss.W)), Math.min(maxSize.H, Math.max(minSize.H, height ?? rss.H)));
    }
    /**
     * Handle the `pointerup` event on a resizer element.
     * @param ev The pointer event.
     */
    onResizerPointerUp(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (!this.resizing) {
            return;
        }
        this.moveResizeStart = false;
        this.resizing = false;
        this.resizer?.releasePointerCapture(ev.pointerId);
        this.resizer?.removeEventListener("pointermove", this.fncOnResizerPointerMove);
        this.resizer = undefined;
        this.removeClass("resize-start")
            .addClass(this.hasClass("resizing") ? "resized" : null)
            .removeClass("resizing");
        this.emit(new DialogResizedEvent(this, this.resizeDir, { X: ev.clientX - this.pointerDownStart.X, Y: ev.clientY - this.pointerDownStart.Y })); // eslint-disable-line jsdoc/require-jsdoc
    }
    /**
     * Calculate the position of the dialog according to its current settings (offset, centered).
     * @returns An object containing the calculated position of the dialog.
     */
    getPosition() {
        const rect = this.DOM.getBoundingClientRect();
        return {
            /* eslint-disable jsdoc/require-jsdoc */
            X: this._options.HCentered
                ? (this.Parent ? this.Parent.DOM.clientWidth : window.innerWidth) / 2 - rect.width / 2 + this._options.Position.X
                : this._options.Position.X,
            Y: this._options.VCentered
                ? (this.Parent ? this.Parent.DOM.clientHeight : window.innerHeight) / 2 - rect.height / 2 + this._options.Position.Y
                : this._options.Position.Y
            /* eslint-enable */
        };
    }
    /** @inheritdoc */
    clearOwner() {
        for (const resizer of this.resizers) {
            resizer.remove();
            resizer.removeEventListener("pointerdown", this.fncOnResizerPointerDown);
            resizer.removeEventListener("pointerup", this.fncOnResizerPointerUp);
        }
        super.clearOwner();
    }
    /**
     * Build UI of the component.
     * @returns This instance.
     */
    buildUI() {
        this.ui = this.dlg = new Dialog$1()
            .append(this.contentContainer = new Div()
            .addClass("content"))
            .on("keydown", this.onKeyDown.bind(this))
            .on("focusin", this.makeTopMost.bind(this))
            /**
             * This handles the case where the internal `Dialog` DOM element is closed bypassing the
             * regular `close()` function of this instance. This would leave some properties in an
             * incorrect state and might not remove the DOM from its parent. The manual call of
             * `doClose()` fixes this.
             */
            .on("close", () => {
            this.closedRegularly || this.doClose(DLG_IRREGULAR_CLOSE);
        });
        this.resizers.push(this.rsN = document.createElement("div"), this.rsNE = document.createElement("div"), this.rsE = document.createElement("div"), this.rsSE = document.createElement("div"), this.rsS = document.createElement("div"), this.rsSW = document.createElement("div"), this.rsW = document.createElement("div"), this.rsNW = document.createElement("div"));
        const suffixes = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
        for (let i = 0; i < this.resizers.length; i++) {
            this.resizers[i].classList.add(`rs-${suffixes[i]}`);
            this.resizers[i].addEventListener("pointerdown", this.fncOnResizerPointerDown);
            this.resizers[i].addEventListener("pointerup", this.fncOnResizerPointerUp);
        }
        this.rsObserver = new ResizeObserver(() => {
            this.fncOnResize();
        });
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.contentContainer.DOM);
        return this;
    }
    static {
        /** Mixin the IChildren implementation (which targets `this.contentContainer`). */
        mixin(false, this, AChildren);
    }
}

/**
 * Returns a symbol with a unique description (UUID). This function should _always_ be used to
 * create symbols for buttons since it guarantees that button symbol constants are unique over the
 * complete application even if constants with the same name are used (e.g. imported from different
 * modules).
 * @returns A symbol with a unique description (UUID).
 */
function STD_DLG_BTN() {
    return Symbol(generateUUID());
}
/**
 * A special 'button' constant which, when passed as a member of {@link StdDlgOptions.Buttons}, will
 * create a visual separator instead of a real 'button'.
 */
const SEP = STD_DLG_BTN();
/**
 * A special 'button' constant which indicates, that the current standard dialog has not been
 * cancelled by clicking/pressing a provided button but instead by other means, e.g. by pressing the
 * `Escape` key. This symbol is intended to be used _only_ for this special case, it must not be
 * used as a symbol for a button nor in a translation map for button captions.
 */
const STD_DLG_CANCELLED = STD_DLG_BTN();
/**
 * Used as the dialog return value for every button that is not contained in the current dialog
 * return values map {@link StdDialog.ReturnValue}. This symbol must not be used as a symbol for a
 * button nor in a translation map for button captions.
 */
const UNKNOWN_BTN = STD_DLG_BTN();
/**
 * Predefined regulat buttons.
 * @todo Expand this list.
 */
/* eslint-disable jsdoc/require-jsdoc */
const btn_OK = STD_DLG_BTN();
const btn_YES = STD_DLG_BTN();
const btn_NO = STD_DLG_BTN();
const btn_CANCEL = STD_DLG_BTN();
const btn_REPEAT = STD_DLG_BTN();
const btn_TRY_AGAIN = STD_DLG_BTN();
const btn_APPLY = STD_DLG_BTN();
const btn_APPLY_ALT = STD_DLG_BTN();
const btn_CONTINUE = STD_DLG_BTN();
const btn_BACK = STD_DLG_BTN();
const btn_DONE = STD_DLG_BTN();
const btn_ENTER = STD_DLG_BTN();
const btn_SKIP = STD_DLG_BTN();
const btn_REJECT = STD_DLG_BTN();
const btn_CLOSE = STD_DLG_BTN();
const btn_ADD = STD_DLG_BTN();
const btn_REMOVE = STD_DLG_BTN();
const btn_DELETE = STD_DLG_BTN();
const btn_SUBMIT = STD_DLG_BTN();
const btn_RELOAD = STD_DLG_BTN();
const btn_SETTINGS = STD_DLG_BTN();
const btn_SETTINGS_ALT = STD_DLG_BTN();
const btn_INFO = STD_DLG_BTN();
const btn_INFO_ALT = STD_DLG_BTN();
const btn_INFO_PL = STD_DLG_BTN();
const btn_ABOUT = STD_DLG_BTN();
const btn_ABOUT_ALT = STD_DLG_BTN();
const btn_SAVE = STD_DLG_BTN();
const btn_SAVE_AS = STD_DLG_BTN();
const btn_SAVE_AS_ALT = STD_DLG_BTN();
const btn_COPY = STD_DLG_BTN();
const btn_CUT = STD_DLG_BTN();
const btn_PASTE = STD_DLG_BTN();
const btn_QUIT = STD_DLG_BTN();

/** English translations for the captions of the predefined buttons. */
const StdDlgI18N_EN = {
    /* eslint-disable jsdoc/require-jsdoc */
    [btn_OK]: "OK",
    [btn_YES]: "Yes",
    [btn_NO]: "No",
    [btn_CANCEL]: "Cancel",
    [btn_REPEAT]: "Repeat",
    [btn_TRY_AGAIN]: "Try again",
    [btn_APPLY]: "Apply",
    [btn_APPLY_ALT]: "Apply",
    [btn_CONTINUE]: "Continue",
    [btn_BACK]: "Back",
    [btn_DONE]: "Done",
    [btn_ENTER]: "Enter",
    [btn_SKIP]: "Skip",
    [btn_REJECT]: "Reject",
    [btn_CLOSE]: "Close",
    [btn_ADD]: "Add",
    [btn_REMOVE]: "Remove",
    [btn_DELETE]: "Delete",
    [btn_SUBMIT]: "Submit",
    [btn_RELOAD]: "Reload",
    [btn_SETTINGS]: "Settings ...",
    [btn_SETTINGS_ALT]: "Settings",
    [btn_INFO]: "Info",
    [btn_INFO_ALT]: "Information",
    [btn_INFO_PL]: "Information",
    [btn_ABOUT]: "About ...",
    [btn_ABOUT_ALT]: "About",
    [btn_SAVE]: "Save",
    [btn_SAVE_AS]: "Save as ...",
    [btn_SAVE_AS_ALT]: "Save as",
    [btn_COPY]: "Copy",
    [btn_CUT]: "Cut",
    [btn_PASTE]: "Paste",
    [btn_QUIT]: "Beenden",
    /* eslint-enable */
};

/**
 * Used as the caption for every button that is not contained in the current translation map for
 * button symbols (`StdDialogs.I18N` or instance of `StdDlgI18N` passed to the constructor).
 */
const I18N_UNKNOWN_BTN = "I18N_UNKNOWN_BTN";
/**
 * This class aims to ease the creation of common standard dialogs.
 * Standard dialogs often have the same structure: they have a title bar (optional), a content area
 * and a bar with buttons.\
 * In the content area, the user is shown a simple message, offered a selection, or presented with
 * an area containing several components. The user can close the dialog using one of the buttons,
 * whereby the button used is also the return value of the dialog. If a dialog to be created meets
 * these requirements, `StdDialog` helps with its creation.\
 * Although `StdDialog` can be used for each individual dialog if necessary, it is designed more for
 * creating such dialogs with simple functions that generate a suitable dialog with just a few
 * parameters, display it (usually modally), and return a value. Predefined examples are the
 * ready-made functions {@link msgDlg()}, {@link confirm()} and {@link queryInput()} in this module.
 * They also serve as examples of how to use `StdDialog`.\
 * __Notes:__
 * - `StdDialog` doesn't take regular buttons made out of components, instead JavaScript symbols are
 *   used to define them in a more abstract way. Internally `StdDialog` itself then creates buttons
 *   (`IconButton`) from the symbol definitions.
 * - Clicking/pressing any of the provided buttons always tries to close the dialog.
 */
class StdDialog {
    static i18n_ = StdDlgI18N_EN;
    redispatchedDlgClose = Symbol();
    options;
    dlg;
    buttons = new Map();
    disposed = false;
    /**
     * Create a new standard dialog.
     * @param options Options for the new standard dialog.
     */
    constructor(options) {
        this.options = {
            /* eslint-disable jsdoc/require-jsdoc */
            Title: options.Title,
            Content: Array.isArray(options.Content) ? options.Content.slice(0) : options.Content,
            Buttons: Array.isArray(options.Buttons) ? options.Buttons.slice(0) : options.Buttons,
            Focus: options.Focus,
            OnClose: options.OnClose,
            CloseFnc: this.closeDialogHandler.bind(this),
            Vertical: options.Vertical ?? false,
            ClassNames: Array.isArray(options.ClassNames) ? options.ClassNames.slice() : [options.ClassNames],
            I18N: options.I18N ? { ...options.I18N } : StdDialog.i18n_,
            DlgOptions: options.DlgOptions ? { ...options.DlgOptions } : {}
            /* eslint-enable */
        };
        options.CloseFnc = this.options.CloseFnc;
        this.buildDlg();
    }
    /**
     * Get/set the current static map of button captions to be used by default. If a different
     * translation map is required temporarily for a new standard dialog, this can be passed via
     * `options` in the constructor when the dialog is created (the static standard map is not
     * affected by this).
     */
    static get I18N() {
        return this.i18n_;
    }
    /** @inheritdoc */
    static set I18N(v) {
        this.i18n(v);
    }
    /**
     * Set the current static map of button captions to be used by default. If a different
     * translation map is required temporarily for a new standard dialog, this can be passed via
     * `options` in the constructor when the dialog is created (the static standard map is not
     * affected by this).
     * @param i18n The new map of button captions to be used by default.
     * @returns This class.
     */
    static i18n(i18n) {
        this.i18n_ = i18n;
        return this;
    }
    /**
     * Get a _copy_ of the current options of this standard dialog. Modifying this object has no
     * effect.
     */
    get Options() {
        this.checkDisposed();
        return {
            ...this.options,
            /* eslint-disable jsdoc/require-jsdoc */
            Title: this.options.Title,
            Content: Array.isArray(this.options.Content) ? [...this.options.Content.slice(0)] : this.options.Content,
            Buttons: Array.isArray(this.options.Buttons) ? [...this.options.Buttons.slice(0)] : this.options.Buttons,
            Focus: this.options.Focus,
            OnClose: this.options.OnClose,
            CloseFnc: this.options.CloseFnc,
            Vertical: this.options.Vertical,
            ClassNames: Array.isArray(this.options.ClassNames) ? this.options.ClassNames.slice() : [this.options.ClassNames],
            I18N: { ...this.options.I18N },
            DlgOptions: { ...this.options.DlgOptions },
            /* eslint-enable */
        };
    }
    /**
     * Get the `Dialog` component instance created by this standard dialog instance. Intended to be
     * used only if access to the dialog content is needed (`<someStdDialog.ElementChildren>`,
     * `<someStdDialog.Children>`), for example to read out the values of contained checkboxes or
     * similar. The last element of `ElementChildren`/`Children` is always a `Div` component that
     * contains the generated icon buttons.
     */
    get Dialog() {
        this.checkDisposed();
        return this.dlg;
    }
    /**
     * Access the internal `Dialog` component via a callback function. Useful for seamless chaining
     * when creating instances of this component.
     * @param cb A callback function that receives the current `Dialog` component instance and this
     * instance as parameters.
     * @see {@link StdDialog.Dialog}
     * @returns This instance.
     */
    dialog(cb) {
        cb(this.dlg, this);
        return this;
    }
    /**
     * Get the current return value of the dialog. This is the symbol that corresponds to the button
     * that has been clicked/pressed or the symbol {@link STD_DLG_CANCELLED}, if the dialog has been
     * cancelled by other means, e.g. by pressing the `Escape` key, if the underlying `Dialog`
     * instance was created with that option (`StdDlgOptions.DlgOptions.CloseWithEscape: true`).
     */
    get ReturnValue() {
        this.checkDisposed();
        const retVal = this.dlg.ReturnValue;
        return retVal === DLG_CANCELLED
            ? STD_DLG_CANCELLED
            : Array.isArray(this.options.Buttons)
                ? this.options.Buttons.find((e) => e.description === retVal) || UNKNOWN_BTN
                : this.options.Buttons.description === retVal
                    ? this.options.Buttons
                    : UNKNOWN_BTN;
    }
    /**
     * Get all buttons created by this standard dialog (as a copy, modifying this map has no effect
     * on the underlying internal map). Can be used to further manipulate individual buttons.
     */
    get Buttons() {
        this.checkDisposed();
        return new Map(this.buttons);
    }
    /**
     * `true`, if the dialog has been disposed of, otherwise `false`.
     */
    get Disposed() {
        return this.disposed;
    }
    /**
     * Displays the dialog (non-modal).
     */
    show() {
        this.checkDisposed();
        this.dlg.show();
    }
    /**
     * Displays the dialog (modal) and waits for the user to click/press one of the buttons provided
     * in the options passed to the constructor (which closes the dialog).
     * @returns The symbol corresponding to the button which was clicked/pressed. If the standard
     * dialog was created with the option `StdDlgOptions.DlgOptions.CloseWithEscape = true` it is
     * also possible to close the dialog by pressing `Escape`; in this case the returned value is
     * the symbol {@link STD_DLG_CANCELLED}.
     */
    async showModal() {
        this.checkDisposed();
        await this.dlg.showModal();
        return this.ReturnValue;
    }
    /**
     * Closes the dialog. Useful only if the dialog was shown non-modal.
     * @param returnValue An overridden/individual value for the `ReturnValue` of the dialog. This
     * does _not_ change the _current_ value of `ReturnValue` on the internal `Dialog` instance!
     */
    close(returnValue) {
        this.checkDisposed();
        this.dlg.close(returnValue);
    }
    /**
     * Disposes of this dialog instance and all of its resources. The instance is then unusable and
     * any access to its properties and functions throws an error. `dispose()` should always be
     * called when the dialog instance is no longer needed.
     */
    dispose() {
        this.checkDisposed();
        this.disposed = true;
        this.dlg.dispose();
        // @ts-expect-error ---
        this.dlg = undefined;
        // @ts-expect-error ---
        this.options = undefined;
        this.buttons.clear();
    }
    /**
     * Forcibly closes the dialog. An `OnClose` event handler (if present) _is not called_ and thus
     * _cannot_ prevent closing the dialog. If the dialog is already closed or disposed of, calling
     * the function has no effect.
     */
    closeDialogHandler() {
        (this.disposed || this.dlg.State === DialogState.CLOSED) || this.dlg.forceClose(DLG_CANCELLED);
    }
    /**
     * Checks, if this dialog instance is already disposed of. In this case an exception is thrown.
     */
    checkDisposed() {
        if (this.disposed) {
            throw new Error("This instance of StdDialog is already disposed of.");
        }
    }
    /**
     * Builds the dialog according to the options given in the constructor.
     */
    buildDlg() {
        this.checkDisposed();
        this.buttons.clear();
        this.dlg = new Dialog(this.options.DlgOptions)
            .addClass(Dialog.DefaultCSSClassName, "std-dialog", this.options.Vertical ? "vertical" : "horizontal", ...this.options.ClassNames)
            .append(this.options.Title !== undefined
            ? new Div()
                .addClass("stddlg-title-bar")
                .append(...(typeof this.options.Title === "function"
                ? this.options.Title(this)
                : Array.isArray(this.options.Title)
                    ? this.options.Title
                    : [this.options.Title]).map(e => typeof e === "string" ? new Text(e) : e))
            : undefined, new Div()
            .addClass("stddlg-content")
            .append(...(typeof this.options.Content === "function"
            ? this.options.Content(this)
            : Array.isArray(this.options.Content)
                ? this.options.Content
                : [this.options.Content]).map(e => typeof e === "string" ? new Text(e) : e)), new Div()
            .addClass("stddlg-btn-bar")
            .append(...(Array.isArray(this.options.Buttons)
            ? this.options.Buttons.map(e => e === SEP
                ? new Span().addClass("separator")
                : this.getButton(e))
            : [this.getButton(this.options.Buttons)])))
            .once("dlg-shown", () => {
            toFocus
                ? toFocus.focus()
                : document.activeElement?.blur?.();
        })
            .on("dlg-close", async (ev) => {
            if (ev.detail[this.redispatchedDlgClose]) {
                return;
            }
            if (ev.$.ReturnValue === DLG_CANCELLED) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                // `[true, undefined, null].includes`: be lenient, if the callback returns nothing.
                if (this.options?.OnClose && ![true, undefined, null].includes(await this.options.OnClose(STD_DLG_CANCELLED, this))) {
                    return;
                }
                const newEvent = new DialogCloseEvent(this.dlg, DLG_CANCELLED, true);
                newEvent.detail[this.redispatchedDlgClose] = true;
                if (this.dlg.dispatch(newEvent)) {
                    // `forceClose()` !!! Otherwise this would cause and endless `dlg-close`
                    // event loop!
                    this.dlg.forceClose(DLG_CANCELLED);
                }
            }
        });
        let toFocus;
        if (this.options.Focus && this.options.Focus instanceof AElementComponent) {
            toFocus = this.options.Focus;
        }
        else if (this.options.Focus === undefined) {
            toFocus = this.buttons.values().next().value;
        }
        else if (this.options.Focus === null) {
            toFocus = undefined;
        }
        else if (Array.isArray(this.options.Buttons)) {
            toFocus = this.buttons.get(this.options.Focus);
        }
        else {
            toFocus = this.buttons.values().next().value;
        }
    }
    /**
     * Creates a button for the dialog.
     * @param sym A symbol that denotes the button to be created.
     * @returns The button created.
     */
    getButton(sym) {
        this.checkDisposed();
        const btn = new IconButton({ Caption: [this.options.I18N[sym] || I18N_UNKNOWN_BTN] }) // eslint-disable-line jsdoc/require-jsdoc
            .addClass(IconButton.DefaultCSSClassName, "regular", "std-dlg-btn")
            .on("click", async () => {
            // `[true, undefined, null].includes`: be lenient, if the callback returns nothing.
            if (!this.options?.OnClose || [true, undefined, null].includes(await this.options.OnClose(sym, this))) {
                this.dlg.close(sym.description);
            }
        });
        this.buttons.set(sym, btn);
        return btn;
    }
}
/**
 * Displays a modal dialog with arbitray content. The dialog shows only the button `btn_OK` by
 * default (see also {@link BaseCommonDlgOptions.Buttons}). The dialog will be disposed of, when the
 * function returns.
 * @param content The content for the message dialog.
 * @param options Options for the message dialog.
 * @returns The button (symbol) which was clicked or the symbol {@link STD_DLG_CANCELLED}, if the
 * dialog was closed by pressing the `Escape` key.
 */
async function msgDlg(content, options) {
    const stdDlg = new StdDialog({
        /* eslint-disable jsdoc/require-jsdoc */
        Title: options?.Title,
        Content: content,
        Buttons: options?.Buttons ? [options?.Buttons].flat() : [btn_OK],
        Focus: options?.Focus === undefined
            ? [options?.Buttons].flat()[0] ?? btn_OK
            : options?.Focus === null
                ? null
                : options.Focus,
        OnClose: options?.OnClose,
        Vertical: options?.Vertical ?? false,
        ClassNames: ["msg-dlg", options?.ClassNames].flat(),
        I18N: options?.I18N,
        DlgOptions: options?.DlgOptions ? { ...options.DlgOptions } : {}
        /* eslint-enable */
    });
    options && (options.CloseFnc = stdDlg.Options.CloseFnc);
    // stdDlg.Buttons.get(btn_OK)?.addClass("default");
    const btn = await stdDlg.showModal();
    stdDlg.dispose();
    return btn;
}

class ExampleAppEventBus extends AEventBus {
}
// Must be globally available.
const EventBus = new ExampleAppEventBus("ExampleAppEventBus");

class DataAnalysis extends Div {
    constructor() {
        super();
        this
            .addClass("data-analysis")
            .append(new P("Data Analysis"), _.buttonRegular("Click to start lengthy data analysis operation")
            .on("click", async () => {
            EventBus.emit("OpStarted");
            const title = new P("Data Analysis");
            await APP.busy();
            try {
                await APP.sleep(1500);
            }
            finally {
                APP.idle();
                await msgDlg("Report has been submitted successfully!", {
                    Title: title,
                    ClassNames: ["analysis-result-dlg"],
                    DlgOptions: {
                        Movable: true,
                        MoveHandle: title,
                        CenteredResize: () => ModifierKeys.Shift,
                        // Resizers: DlgResizers.W | DlgResizers.E,
                        Resizers: DLG_RESIZERS_ALL,
                    },
                });
            }
            EventBus.emit("OpFinished");
        }));
    }
}

/**
 * Simple self-updating date/time component.
 */
class DateTime extends Text {
    #interval;
    constructor() {
        super();
        this.text(this.#now());
        this.#interval = setInterval(() => {
            // OK for a component derived from `Text` but for other components `Text`/`text()`
            // should/must take care of already existing child nodes/components.
            this.text(this.#now());
        }, 1000);
    }
    #now() {
        return new Date().toLocaleString(navigator.language, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }
    dispose() {
        clearInterval(this.#interval);
        super.dispose();
    }
}

class Intro extends Div {
    constructor() {
        super();
        this
            .addClass("intro")
            .append(new P(new Strong("Hello  world!"), new Br(), new Br(), "This application is a primitive yet comprehensive example for using some of the ", new Code("Vanilla.ts"), " components.", new Br(), new Br(), new DateTime()));
    }
}

class InvalidNavTarget extends Div {
    #invalidHref;
    constructor() {
        super();
        this
            .addClass("invalid-nav-target")
            .append(new P("Invalid navigation target: ", this.#invalidHref = new Code("")));
    }
    invalidNavTarget(href) {
        this.#invalidHref.text(href);
        return this;
    }
}

class Log extends Div {
    #log;
    constructor() {
        super();
        this
            .addClass("log")
            .append(this.#log = _.labeledTextArea("EventBus Log", "", undefined, 100)
            .addClass("log"));
        this.#log.TextArea
            .addClass("text-selectable")
            .readonly(true)
            .resizable("none")
            .wrap("off");
    }
    logEvent(name, payload, val) {
        this.#log.value(`${this.#log.Value ? this.#log.Value + "\n" : ""}'${name}' event received with payload '${payload ?? "undefined"}': ${val ?? "undefined"}`);
        this.#log.TextArea.DOM.scrollTop = this.#log.TextArea.DOM.scrollHeight;
    }
    /** @inheritdoc */
    onDidMount(parent) {
        super.onDidMount(parent);
        this.#log.TextArea.DOM.scrollTop = this.#log.TextArea.DOM.scrollHeight;
    }
}

class NavLink extends AElementComponentWithInternalUI {
    #a;
    constructor(href, text) {
        super();
        this.initialize(undefined, href, text);
    }
    get Href() {
        return this.#a.Href;
    }
    set Href(v) {
        this.#a.href(v);
    }
    get Text() {
        return this.#a.Text ?? "";
    }
    set Text(v) {
        this.#a.text(v);
    }
    buildUI(href, text) {
        this.ui = new LiUl(this.#a = new A(href, text));
        return this;
    }
}

/**
 * A collapsible container for navigation links. This component uses `DisclosureContainer` interally
 * without exposing all of its features (only `disclosed()`). This component also re-exports the
 * event map from `DisclosureContainer`. This makes it easier to add listeners to this class which
 * are specific to `DisclosureContainer`.
 */
class NavigationBar extends AElementComponentWithInternalUI {
    constructor() {
        super();
        this.initialize();
    }
    /**
     * Disclose/undisclose this component.
     * @param disclosed `true`, if the state of the internal disclosure container shall be
     * 'disclosed', otherwise `false`.
     * @returns This instance.
     */
    disclosed(disclosed) {
        this.ui.disclosed(disclosed);
        return this;
    }
    clearOwner() {
        console.log("nav bar clear owner");
        super.clearOwner();
    }
    /** @inheritdoc */
    buildUI() {
        this.ui = _.disclosureContainer("Navigation")
            .addClass("navigation-bar")
            .appearance(DisclosureContainerAppearance.START_TOP)
            // .animatable(true)
            .on("disclose", (ev) => EventBus.emit("DiscloseNavigationBar", ev.$.Disclosed));
        const linkList = new Ul();
        this.setChildrenDOMTarget(linkList.DOM);
        this.append(new NavLink("#intro", "Intro"), new NavLink("#data-analysis", "Data Analysis"), new NavLink("#log", "Log"));
        this.ui.append(new Nav(linkList));
        return this;
    }
    static {
        /** Mixin the IChildren implementation (which targets the internal unordered list). */
        mixin(false, this, AChildren);
    }
}
/* eslint-disable jsdoc/require-jsdoc */
// new NavigationBar()
//     .append(new NavLink("#intro", "Intro"))
//     .append(new NavLink("#data-analysis", "Data Analysis"))
//     .append(new NavLink("#log", "Log"));
// .append(new P(""));
// class navlink2 extends NavLink {
//     Bla: string;
//     constructor() {
//         super("", "");
//     }
// }
// class XY<Child extends navlink2 = navlink2> extends NavigationBar<Child> {
// class XY extends NavigationBar<navlink2> {
//     constructor() {
//         super();
//         this.append(new navlink2());
//     }
// }
// const xy = new XY();
// xy.append(new navlink2());
// xy.append(new NavLink("", ""));
// xy.append(new P(""));
/* eslint-enable */

/**
 * Global UI factory class. Should be used to obtain all instances of components that are to be
 * automatically decorated with a corresponding class name.
 */
const ComponentFactory = mixinComponentFactories(CSSClassNameFactory, BusyOverlayFactory, DisclosureContainerFactory, SplitterFactory, LabeledTextAreaFactory, ButtonFactory);
const _ = new ComponentFactory("vts", false);
/**
 * The main app class. This is where the app is initialized and all components are put together.
 * It also allows access to the main components (header, main, footer, navigation bar, content) via
 * getter properties.
 */
class ExampleApp extends VTSApplication {
    #busyOverlay;
    #header;
    #main;
    #footer;
    #splitter;
    #navigationBar;
    #contentContainer;
    #intro;
    #dataAnalysis;
    #log;
    #invalidNavTarget;
    /**
     * Ctor `ExampleApp`.
     * @param rootElement The root element where the app is to be mounted.
     */
    constructor(rootElement) {
        super(rootElement);
        this.rootElement.translate = false;
    }
    get Header() {
        return this.#header;
    }
    get Main() {
        return this.#main;
    }
    get Footer() {
        return this.#footer;
    }
    get Splitter() {
        return this.#splitter;
    }
    get NavigationBar() {
        return this.#navigationBar;
    }
    get Content() {
        return this.#contentContainer;
    }
    get Intro() {
        return this.#intro;
    }
    get Data() {
        return this.#dataAnalysis;
    }
    get Log() {
        return this.#log;
    }
    /**
     * Initialize the app. This is where all components are created and assembled together. Also
     * sets up listeners for all known (event bus) events.
     * @returns This instance.
     */
    initialize() {
        this.#busyOverlay = _.busyOverlay(250, false);
        // Basic frame layout.
        this.#header = new Header("Header");
        this.#main = new Main();
        this.#footer = new Footer("Footer");
        // Main splitter and navigation bar.
        this.#createSplitter();
        this.#createNavigationBar();
        // Content components.
        this.#contentContainer = new ContentContainer();
        this.#intro = new Intro();
        this.#dataAnalysis = new DataAnalysis();
        this.#log = new Log();
        this.#invalidNavTarget = new InvalidNavTarget();
        // Populate and append the main splitter.
        this.#splitter.Start.append(this.#navigationBar);
        this.#splitter.End.append(this.#contentContainer);
        this.#main.append(this.#splitter);
        // Setup all event handlers.
        this.#initEvents();
        // Handle the initial navigation target.
        this.#navigate(document.location.hash || "#intro");
        // Mount everything.
        this.append(this.#header, this.#main, this.#footer);
        return this;
    }
    /**
     * Show a 'busy' overlay.
     * @param delay The delay after which the busy overlay is to be shown.
     * @returns This instance.
     */
    async busy(delay) {
        await this.#busyOverlay.busy(delay);
        return this;
    }
    /**
     * Hide the current 'busy' overlay.
     * @returns This instance.
     */
    idle() {
        this.#busyOverlay.idle();
        return this;
    }
    /**
     * The classic sleep function.
     * @param duration The duration to sleep in milliseconds.
     * @returns A promise that resolves after the specified duration.
     */
    async sleep(duration) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }
    /**
     * Set up listeners for all known (event bus) events.
     */
    #initEvents() {
        // Log global events to the log area.
        EventBus
            .on("AppLoaded", (duration) => this.#log.logEvent("AppLoaded", "duration", duration + "ms"))
            .on("Navigate", (href) => this.#log.logEvent("Navigate", "href", href))
            .on("DiscloseNavigationBar", (disclosed) => this.#log.logEvent("DiscloseNavigationBar", "disclosed", disclosed))
            .on("OpStarted", () => this.#log.logEvent("OpStarted"))
            .on("OpFinished", () => this.#log.logEvent("OpFinished"));
        // Handle navigation events.
        window.addEventListener("popstate", (_event) => this.#navigate(document.location.hash));
    }
    /**
     * Primitive handling of navigation events. This is where the content of the main area is
     * switched based on the navigation target.
     * @param href The navigation target
     */
    #navigate(href) {
        EventBus.emit("Navigate", href);
        const current = this.#contentContainer.Children[0];
        let target = undefined;
        switch (href) {
            case "#intro":
                target = this.#intro;
                break;
            case "#data-analysis":
                target = this.#dataAnalysis;
                break;
            case "#log":
                target = this.#log;
                break;
            default:
                target = this.#invalidNavTarget.invalidNavTarget(href);
                break;
        }
        target && current !== target && this.#contentContainer.remove(current).append(target);
    }
    /**
     * Set up the splitter with the navigation bar and the main content area. Also sets up listeners
     * to automatically collapse the navigation bar when the splitter area is resized to be smaller
     * than 50px and to sync the navigation bar's disclosed state with the splitter's collapsed
     * state.
     * @returns The splitter instance.
     */
    #createSplitter() {
        return this.#splitter = _.splitter({
            ActiveAreaSize: "12rem",
            StartMinSize: "12rem",
            EndMinSize: "40rem",
            // This size is 'configurable' via CSS (see `Vars.css`).
            CollapsedStartSize: getComputedStyle(document.documentElement).getPropertyValue("--app-splitter-collapsed-size") || "2.5rem"
        })
            .on("splitter-area-resize", (ev) => {
            // Collapse the start area, if it's resized to be smaller than 50px.
            if (ev.$.DesiredSize < ev.$.Size && ev.$.DesiredSize < 50) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                queueMicrotask(() => {
                    this.#splitter.options({ Collapsed: SplitterCollapsedState.START });
                });
            }
            // Doing the same for the end area would require to evaluate this expression:
            //
            // (ev.$.DesiredSize > ev.$.Size && (this.#splitter.DOM.clientWidth - ev.$.DesiredSize < 50))
            //
            // But with the current layout doing so makes no sense.
        })
            // Disclose/undisclose the navigation bar, if the splitter is collapsed/uncollapsed.
            .on("splitter-collapsed", (ev) => this.#navigationBar.disclosed(ev.$.State === SplitterCollapsedState.NONE));
    }
    /**
     * Create the navigation bar. Also sets up a listener to sync the splitter's collapsed state
     * with the navigation bar's disclosed state.
     * @returns The navigation bar instance.
     */
    #createNavigationBar() {
        return this.#navigationBar = new NavigationBar()
            .on("disclose", (ev) => {
            // Sync the splitter's collapsed state with the navigation bar's disclosed state.
            this.#splitter.options({
                Collapsed: ev.$.Disclosed ? SplitterCollapsedState.NONE : SplitterCollapsedState.START,
            });
        });
    }
}

const start = Date.now();
/** Create and mount the example app to the document body. */
const app = new ExampleApp(document.body);
/** Make this app instance globally available.  */
const APP = app;
/** Initialize the app. */
app.initialize();
EventBus.emit("AppLoaded", Date.now() - start);

export { APP };
//# sourceMappingURL=index.js.map
