(function () {
    'use strict';

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
    (() => {
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
     * Checks whether the coordinates of a point lie within a rectangle. 'Within' is also fulfilled if
     * the point lies exactly on one edge or two edges of the rectangle.
     * @param rect The rectangle.
     * @param point The point.
     * @returns `true`, if `point` is inside `rect`, otherwise `false`.
     */
    function rectContains(rect, point) {
        return (point.x >= rect.left)
            && (point.y >= rect.top)
            && (point.x <= rect.right)
            && (point.y <= rect.bottom);
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
     * Checks a value against the boundaries of `boundary1` and `boundary2`.
     * @param n The value to check against the boundaries given by `boundary1` and `boundary2`.
     * @param boundary1 One end of the range to check against.
     * @param boundary2 The other end of the range to check against.
     * @returns `n`, if `n` is equal to `boundary1` or `boundary2` or lies between `boundary1` and
     * `boundary2` or the boundary which is nearest to `n` (`boundary1` or `boundary2`).\
     * __Note:__ Contrary to https://github.com/tc39/proposal-math-clamp?tab=readme-ov-file#examples
     * this implementation does not throw a `RangeError` if `boundary1` is greater than `boundary2`!
     */
    function clamp(n, boundary1, boundary2) {
        return boundary1 === boundary2
            ? boundary1
            : boundary1 < boundary2
                ? Math.max(Math.min(n, boundary2), boundary1)
                : Math.max(Math.min(n, boundary1), boundary2);
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
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID.bind(crypto)
        : () => {
            return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16));
        };
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
    class ComponentFactory extends AComponentFactory {
        setupComponent(component, _data) {
            return component;
        }
    }
    /**
     * A factory that sets the CSS class of a component based on the components class name.
     */
    class CSSClassNameFactory extends ComponentFactory {
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
    class VTSApplication extends ComponentFactory {
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
     * This file contains various abstract classes that have default implementations of DOM attributes
     * and properties that are used in some DOM components. These attributes/properties are added as
     * mixins to some DOM components to avoid repeating the code in the components themselves.
     *
     * To prevent circular dependencies and reference/initialization errors due to module
     * loading/execution these classes must not be used from classes in this project! The only exception
     * to this rule is currently the {@link Option} component (in this module) which is used by the
     * {@link DataListAttr} DOM property class.
     * ---
     * @todo Extend with more DOM attributes/properties/utility DOM components.
     */
    /////////////////////////////
    // #region Attributes
    /**
     * 'Alt' getter/setter and set method returning this instance.
     */
    class AltAttr extends AElementComponent {
        /**
         * Get/set the `alt` attribute value of the component. `null` or an empty string removes the
         * attribute.
         */
        get Alt() {
            return this._dom.alt;
        }
        /** @inheritdoc */
        set Alt(v) {
            this.alt(v);
        }
        /**
         * Set `alt` attribute value of the component.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @returns This instance.
         */
        alt(v) {
            this.attrib("alt", v);
            return this;
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
    /**
     * Custom 'checked' event for checkboxes and radio buttons. Like `change` and `input` this event is
     * only emitted on user input, not on checking/unchecking the checkbox or radio button by code!
     */
    class CheckedEvent extends ACustomComponentEvent {
    }
    /**
     * 'Checked' getter/setter and set method returning this instance.
     */
    class CheckedAttr extends AElementComponent {
        /**
         * Get/set the `checked` attribute value of the component (`checkbox` or `radio`).\
         * __Note:__ Only supported for the input elements of the types `checkbox` and `radio`.
         */
        get Checked() {
            return this._dom.checked;
        }
        /** @inheritdoc */
        set Checked(v) {
            this.checked(v);
        }
        /**
         * Set `checked` attribute value of the component (`checkbox` or `radio`).
         * @param v The value to be set.
         * __Note:__ Only supported for the input elements of the types `checkbox` and `radio`.
         * @returns This instance.
         */
        checked(v) {
            // Only valid for `checkbox` but causes no problems for `radio`.
            this._dom.indeterminate = false;
            this._dom.checked = v;
            return this;
        }
        /**
         * Toggle the `checked` attribute value of the component (`checkbox` or `radio`).
         * __Note:__ Only supported for the input elements of the types `checkbox` and `radio`.
         * @returns This instance.
         */
        toggleChecked() {
            this.checked(!this._dom.checked);
            return this;
        }
    }
    /**
     * 'CrossOrigin' getter/setter and set method returning this instance.
     */
    class CrossOriginAttr extends AElementComponent {
        /**
         * Get/set the `crossorigin` attribute value of the component. Allowed values are `anonymous`,
         * `use-credentials` an empty string and `null` (both of the latter remove the attribute).
         */
        get CrossOrigin() {
            return this._dom.crossOrigin;
        }
        /** @inheritdoc */
        set CrossOrigin(v) {
            this._dom.crossOrigin = v;
        }
        /**
         * Set `crossorigin` attribute value of the component. Allowed values are `anonymous`,
         * `use-credentials` an empty string and `null` (both of the latter remove the attribute).
         * @param v The value to be set.
         * @returns This instance.
         */
        crossOrigin(v) {
            this.attrib("crossorigin", v);
            return this;
        }
    }
    /**
     * 'DataList' (suggestion values) getter/setter and set method returning this instance.\
     * __Note:__ Only some inputs can have a 'DataList' attribute (`list` attribute).
     * @see `@vanilla-ts/core HTMLInputsWithDataList`
     */
    class DataListAttr extends AElementComponent {
        /**
         * Get/set the datalist (suggestion values) of the component. If the length of `values` is `0`,
         * the attribute is removed.
         */
        get DataList() {
            const result = [];
            const dataListID = this.attr("list");
            if (dataListID) {
                const dataList = this._dom.querySelector("#" + dataListID);
                if (dataList) {
                    for (const option of dataList.querySelectorAll("option")) {
                        result.push(option.value);
                    }
                }
            }
            return result;
        }
        /** @inheritdoc */
        set DataList(values) {
            this.dataList(values);
        }
        /**
         * Set new suggestion values.
         * @param values The new suggestion values. If the length of `values` is `0`, the attribute is
         * removed.
         * @returns This instance.
         */
        dataList(values) {
            let dataListID = this.attr("list");
            if (!dataListID) {
                if (values.length === 0) {
                    return this;
                }
                dataListID = `dl${cid().slice(1)}`;
            }
            let dataList = document.getElementById(dataListID);
            if (dataList && values.length === 0) {
                this.attrib("list", null);
                dataList.remove();
                return this;
            }
            if (!dataList) {
                dataList = document.createElement("datalist");
                dataList.id = dataListID;
                this.attrib("list", dataListID);
                this._dom.appendChild(dataList);
            }
            while (dataList.lastChild) {
                dataList.lastChild.remove();
            }
            for (const value of values) {
                const option = document.createElement("option");
                option.value = value;
                dataList.append(option);
            }
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
     * 'Loading' getter/setter and set method returning this instance.
     */
    class LoadingAttr extends AElementComponent {
        /**
         * Get/set the `loading` attribute value of the component. Allowed values are `lazy`, `eager`
         * and `null`. `null` or an empty string removes the attribute.
         */
        get Loading() {
            return this._dom.loading;
        }
        /** @inheritdoc */
        set Loading(v) {
            this.loading(v);
        }
        /**
         * Set `loading` attribute value of the component. Allowed values are `lazy`, `eager` and
         * `null`. `null` or an empty string removes the attribute.
         * @param v The value to be set.
         * @returns This instance.
         */
        loading(v) {
            this.attrib("loading", v);
            return this;
        }
    }
    /**
     * 'Min/Max' getter/setter and set method returning this instance.
     */
    class MinMaxAttr extends AElementComponent {
        /**
         * Get/set the `min` attribute value of the component. `null` or an empty string removes the
         * attribute.
         */
        get Min() {
            return this._dom.min;
        }
        /** @inheritdoc */
        set Min(v) {
            this.min(v);
        }
        /**
         * Set `min` attribute value of the component.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @returns This instance.
         */
        min(v) {
            this.attrib("min", v);
            return this;
        }
        /**
         * Get/set the `max` attribute value of the component. `null` removes the attribute.
         */
        get Max() {
            return this._dom.max;
        }
        /** @inheritdoc */
        set Max(v) {
            this.max(v);
        }
        /**
         * Set `max` attribute value of the component.
         * @param v The value to be set. `null` removes the attribute.
         * @returns This instance.
         */
        max(v) {
            this.attrib("max", v);
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
     * 'Multiple' getter/setter and set method returning this instance.
     */
    class MultipleAttr extends AElementComponent {
        /**
         * Get/set the `multiple` attribute of the component.
         */
        get Multiple() {
            return this._dom.multiple;
        }
        /** @inheritdoc */
        set Multiple(v) {
            this._dom.multiple = v;
        }
        /**
         * Sets the `multiple` attribute of the component.
         * @param v The value to be set.
         * @returns This instance.
         */
        multiple(v) {
            this._dom.multiple = v;
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
     * 'Pattern' getter/setter and set method returning this instance.
     */
    class PatternAttr extends AElementComponent {
        /**
         * Get/set the `pattern` attribute value of the component. `null` or an empty string removes the
         * attribute.
         */
        get Pattern() {
            return this._dom.pattern;
        }
        /** @inheritdoc */
        set Pattern(v) {
            this.pattern(v);
        }
        /**
         * Set `pattern` attribute value of the component.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @returns This instance.
         */
        pattern(v) {
            this.attrib("pattern", v);
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
     * 'Size' getter/setter and set method returning this instance.
     */
    class SizeAttr extends AElementComponent {
        /**
         * Get/set the `size` attribute value of the component. A value lower than or equal to `0` or
         * `null` or an empty string removes the attribute.
         */
        get Size() {
            return this._dom.size;
        }
        /** @inheritdoc */
        set Size(v) {
            this.size(v);
        }
        /**
         * Set `size` attribute value of the component.
         * @param v The value to be set. A value lower than or equal to `0` or `null` or an empty string
         * removes the attribute.
         * @returns This instance.
         */
        size(v) {
            this.attrib("size", v === null ? null : v <= 0 ? null : v.toString());
            return this;
        }
    }
    /**
     * 'Src' getter/setter and set method returning this instance.
     */
    class SrcAttr extends AElementComponent {
        /**
         * Get/set the `src` attribute value of the component. `null` or an empty string removes the
         * attribute.
         */
        get Src() {
            return this._dom.src;
        }
        /** @inheritdoc */
        set Src(v) {
            this.src(v);
        }
        /**
         * Set `src` attribute value of the component.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @returns This instance.
         */
        src(v) {
            this.attrib("src", v);
            return this;
        }
    }
    /**
     * 'Step' getter/setter and set method returning this instance.
     */
    class StepAttr extends AElementComponent {
        /**
         * Get/set the `step` attribute value of the component. `null` or an empty string removes the
         * attribute.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number#controlling_step_size
         */
        get Step() {
            return this._dom.step;
        }
        /** @inheritdoc */
        set Step(v) {
            this.step(v);
        }
        /**
         * Set `step` attribute value of the component.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number#controlling_step_size
         * @returns This instance.
         */
        step(v) {
            this.attrib("step", v);
            return this;
        }
        /**
         * Decrement the value of this component.
         * @param n The amount to decrement, default `1`. Any other value is a multiplier of the step
         * attribute value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/stepDown
         * @returns This instance.
         */
        stepDown(n = 1) {
            this._dom.stepDown(n);
            return this;
        }
        /**
         * Increment the value of this component.
         * @param n The amount to increment, default `1`. Any other value is a multiplier of the step
         * attribute value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/stepUp
         * @returns This instance.
         */
        stepUp(n = 1) {
            this._dom.stepUp(n);
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
    /**
     * 'Width' and 'Height' (string|number) getter/setter and set method returning this instance.\
     * __Note:__ This is a hybrid attribute: for some elements the type of `width`/`height` is `string`
     * while for others the type is `number`.
     */
    class WidthHeightAttr extends AElementComponent {
        /**
         * Get/set the `width` attribute value of the component.
         */
        get Width() {
            return this._dom.width;
        }
        /** @inheritdoc */
        set Width(v) {
            this._dom.width = v;
        }
        /**
         * Set `width` attribute value of the component.
         * @param v The value to be set.
         * @returns This instance.
         */
        width(v) {
            this._dom.width = v;
            return this;
        }
        /**
         * Get/set the `height` attribute value of the component.
         */
        get Height() {
            return this._dom.height;
        }
        /** @inheritdoc */
        set Height(v) {
            this._dom.height = v;
        }
        /**
         * Set `height` attribute value of the component.
         * @param v The value to be set.
         * @returns This instance.
         */
        height(v) {
            this._dom.height = v;
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
    let Text$1 = class Text extends ANodeComponent {
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
    };

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
                ? this.append(new Text$1(href))
                : this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
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
     * Address component (`<address>`).
     */
    class Address extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Address component.
         * @param children The content for the `<address>` element.
         */
        constructor(...children) {
            super("address");
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
    }

    /**
     * B component (`<b>`).
     */
    class B extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create B component.
         * @param phrase The phrasing content for the `<b>` element.
         */
        constructor(...phrase) {
            super("b");
            phrase.length > 0 && this.phrase(...phrase);
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
     * Factory for `Br` components.
     */
    class BrFactory extends ComponentFactory {
        /**
         * Create, set up and return Br component.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns Br component.
         */
        br(data) {
            return this.setupComponent(new Br(), data);
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
    class ButtonFactory extends ComponentFactory {
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
     * Canvas component (`<canvas>`).
     */
    class Canvas extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Canvas component.
         * @param alternativeContent Alternative content for the `<canvas>` element.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas#alternative_content
         */
        constructor(...alternativeContent) {
            super("canvas");
            this.append(...alternativeContent.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (WidthHeightAttr));
        }
    }

    /**
     * Abstract base Input component (`<input>`).\
     * __Note:__ This class has mixins for the properties `readonly`, `required`, `dirName`, `multiple`
     * and `value`, however, some input elements don't support these attributes, but since the vast
     * majority supports them, they are included here. Nevertheless some derived classes may have to
     * override the properties, e.g. `readonly` isn't supported for checkboxes, `dirName` isn't
     * supported  for `datetime-local`, `multiple` only exist for the types `email` and `file` etc.
     */
    class Input extends ElementComponentVoid {
        static valuePropDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        static valueAsDatePropDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "valueAsDate");
        static valueAsNumberPropDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "valueAsNumber");
        // @ts-expect-error ---
        #brand;
        type;
        /**
         * Create Input component.
         * @param type The type (attribute) of the input component.
         * @param id The id (attribute) of the input component. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the input element.
         * @param name The name (attribute) of the input component.
         */
        constructor(type, id, value, name) {
            super("input");
            this.type = type;
            this._dom.type = this.type;
            id === undefined
                ? this.id(cid())
                : id && this.id(id);
            value && this.value(value);
            name && this.name(name);
        }
        /**
         * Get type (attribute) of the input element.
         */
        get Type() {
            return this.type;
        }
        /**
         * Get validity of the input element.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/validity
         */
        get Validity() {
            return this._dom.validity;
        }
        /**
         * Get validation constraints that the `<input>` component does not satisfy (if any).
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/validationMessage
         */
        get ValidationMessage() {
            return this._dom.validationMessage;
        }
        /**
         * Get/set the `valueAsDate` attribute of the component.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/valueAsDate
         */
        get ValueAsDate() {
            return this._dom.valueAsDate;
        }
        /** @inheritdoc */
        set ValueAsDate(v) {
            this.valueAsDate(v);
        }
        /**
         * Set the `valueAsDate` attribute of the component.
         * @param v The value to be set.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/valueAsDate
         * @returns This instance.
         */
        valueAsDate(v) {
            this._dom.valueAsDate = v;
            return this;
        }
        /**
         * Get/set the `valueAsNumber` attribute of the component.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/valueAsNumber
         */
        get ValueAsNumber() {
            return this._dom.valueAsNumber;
        }
        /** @inheritdoc */
        set ValueAsNumber(v) {
            this.valueAsNumber(v);
        }
        /**
         * Set the `valueAsNumber` attribute of the component.
         * @param v The value to be set.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/valueAsNumber
         * @returns This instance.
         */
        valueAsNumber(v) {
            this._dom.valueAsNumber = v;
            return this;
        }
        /**
         * Patch the `value`, `valueAsDate` and `valueAsNumber` properties of the underlying DOM element
         * to call the corresponding `onValue*()` function of the owner component when they are set.
         * @param owner The owner component.
         * @returns This instance.
         */
        supportOnValueCallbacks(owner) {
            /* eslint-disable jsdoc/require-jsdoc */
            Object.defineProperty(this._dom, "value", {
                enumerable: true,
                configurable: true,
                get() { return Input.valuePropDesc?.get?.call(this); },
                set(newVal) { Input.valuePropDesc?.set?.call(this, newVal); owner.onValue?.(); }
            });
            Object.defineProperty(this._dom, "valueAsDate", {
                enumerable: true,
                configurable: true,
                get() { return Input.valueAsDatePropDesc?.get?.call(this); },
                set(newVal) { Input.valueAsDatePropDesc?.set?.call(this, newVal); owner.onValueAsDate?.(); }
            });
            Object.defineProperty(this._dom, "valueAsNumber", {
                enumerable: true,
                configurable: true,
                get() { return Input.valueAsNumberPropDesc?.get?.call(this); },
                set(newVal) { Input.valueAsNumberPropDesc?.set?.call(this, newVal); owner.onValueAsNumber?.(); }
            });
            /* eslint-enable jsdoc/require-jsdoc */
            return this;
        }
        /**
         * Restore the original `value`, `valueAsDate` and `valueAsNumber` properties of the underlying
         * DOM element.
         * @see {@link Input.supportOnValueCallbacks}
         * @returns This instance.
         */
        unsupportOnValueCallbacks() {
            Object.defineProperty(this._dom, "value", Input.valuePropDesc);
            Object.defineProperty(this._dom, "valueAsDate", Input.valueAsDatePropDesc);
            Object.defineProperty(this._dom, "valueAsNumber", Input.valueAsNumberPropDesc);
            return this;
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (AutocompleteAttr), (DataListAttr), (NameAttr), (ValueAttr), (NativeDisabledAttr), (RequiredAttr), (ReadonlyAttr));
        }
    }

    /**
     * Checkbox component (`<input type="checkbox">`) extended with a 'Checked' getter/setter and set
     * method and also with a custom event `checked` that signals checking/unchecking the checkbox.
     */
    class Checkbox extends Input {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Checkbox component.
         * @param id The id (attribute) of the checkbox. If `id` is `undefined` or omitted, a unique ID
         * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
         * will be set. Any other value will be used as the id attribute.
         * @param value The value of the checkbox. If omitted, it defaults to the value `on` (see
         * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox#value_2).
         * @param name The name (attribute) of the checkbox.
         * @param checked `true`, if the checkbox should be checked, otherwise false.
         */
        constructor(id, value, name, checked) {
            super("checkbox", id, value, name);
            this._dom.checked = checked ?? false;
            this.on("change", () => this.emit(new CheckedEvent("checked", this, { Checked: this._dom.checked }))); // eslint-disable-line jsdoc/require-jsdoc
        }
        /**
         * Get/set the indeterminate state of the checkbox. If set to `true` this also sets the checked
         * state to `false`.
         */
        get Indeterminate() {
            return this._dom.indeterminate;
        }
        /** @inheritdoc */
        set Indeterminate(v) {
            this.indeterminate(v);
        }
        /**
         * Sets the indeterminate state of the checkbox to indeterminate/determinate. If set to `true`
         * this also sets the checked state to `false`.
         * @param indeterminate `true`, if the state of the checkbox should be indeterminate, otherwise
         * false.
         * @returns This instance.
         */
        indeterminate(indeterminate) {
            indeterminate && this._dom.checked && (this._dom.checked = false);
            this._dom.indeterminate = indeterminate;
            return this;
        }
        /**
         * `DataList` isn't supported by `Checkbox`, using this (overridden) property has no effect)!
         */
        get DataList() {
            return [];
        }
        /** @inheritdoc */
        set DataList(_v) { }
        /**
         * `DataList` isn't supported by `Checkbox`, using this (overridden) function has no effect)!
         * @param _v The list attribute value to be set.
         * @returns This instance.
         */
        dataList(_v) {
            return this;
        }
        /**
         * `Autocomplete` isn't supported by `Checkbox`, using this (overridden) property has no
         * effect)!
         */
        get Autocomplete() {
            return null;
        }
        /** @inheritdoc */
        set Autocomplete(_v) { }
        /**
         * `Autocomplete` isn't supported by `Checkbox`, using this (overridden) function has no
         * effect)!
         * @param _v The autocomplete attribute value to be set.
         * @returns This instance.
         */
        autocomplete(_v) {
            return this;
        }
        /**
         * `Readonly` isn't supported by `Checkbox`, using this (overridden) property has no effect)!
         */
        get Readonly() {
            return false;
        }
        /** @inheritdoc */
        set Readonly(_v) { }
        /**
         * `Readonly` isn't supported by `Checkbox`, using this (overridden) function has no effect)!
         * @param _v The readonly attribute value to be set.
         * @returns This instance.
         */
        readonly(_v) {
            return this;
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (CheckedAttr));
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
     * Comment component (for DOM comment nodes).
     */
    class Comment extends ANodeComponent {
        // @ts-expect-error ---
        #brand;
        /**
         * Create instance based on the `Comment` interface.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Comment
         * @param text The text for the comment node.
         */
        constructor(text) {
            super();
            this._dom = document.createComment(text);
        }
    }

    /**
     * Dialog component (`<dialog>`).
     */
    class Dialog extends ElementComponentWithChildren {
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
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
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
    }

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
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
    }

    /**
     * Em component (`<em>`).
     */
    class Em extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Em component.
         * @param phrase The phrasing content for the `<em>` element.
         */
        constructor(...phrase) {
            super("em");
            phrase.length > 0 && this.phrase(...phrase);
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
     * Email input component (`<input type="email">`).
     */
    class EmailInput extends Input {
        // @ts-expect-error ---
        #brand;
        /**
         * Create EmailInput component.\
         * To check the validity of the input, this regex pattern can be used (as per HTML spec):\
         * `/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/`
         * @param id The id (attribute) of the email input. If `id` is `undefined` or omitted, a unique
         * ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the email input.
         * @param name The name (attribute) of the email input.
         */
        constructor(id, value, name) {
            super("email", id, value, name);
        }
        /**
         * Selects all text in the input element.
         * @returns This instance.
         */
        select() {
            this._dom.select();
            return this;
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (DirnameAttr), (MinMaxLengthAttr), (MultipleAttr), (PatternAttr), (PlaceholderAttr), (SizeAttr));
            /** Mixin `TextField` functionality. */
            mixin(false, this, (TextField));
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
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
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
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
    }

    /**
     * Hr component (`<hr>`).
     */
    class Hr extends ElementComponentVoid {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Hr component.
         */
        constructor() {
            super("hr");
        }
    }
    /**
     * Factory for `Hr` components.
     */
    class HrFactory extends ComponentFactory {
        /**
         * Create, set up and return Hr component.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns Hr component.
         */
        hr(data) {
            return this.setupComponent(new Hr(), data);
        }
    }

    /**
     * H1 component (`<h1>`).
     */
    class H1 extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create H1 component.
         * @param phrase The phrasing content for the `<h1>` element.
         */
        constructor(...phrase) {
            super("h1");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }
    /**
     * H2 component (`<h2>`).
     */
    class H2 extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create H2 component.
         * @param phrase The phrasing content for the `<h2>` element.
         */
        constructor(...phrase) {
            super("h2");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }
    /**
     * H3 component (`<h3>`).
     */
    class H3 extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create H3 component.
         * @param phrase The phrasing content for the `<h3>` element.
         */
        constructor(...phrase) {
            super("h3");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }
    /**
     * H4 component (`<h4>`).
     */
    class H4 extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create H4 component.
         * @param phrase The phrasing content for the `<h4>` element.
         */
        constructor(...phrase) {
            super("h4");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }
    /**
     * H5 component (`<h5>`).
     */
    class H5 extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create H5 component.
         * @param phrase The phrasing content for the `<h5>` element.
         */
        constructor(...phrase) {
            super("h5");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }
    /**
     * H6 component (`<h6>`).
     */
    class H6 extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create H6 component.
         * @param phrase The phrasing content for the `<h6>` element.
         */
        constructor(...phrase) {
            super("h6");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }

    /**
     * I component (`<i>`).
     */
    class I extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create I component.
         * @param phrase The phrasing content for the `<i>` element.
         */
        constructor(...phrase) {
            super("i");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }

    /**
     * Img component (`<img>`).
     */
    class Img extends ElementComponentVoid {
        // @ts-expect-error ---
        #brand;
        naturalWidth = 0;
        naturalHeight = 0;
        _scale = 0;
        /**
         * Create Img component.
         * @param src The source/URL of the image.
         * @param width The width of the image.
         * @param height The height of the image.
         * @param alt Text for the `alt` attribute of the image.
         * @param lazyLoad `true` (the default) turns on lazy loading (equivalent to `loading("lazy")`),
         * `false` turns off lazy loading (equivalent to `loading("eager")`).
         */
        constructor(src, width, height, alt, lazyLoad = true) {
            super("img");
            width === undefined || this.width(width);
            height === undefined || this.height(height);
            alt && this.alt(alt);
            lazyLoad && this.loading("lazy");
            this
                .on("load", (_ev) => {
                if (this._dom.complete && (this._dom.naturalWidth !== 0) && (this._dom.naturalHeight !== 0)) {
                    this.naturalWidth = this._dom.naturalWidth;
                    this.naturalHeight = this._dom.naturalHeight;
                }
            })
                .on("error", (_ev) => {
                if (this._dom.complete && (this._dom.naturalWidth !== 0) && (this._dom.naturalHeight !== 0)) {
                    this.naturalWidth = this._dom.naturalWidth;
                    this.naturalHeight = this._dom.naturalHeight;
                }
            })
                .src(src);
        }
        /**
         * Get/set `decoding` attribute value of the component.
         */
        get Decoding() {
            return this._dom.decoding;
        }
        /** @inheritdoc */
        set Decoding(v) {
            this._dom.decoding = v;
        }
        /**
         * Set `decoding` attribute value of the component.
         * @param v The value to be set.
         * @returns This instance.
         */
        decoding(v) {
            this._dom.decoding = v;
            return this;
        }
        /**
         * Get/set `fetchPriority` attribute value of the component.
         */
        get FetchPriority() {
            return this._dom.fetchPriority;
        }
        /** @inheritdoc */
        set FetchPriority(v) {
            this._dom.fetchPriority = v;
        }
        /**
         * Set `fetchPriority` attribute value of the component.
         * @param v The value to be set.
         * @returns This instance.
         */
        fetchPriority(v) {
            this._dom.fetchPriority = v;
            return this;
        }
        /**
         * Actual width of the image.
         */
        get NaturalWidth() {
            return this.naturalWidth;
        }
        /**
         * Actual height of the image.
         */
        get NaturalHeight() {
            return this.naturalHeight;
        }
        /**
         * Get/set the scaling of the image in relation to the actual image size (the setter sets the
         * attributes `width` and `height`). If `scale` is less than or equal to `0`, the `width` and
         * `height` attributes are removed.
         */
        get Scale() {
            return this._scale;
        }
        /** @inheritdoc */
        set Scale(v) {
            this.scale(v);
        }
        /**
         * Scales the image (sets the attributes `width` and `height`).
         * @param scale The scaling factor in relation to the actual image size. If `scale` is less than
         * or equal to `0`, the `width` and `height` attributes are removed.
         * @returns This instance.
         */
        scale(scale) {
            if (scale <= 0) {
                this._scale = 0;
                this.attribN("width", null).attribN("height", null);
            }
            else if ((this.naturalWidth !== 0) && (this.naturalHeight !== 0)) {
                this._scale = scale;
                this.width(this.naturalWidth * this._scale);
                this.height(this.naturalHeight * this._scale);
            }
            else {
                this._scale = 0;
                this.attribN("width", null).attribN("height", null);
            }
            return this;
        }
        /** @inheritdoc */
        dispose() {
            this.src("");
            super.dispose();
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (CrossOriginAttr), (SrcAttr), (AltAttr), (WidthHeightAttr), (LoadingAttr), (ReferrerPolicyAttr));
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
     * List item component (`<li>`) for ordered lists (`<ol>`).
     */
    class LiOl extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create LiOl component.
         * @param value The numeric value for the `<li>` element.
         * @param children The content for the `<li>` element.
         */
        constructor(value, ...children) {
            super("li");
            value !== undefined && this.value(value);
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (ValueAttr));
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
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
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
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
    }

    /**
     * Menu component (`<menu>`).
     */
    class Menu extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Menu component.
         * @param items Menu items to be appended to this menu.
         */
        constructor(...items) {
            super("menu");
            items && this.append(...items);
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
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
    }

    /**
     * Number input component (`<input type="number">`).
     */
    class NumberInput extends Input {
        // @ts-expect-error ---
        #brand;
        /**
         * Create NumberInput component.
         * @param id The id (attribute) of the number input. If `id` is `undefined` or omitted, a unique
         * ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the number input.
         * @param name The name (attribute) of the number input.
         * @param min The minimum value (attribute) of the number input.
         * @param max The maximum value (attribute) of the number input.
         * @param step The step value (attribute) of the number input.
         */
        constructor(id, value, name, min, max, step) {
            super("number", id, value, name);
            min && this.min(min);
            max && this.max(max);
            step && this.step(step);
        }
        /**
         * Selects all text in the input element.
         * @returns This instance.
         */
        select() {
            this._dom.select();
            return this;
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (MinMaxAttr), (PlaceholderAttr), (StepAttr));
            /** Mixin `TextField` functionality. */
            mixin(false, this, (TextField));
        }
    }

    /**
     * Ordered list component Ol (`<ol>`).
     */
    class Ol extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Ol component.
         * @param listItems Ordered list items to be appended to this list.
         */
        constructor(...listItems) {
            super("ol");
            listItems && this.append(...listItems.map(e => (e instanceof LiOl
                ? e
                : typeof e === "string" || e instanceof ANodeComponent
                    ? new LiOl(undefined, e)
                    : e)));
        }
        /**
         * Get/set `type` attribute value of the list item.
         */
        get Type() {
            const type = this.attr("type");
            if (type === null) {
                return null;
            }
            else if (type === "1") {
                return 1;
            }
            else if (typeof type === "string") {
                return type;
            }
            return null;
        }
        /** @inheritdoc */
        set Type(v) {
            this.type(v);
        }
        /**
         * Set type attribute of the list item.
         * @param v The type attribute to be set or `null` to remove the attribute.
         * @returns This instance.
         */
        type(v) {
            if (v === null) {
                return this.attrib("type", null);
            }
            else if (v === 1) {
                return this.attrib("type", "1");
            }
            else if (typeof v === "string") {
                return this.attrib("type", v);
            }
            return this;
        }
        /**
         * Get/set start attribute of the list item.
         */
        get Start() {
            return this._dom.start;
        }
        /** @inheritdoc */
        set Start(v) {
            this._dom.start = v;
        }
        /**
         * Set start attribute of the list item.
         * @param v The start to be set or `null` to remove the attribute.
         * @returns This instance.
         */
        start(v) {
            this._dom.start = v;
            return this;
        }
        /**
         * Get/set the reversed attribute value of the list item.
         */
        get Reversed() {
            return this._dom.reversed;
        }
        /** @inheritdoc */
        set Reversed(v) {
            this._dom.reversed = v;
        }
        /**
         * Set reversed attribute value on the underlying HTML element.
         * @param reversed The readonly attribute value to be set.
         * @returns This instance.
         */
        reversed(reversed) {
            this._dom.reversed = reversed;
            return this;
        }
    }

    /**
     * OptGroup component (`<optgroup>`).
     */
    class OptGroup extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create OptGroup component.
         * @param label The label for the `<optgroup>` element.
         * @param options `Option` components to be added to this `OptGroup` instance.
         */
        constructor(label, ...options) {
            super("optgroup");
            this
                .label(label)
                .append(...options);
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (LabelAttr), (NativeDisabledAttr));
        }
    }

    /**
     * Output component (`<output>`).
     */
    class Output extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Output component.
         * @param for_ Content of the `for` attribute (single target ID).
         * @param phrase The phrasing content for the `<output>` element.
         */
        constructor(for_, ...phrase) {
            super("output");
            for_ && this.for(for_);
            phrase.length > 0 && this.phrase(...phrase);
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (ForAttr), (NameAttr));
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
     * Password input component (`<input type="password">`).
     */
    class PasswordInput extends Input {
        // @ts-expect-error ---
        #brand;
        /**
         * Create PasswordInput component.
         * @param id The id (attribute) of the password input. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the password input.
         * @param name The name (attribute) of the password input.
         */
        constructor(id, value, name) {
            super("password", id, value, name);
        }
        /**
         * Get/set the `Disclosed` state of the component. If 'true', the password is displayed in plain
         * text instead of in masked form.
         */
        get Disclosed() {
            return this._dom.type === "text";
        }
        /** @inheritdoc */
        set Disclosed(v) {
            this._dom.type = v ? "text" : "password";
        }
        /**
         * Set the `Disclosed` state of the component.
         * @param v The value to be set. If 'true', the password is displayed in plain text instead of
         * in masked form.
         * @returns This instance.
         */
        disclosed(v) {
            this._dom.type = v ? "text" : "password";
            return this;
        }
        /**
         * `DataList` isn't supported by `PasswordInput`, using this (overridden) property has no
         * effect)!
         */
        get DataList() {
            return [];
        }
        /** @inheritdoc */
        set DataList(_v) { }
        /**
         * `DataList` isn't supported by `PasswordInput`, using this (overridden) function has no
         * effect)!
         * @param _v The list attribute value to be set.
         * @returns This instance.
         */
        dataList(_v) {
            return this;
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (MinMaxLengthAttr), (PatternAttr), (PlaceholderAttr), (SizeAttr), (SelectionEndProp), (SelectionStartProp));
            /** Mixin `TextField` functionality. */
            mixin(false, this, (TextField));
        }
    }

    /**
     * Pre component (`<pre>`).
     */
    class Pre extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Pre component.
         * @param phrase The phrasing content for the `<pre>` element.
         */
        constructor(...phrase) {
            super("pre");
            phrase.length > 0 && this.phrase(...phrase);
        }
    }

    /** Custom 'progress-value' event for progress components. */
    class ProgressValueEvent extends ACustomComponentEvent {
        /**
         * Create ProgressValueEvent event.
         * @param sender The event emitter (always `Progress`).
         * @param oldValue The old value of the progress component.
         * @param newValue The new (current) value of the progress component.
         * @param customEventInitDict Optional event properties.
         */
        constructor(sender, oldValue, newValue, customEventInitDict = DEFAULT_EVENT_INIT_DICT) {
            super("progress-value", sender, { OldValue: oldValue, NewValue: newValue }, customEventInitDict); // eslint-disable-line jsdoc/require-jsdoc
        }
    }
    /**
     * Progress component (`<progress>`).
     */
    class Progress extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        _orientation;
        valueObserver;
        /**
         * Create, set up and return Progress component.
         * @param max The maximum value for the component. For the setter the value must be greater than
         * `0` (it is automatically corrected to `1` if it is lower than or equal to `0`). Default: `1`.
         * @param value The current value for the element. The value must be greater than or equal to
         * `0` and less than or equal to the maximum value (it is automatically corrected so that it
         * complies with these limit values). If the value is undefined, the component shows an
         * 'indeterminate' state.
         * @param phrase The phrasing content for the `<progress>` element.
         */
        constructor(max = 1, value, ...phrase) {
            super("progress");
            this
                .orientation(Orientation.HORIZONTAL)
                .max(max)
                .value(value);
            phrase.length > 0 && this.phrase(...phrase);
            this.valueObserver = new MutationObserver((records) => {
                for (const record of records) {
                    if (record.type === "attributes" && record.attributeName === "value") {
                        this.emit(new ProgressValueEvent(this, parseFloat(record.oldValue ?? "0"), this._dom.value));
                        break;
                    }
                }
            });
            this.valueObserver?.observe(this._dom, { attributes: true, attributeOldValue: true, attributeFilter: ["value"] }); // eslint-disable-line jsdoc/require-jsdoc
        }
        /**
         * Get/set the indeterminate state of the component. If the property is set to `true`, the
         * `value` attribute is removed, otherwise the value attribute is set to `0`, if the component
         * has no value attribute, or the current `value` attribute is unchanged.
         */
        get Indeterminate() {
            return !this._dom.hasAttribute("value");
        }
        /** @inheritdoc */
        set Indeterminate(v) {
            this.indeterminate(v);
        }
        /**
         * Sets the indeterminate state of the component.
         * @param indeterminate `true`, if the state of the component should be indeterminate, otherwise
         * false. If `indeterminate` is `true`, the `value` attribute is removed, otherwise the value
         * attribute is set to `0`, if the component has no value attribute, or the current `value`
         * attribute is unchanged.
         * @returns This instance.
         */
        indeterminate(indeterminate) {
            indeterminate
                ? this._dom.removeAttribute("value")
                : this._dom.hasAttribute("value") || this._dom.setAttribute("value", "0");
            return this;
        }
        /**
         * Get/set the `max` attribute value of the component. For the setter the value must be greater
         * than `0` (it is automatically corrected to `1` if it is lower than or equal to `0`).
         */
        get Max() {
            return this._dom.max;
        }
        /** @inheritdoc */
        set Max(v) {
            this.max(v);
        }
        /**
         * Get/set the `max` attribute value of the component. The value must be greater than `0` (it is
         * automatically corrected to `1` if it is lower than or equal to `0`). If the new maximum value
         * is also greater than the current value, the current value is set to the maximum value.
         * @param v The value to be set.
         * @returns This instance.
         */
        max(v) {
            const oldVal = this._dom.value;
            this._dom.max = v <= 0 ? 1 : v;
            (oldVal > this._dom.max) && (this._dom.value = this._dom.max);
            return this;
        }
        /**
         * Get/set the `value` attribute value of the component. For the setter, the value must be
         * greater than or equal to `0` and less than or equal to the maximum value (it is automatically
         * corrected so that it lies between these limits). If the component has no `value` attribute
         * (it is in an 'indeterminate' state), the return value of the getter is nevertheless always
         * `0`. If `Value` is set to `undefined`, the `value` attribute is removed.
         */
        get Value() {
            return this._dom.value;
        }
        /** @inheritdoc */
        set Value(v) {
            this.value(v);
        }
        /**
         * Get/set the `value` attribute value of the component. The value must be greater than or equal
         * to `0` and less than or equal to the maximum value (it is automatically corrected so that it
         * lies between these limits). If `v` is omitted or is `undefined`, the `value` attribute is
         * removed.
         * @param v The value to be set.
         * @returns This instance.
         */
        value(v) {
            v === undefined
                ? this._dom.removeAttribute("value")
                : this._dom.value = Math.max(0, Math.min(v, this._dom.max));
            return this;
        }
        /**
         * Get/set the orientation of the component.
         */
        get Orientation() {
            return this._orientation;
        }
        /** @inheritdoc */
        set Orientation(v) {
            this.orientation(v);
        }
        /**
         * Sets the orientation of the component.
         * @param orientation The new orientation.
         * @returns This instance.
         */
        orientation(orientation) {
            if (this._orientation !== orientation) {
                this._orientation = orientation;
                this._orientation === Orientation.HORIZONTAL
                    ? this.removeClass("vertical").addClass("horizontal")
                    : this.removeClass("horizontal").addClass("vertical");
            }
            return this;
        }
        /** @inheritdoc */
        dispose() {
            this.valueObserver?.disconnect();
            this.valueObserver = undefined;
            super.dispose();
        }
    }

    /**
     * Radio button component (`<input type="radio">`)  extended with a 'Checked' getter/setter and set
     * method and also with a custom event `checked` that signals checking/unchecking the radio button.
     */
    class RadioButton extends Input {
        // @ts-expect-error ---
        #brand;
        _toggle = false;
        /**
         * Create RadioButton component.
         * @param id The id (attribute) of the radio button. If `id` is `undefined` or omitted, a unique
         * ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the radio button.
         * @param name The name (attribute) of the radio button.
         * @param checked `true`, if the radio button should be checked, otherwise false.
         */
        constructor(id, value, name, checked) {
            super("radio", id, value, name);
            this._dom.checked = checked ?? false;
            this.on("keyup", this.#onSpaceOrEnter.bind(this));
            this.on("click", this.#onClick.bind(this));
            // Emit additional `checked` event on changes.
            this.on("change", () => this.emit(new CheckedEvent("checked", this, 
            /* eslint-disable jsdoc/require-jsdoc */
            { Checked: this._dom.checked }, DEFAULT_EVENT_INIT_DICT)
            /* eslint-enable */
            ));
        }
        /**
         * `DataList` isn't supported by `RadioButton`, using this (overridden) property has no effect)!
         */
        get DataList() {
            return [];
        }
        /** @inheritdoc */
        set DataList(_v) { }
        /**
         * `DataList` isn't supported by `RadioButton`, using this (overridden) function has no effect)!
         * @param _v The list attribute value to be set.
         * @returns This instance.
         */
        dataList(_v) {
            return this;
        }
        /**
         * `Autocomplete` isn't supported by `RadioButton`, using this (overridden) property has no
         * effect)!
         */
        get Autocomplete() {
            return null;
        }
        /** @inheritdoc */
        set Autocomplete(_v) { }
        /**
         * `Autocomplete` isn't supported by `RadioButton`, using this (overridden) function has no
         * effect)!
         * @param _v The autocomplete attribute value to be set.
         * @returns This instance.
         */
        autocomplete(_v) {
            return this;
        }
        /**
         * `Readonly` isn't supported by `RadioButton`, using this (overridden) property has no effect)!
         */
        get Readonly() {
            return false;
        }
        /** @inheritdoc */
        set Readonly(_v) { }
        /**
         * `Readonly` isn't supported by `RadioButton`, using this (overridden) function has no effect)!
         * @param _v The readonly attribute value to be set.
         * @returns This instance.
         */
        readonly(_v) {
            return this;
        }
        /**
         * Allow toggling the radio button state.
         */
        get Toggle() {
            return this._toggle;
        }
        /** @inheritdoc */
        set Toggle(v) {
            this._toggle = v;
        }
        /**
         * Allow or disallow toggling the radio button state.
         * @param toggle `true`, if the radio button can be toggled, otherwise false.
         * @returns This instance.
         */
        toggle(toggle) {
            this._toggle = toggle;
            return this;
        }
        /**
         * Toggle via the space or enter key.
         * @param event The keyboard event.
         */
        #onSpaceOrEnter(event) {
            // Toggling support is off => add support for the enter key (which sets the state to
            // `checked` once). For the space key this isn't necessary since it is the default behavior.
            if (!this._toggle) {
                if (event.key === "Enter" && !this.Checked) {
                    this.checked(true);
                    this.#emitEvents();
                }
            }
            // Toggling support is on => support space and enter key.
            else if ((event.key === " ") || (event.key === "Enter")) {
                this.checked(!this.Checked);
                // It seems that radio buttons are toggled on space, prevent that here.
                if (event.key === " ") {
                    event.preventDefault();
                }
                this.#emitEvents();
            }
        }
        /**
         * Toggle by click.
         * @param event The mouse or pointer event.
         */
        #onClick(event) {
            // Gecko and Blink create a click event if the space bar or one of the arrow keys are
            // pressed. Ignore this here.
            if ((event.pointerId === -1) && (event.pointerType === "")) {
                return;
            }
            if (this._toggle) {
                event.preventDefault();
                setTimeout(() => {
                    this.checked(!this.Checked);
                    this.#emitEvents();
                }, 0);
            }
        }
        /**
         * Emit `input` and `change` events.
         */
        #emitEvents() {
            this.emit(new Event("input", DEFAULT_EVENT_INIT_DICT));
            this.emit(new Event("change", DEFAULT_EVENT_INIT_DICT));
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (CheckedAttr));
        }
    }

    /**
     * Range input component (`<input type="range">`).
     */
    class RangeInput extends Input {
        // @ts-expect-error ---
        #brand;
        _orientation;
        minMaxObserver;
        /**
         * Create RangeInput component. In addition to the original `HTMLInputElement` this component
         * reflects its current percentage value in the `--range-input-percentage` CSS variable and the
         * `data-percent` attribute.
         * @param id The id (attribute) of the range input. If `id` is `undefined` or omitted, a unique
         * ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the range input.
         * @param name The name (attribute) of the range input.
         * @param min The minimum value of the range input.
         * @param max The maximum value of the range input.
         * @param step The step garnularity of the range input.
         * @param orientation The orientation of the range input.
         */
        constructor(id, value, name, min = "0", max = "100", step = "1", orientation = Orientation.HORIZONTAL) {
            super("range", id, value, name);
            this.orientation(orientation)
                .min(min)
                .max(max)
                .step(step)
                .updatePercentage()
                .on("input", () => this.updatePercentage());
            this.supportOnValueCallbacks(this);
            this.minMaxObserver = new MutationObserver((records) => {
                for (const record of records) {
                    if (record.target === this._dom && (record.attributeName === "min" || record.attributeName === "max")) {
                        this.updatePercentage();
                        break;
                    }
                }
            });
            this.minMaxObserver.observe(this._dom, { attributes: true, attributeFilter: ["min", "max"] }); // eslint-disable-line jsdoc/require-jsdoc
        }
        /**
         * `Readonly` isn't supported by `RangeInput`, using this (overridden) property has no effect)!
         */
        get Readonly() {
            return false;
        }
        /** @inheritdoc */
        set Readonly(_v) { }
        /**
         * `Readonly` isn't supported by `RangeInput`, using this (overridden) function has no effect)!
         * @param _v The readonly attribute value to be set.
         * @returns This instance.
         */
        readonly(_v) {
            return this;
        }
        /**
         * `Required` isn't supported by `RangeInput`, using this (overridden) property has no effect)!
         */
        get Required() {
            return false;
        }
        /** @inheritdoc */
        set Required(_v) { }
        /**
         * `Required` isn't supported by `RangeInput`, using this (overridden) function has no effect)!
         * @param _v The required attribute value to be set.
         * @returns This instance.
         */
        required(_v) {
            return this;
        }
        /**
         * Get/set the orientation of the range input.
         */
        get Orientation() {
            return this._orientation;
        }
        /** @inheritdoc */
        set Orientation(v) {
            this.orientation(v);
        }
        /**
         * Sets the orientation of the range input.
         * @param orientation The new orientation.
         * @returns This instance.
         */
        orientation(orientation) {
            if (this._orientation !== orientation) {
                this._orientation = orientation;
                this._orientation === Orientation.HORIZONTAL
                    ? this.removeClass("vertical").addClass("horizontal")
                    : this.removeClass("horizontal").addClass("vertical");
            }
            return this;
        }
        /** @inheritdoc */
        onValue() {
            this.updatePercentage();
            return this;
        }
        /** @inheritdoc */
        onValueAsNumber() {
            this.updatePercentage();
            return this;
        }
        /**
         * Update the `--range-input-percentage` CSS variable to reflect the current percentage value of
         * the range input.
         * @returns This instance.
         */
        updatePercentage() {
            const min = parseFloat(this._dom.min) || 0;
            const max = parseFloat(this._dom.max) || 100;
            const percentage = (parseFloat(this._dom.value) - min) / (max - min) * 100;
            this._dom.style.setProperty("--range-input-percentage", percentage + "%");
            this._dom.setAttribute("data-percent", percentage.toString());
            return this;
        }
        /** @inheritdoc */
        dispose() {
            this.minMaxObserver.disconnect();
            super.dispose();
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (MinMaxAttr), (StepAttr));
        }
    }

    /**
     * Search input component (`<input type="search">`).
     */
    class SearchInput extends Input {
        // @ts-expect-error ---
        #brand;
        /**
         * Create SearchInput component.
         * @param id The id (attribute) of the search input. If `id` is `undefined` or omitted, a unique
         * ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the search input.
         * @param name The name (attribute) of the search input.
         */
        constructor(id, value, name) {
            super("search", id, value, name);
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (DirnameAttr), (MinMaxLengthAttr), (PatternAttr), (PlaceholderAttr), (SizeAttr), (SelectionEndProp), (SelectionStartProp));
            /** Mixin `TextField` functionality. */
            mixin(false, this, (TextField));
        }
    }

    /**
     * Section component (`<section>`).
     */
    class Section extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        /**
         * Create Section component.
         * @param children The content for the `<section>` element.
         */
        constructor(...children) {
            super("section");
            this.append(...children.map(child => typeof child === "string" ? new Text$1(child) : child));
        }
    }

    /**
     * Select component (`<select>`).
     */
    class Select extends ElementComponentWithChildren {
        // @ts-expect-error ---
        #brand;
        _values;
        /**
         * Create Select component.
         * @param values The values to be displayed in the select.
         * @param id The id (attribute) of the select. If `id` is `undefined` or omitted, a unique ID
         * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
         * will be set. Any other value will be used as the id attribute.
         * @param value The value of the select.
         * @param name The name (attribute) of the select.
         */
        constructor(values, id, value, name) {
            super("select");
            this.values(values);
            id === undefined
                ? this.id(cid())
                : id && this.id(id);
            value && this.value(value);
            name && this.name(name);
        }
        /**
         * Get/set the values of the drop-down list.
         */
        get Values() {
            return this._values;
        }
        /** @inheritdoc */
        set Values(v) {
            this.values(v);
        }
        /**
         * Set the values of the drop-down list.
         * @param v The values for the drop-down list.
         * @returns This instance.
         */
        values(v) {
            const oldValue = { Text: this.TextValue, Value: this.Value }; // eslint-disable-line jsdoc/require-jsdoc
            this._values = v;
            while (this._dom.lastChild) {
                this._dom.lastChild.remove();
            }
            let i = 0;
            let newIndex = -1;
            for (const value of this._values) {
                const option = document.createElement("option");
                option.textContent = value.Text;
                option.value = value.Value;
                this._dom.appendChild(option);
                if ((newIndex === -1) && (value.Text === oldValue.Text) && (value.Value === oldValue.Value)) {
                    newIndex = i;
                }
                i++;
            }
            if (newIndex !== -1) {
                this.SelectedIndex = newIndex;
            }
            return this;
        }
        /**
         * Get/set the text that is displayed in the drop-down list. `TextValue` is one of the values
         * behind the drop-down list (e.g. `<option value="open">Open</option>`).
         */
        get TextValue() {
            const result = this._dom.selectedOptions[0] ? this._dom.selectedOptions[0].textContent : undefined;
            return result ? result : "";
        }
        /** @inheritdoc */
        set TextValue(v) {
            this.textValue(v);
        }
        /**
         * Get/set the text that is displayed in the drop-down list. `v` is one of the values behind the
         * drop-down list (e.g. `<option value="open">Open</option>`).
         * @param v The text to be selected in the drop-down list.
         * @returns This instance.
         */
        textValue(v) {
            let l = this._values.length;
            while (l--) {
                if (this._values[l].Text === v) {
                    this.SelectedIndex = l;
                    break;
                }
            }
            return this;
        }
        /**
         * Get/set the index of the selected value in the drop-down list.
         */
        get SelectedIndex() {
            return this._dom.selectedIndex;
        }
        /** @inheritdoc */
        set SelectedIndex(v) {
            this._dom.selectedIndex = v;
        }
        /**
         * Set the index of the selected value in the drop-down list.
         * @param v The index of the value to be selected in the drop-down list.
         * @returns This instance.
         */
        selectedIndex(v) {
            this._dom.selectedIndex = v;
            return this;
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (AutocompleteAttr), (MultipleAttr), (NameAttr), (NativeDisabledAttr), (RequiredAttr), (SizeAttr), (ValueAttr));
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
     * Types of TemporalInput component.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month
     */
    var TemporalType;
    (function (TemporalType) {
        /** Date. */
        TemporalType[TemporalType["Date"] = 0] = "Date";
        /** Time. */
        TemporalType[TemporalType["Time"] = 1] = "Time";
        /** Time with seconds. */
        TemporalType[TemporalType["TimeSeconds"] = 2] = "TimeSeconds";
        /** Date and time (hh:mm). */
        TemporalType[TemporalType["DateTime"] = 3] = "DateTime";
        /** Date and time with seconds (hh:mm:ss). */
        TemporalType[TemporalType["DateTimeSeconds"] = 4] = "DateTimeSeconds";
        /** Week. */
        TemporalType[TemporalType["Week"] = 5] = "Week";
        /** Month. */
        TemporalType[TemporalType["Month"] = 6] = "Month";
    })(TemporalType || (TemporalType = {}));
    /**
     * Input component (`<input>`) for temporal types (`date`, `datetime-local`, `time` etc.).
     */
    class TemporalInput extends Input {
        // @ts-expect-error ---
        #brand;
        /**
         * Create TemporalInput component.
         * @param temporalType The type (attribute) of the temporal input.
         * @param id The id (attribute) of the temporal input. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the temporal input.
         * @param name The name (attribute) of the temporal input.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month
         */
        constructor(temporalType, id, value, name) {
            let type = "date";
            let step = undefined;
            switch (temporalType) {
                case TemporalType.Time:
                    type = "time";
                    break;
                case TemporalType.TimeSeconds:
                    type = "time";
                    step = "1";
                    break;
                case TemporalType.DateTime:
                    type = "datetime-local";
                    break;
                case TemporalType.DateTimeSeconds:
                    type = "datetime-local";
                    step = "1";
                    break;
                case TemporalType.Week:
                    type = "week";
                    break;
                case TemporalType.Month:
                    type = "month";
                    break;
            }
            super(type, id, value, name);
            step === undefined || this.step(step);
        }
        /**
         * Increments the input control's value by the value given by the `Step` attribute. If the
         * optional parameter is used, it will will increment the input control's value by that value.
         * @param n Value to decrement the value by.
         * @returns This instance.
         */
        stepUp(n) {
            this._dom.stepUp(n);
            return this;
        }
        /**
         * Decrements the input control's value by the value given by the `Step` attribute. If the
         * optional parameter is used, it will will decrement the input control's value by that value.
         * @param n Value to decrement the value by.
         * @returns This instance.
         */
        stepDown(n) {
            this._dom.stepDown(n);
            return this;
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (MinMaxAttr), (StepAttr));
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
     * Text input component (`<input type="text">`).
     */
    class TextInput extends Input {
        // @ts-expect-error ---
        #brand;
        /**
         * Create TextInput component.
         * @param id The id (attribute) of the text input. If `id` is `undefined` or omitted, a unique
         * ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the text input.
         * @param name The name (attribute) of the text input.
         */
        constructor(id, value, name) {
            super("text", id, value, name);
        }
        static {
            /** Mixin additional DOM attributes/properties. */
            mixinDOMProperties(this, (DirnameAttr), (MinMaxLengthAttr), (PatternAttr), (PlaceholderAttr), (SizeAttr), (SelectionEndProp), (SelectionStartProp));
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
            this.ui = new Dialog()
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
    class BusyOverlayFactory extends ComponentFactory {
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
     * Factory for `IconButton` components.
     */
    class IconButtonFactory extends ComponentFactory {
        /**
         * Create IconButton component.
         * @param options The options for the icon button.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns IconButton component.
         * @see {@link IconButtonOptions}
         */
        iconButton(options, data) {
            return this.setupComponent(new IconButton(options), data);
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
                : [content]).map(e => typeof e === "string" ? new Text$1(e) : e));
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
                : [typeof header === "string" ? new Span(header).addClass("header-text") : header]).map(e => typeof e === "string" ? new Text$1(e) : e));
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
    class DisclosureContainerFactory extends ComponentFactory {
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
     * Abstract `LabeledComponentWithSpan` class. This class allows to implement components that use a
     * `Span` component for its label.
     */
    class LabeledComponentWithSpan extends LabeledComponent {
        /**
         * Create LabeledComponentWithSpan component.
         * @param component The inner component of the labeled component.
         * @param labelPhrase The phrasing content for the label.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         */
        constructor(component, labelPhrase, lblPosition, lblAlignment) {
            super(labelPhrase, lblPosition, lblAlignment);
            this._component = component.addClass(LabeledComponent.LCComponentClassname);
            this.initialize();
        }
        /** @inheritdoc */
        buildUI() {
            this._label = new Span().addClass(LabeledComponent.LCLabelClassname);
            this.ui = ((this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
                ? new Div().append(this._label, this._component)
                : new Div().append(this._component, this._label)).addClass(LabeledComponent.DefaultCSSClassName);
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
     * Abstract class for building labeled _input_ components, e.g. text inputs, checkboxes etc. that
     * have a descriptive label/caption.
     */
    class LabeledInputComponent extends LabeledComponentWithLabel {
        /**
         * Create LabeledInputComponent component.
         * @param input The input component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the target input component. If `id` is `undefined` or
         * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
         * string, no id attribute will be set. Any other value will be used as the id attribute.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses/toggles/... the input component (a unique ID
         *   has been set automatically on the input component), if `lblAction` is `false`, clicking on
         *   the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the input component).
         */
        constructor(input, labelPhrase, id, lblPosition, lblAlignment, lblAction) {
            super(input, labelPhrase, id, lblPosition, lblAlignment, lblAction);
        }
        /**
         * Get/set `name` attribute value of the input component (re-exported for easier direct access).
         * Internally the setter sets the `name` attribute on the input component. `null` or an empty
         * string removes the attribute. Equivalent to get/set `<instance>.Component.Name`.
         */
        get Name() {
            return this._component.Name;
        }
        /** @inheritdoc */
        set Name(v) {
            this.name(v);
        }
        /**
         * Set `name` attribute value of this input component (re-exported for easier direct access).
         * Internally this sets the `name` attribute on the input component. Equivalent to
         * `<instance>.Component.name()`.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @returns This instance.
         */
        name(v) {
            this._component.name(v);
            return this;
        }
        /**
         * Get/set the value of underlying HTML element (re-exported for easier direct access).\
         * __Notes:__
         * - For some input elements the value is the content of the `value` attribute, for others like
         *   `input="text"` there is no `value` attribute.
         * - The getter always returns a string, even if there is no `value` attribute. If, for example,
         *   an `input="checkbox"`has no `value` attribute, the result of the property `Value` is an
         *   empty string.
         * - The setter allows a string or `null` to be passed and uses `attrib()` internally, i.e. if
         *   `null` is set, the `value` attribute is removed. Setting `null` also works for input
         *   elements such as `input="text"` (no `value` attribute). Ultimately, this means that calling
         *   `<input>.value(null).value` always results in an empty string for all input types.
         * - The property `Value` must be overridden by input elements of type `image` since `value`
         *   isn't avaliable for this type, so using `Value` should do nothing.
         */
        get Value() {
            return this._component.Value;
        }
        /** @inheritdoc */
        set Value(v) {
            this._component.Value = v;
        }
        /**
         * Set the value of the underlying HTML element (re-exported for easier direct access).\
         * __Note:__ The property `Value` must be overridden by input elements of type `image` since
         * `value` isn't avaliable for this type, so using `value()` should do nothing.
         * @param v The value to be set.
         * @see {@link LabeledInputComponent.Value}
         * @returns This instance.
         */
        value(v) {
            this._component.value(v);
            return this;
        }
    }
    /**
     * Abstract `LabeledComponentGroup` class. This class allows to implement components that group
     * other components in a container which itself is decorated with a label. Examples can be found in
     * {@link LabeledContainer} and {@link LabeledRadioButtonGroup}.
     */
    class LabeledComponentGroup extends LabeledComponent {
        /**
         * Create LabeledComponentGroup component.
         * @param labelPhrase The phrasing content for the label.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         */
        constructor(labelPhrase, lblPosition, lblAlignment) {
            super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
            this.initialize();
        }
        /**
         * Sets the inner component of this labeled component group. This __must__ be called by
         * extending classes!
         * @param component The component that makes up the content of the component group. Usually this
         * is an instance of `IElementWithChildrenComponent` containing other components but this is not
         * a requirement, any component instance can be used.
         * @returns This instance.
         */
        setContent(component) {
            this._component = component.addClass(LabeledComponent.LCComponentClassname);
            (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
                ? this.ui.append(this._component)
                : this.ui.insert(0, this._component);
            return this;
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = new Div()
                .addClass(LabeledComponentGroup.DefaultCSSClassName)
                .append(this._label = new Span().addClass(LabeledComponent.LCLabelClassname));
            return this;
        }
    }

    /**
     * Labeled anchor component.
     */
    class LabeledAnchor extends LabeledComponentWithSpan {
        /**
         * Create LabeledAnchor component.
         * @param href The `href` attribute for the `<a>` element.
         * @param labelPhrase The phrasing content for the label.
         * @param anchorPhrase The phrasing content for the `<a>` element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         */
        constructor(href, labelPhrase, anchorPhrase, lblPosition, lblAlignment) {
            super(new A(href, ...[anchorPhrase ?? []].flat()), labelPhrase, lblPosition, lblAlignment);
        }
        /**
         * Get A component of this component. Equivalent to `Component`, just with a more descriptive
         * name.
         */
        get Anchor() {
            return this._component;
        }
        /**
         * Access the internal `A` component via a callback function. Useful for seamless chaining when
         * creating instances of this component.
         * @param cb A callback function that receives the current `A` component instance and this
         * instance as parameters.
         * @returns This instance.
         */
        anchor(cb) {
            cb(this._component, this);
            return this;
        }
        /**
         * Get/set the `href` attribute of the anchor component (re-exported for easier direct access).
         */
        get Href() {
            return this._component.Href;
        }
        /** @inheritdoc */
        set Href(v) {
            this._component.Href = v;
        }
        /**
         * Sets the `href` attribute of the anchor component (re-exported for easier direct access).
         * @param v The value to be set.
         * @returns This instance.
         */
        href(v) {
            this._component.href(v);
            return this;
        }
        /**
         * Get/set the `target` attribute of the anchor component (re-exported for easier direct
         * access).
         */
        get Target() {
            return this._component.Target;
        }
        /** @inheritdoc */
        set Target(v) {
            this._component.Target = v;
        }
        /**
         * Sets the `target` attribute of the anchor component (re-exported for easier direct access).
         * @param v The value to be set.
         * @returns This instance.
         */
        target(v) {
            this._component.target(v);
            return this;
        }
        /**
         * Set the phrasing content of the components anchor. __The setter `Phrase` here is an alias for
         * the property `this.Anchor.Phrase`.__
         */
        set Phrase(phrase) {
            this._component.Phrase = phrase;
        }
        /**
         * Set the phrasing content of the the components anchor. __The function `phrase()` here is an
         * alias for the function `this.Anchor.phrase()` but it returns _this_ instance instead of the
         * 'Anchor' instance.__
         * @param phrase The phrasing content to be set for the anchor.
         * @returns This instance.
         */
        phrase(...phrase) {
            this._component.phrase(...phrase);
            return this;
        }
        /**
         * Set the phrasing content of the components anchor. __The setter `Rephrase` here is an alias
         * for the property `this.Anchor.Rephrase`.__
         */
        set Rephrase(phrase) {
            this._component.Rephrase = phrase;
        }
        /**
         * Set the phrasing content of the the components anchor. __The function `rephrase()` here is an
         * alias for the function `this.Anchor.rephrase()` but it returns _this_ instance instead of the
         * 'Anchor' instance.__
         * @param phrase The phrasing content to be set for the anchor.
         * @returns This instance.
         */
        rephrase(...phrase) {
            this._component.rephrase(...phrase);
            return this;
        }
    }
    /**
     * Factory for `LabeledAnchor` components.
     */
    class LabeledAnchorFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledAnchor component.
         * @param href The `href` attribute for the `<a>` element.
         * @param labelPhrase The phrasing content for the label.
         * @param anchorPhrase The phrasing content for the `<a>` element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledAnchor component.
         */
        labeledAnchor(href, labelPhrase, anchorPhrase, lblPosition, lblAlignment, data) {
            return this.setupComponent(new LabeledAnchor(href, labelPhrase, anchorPhrase, lblPosition, lblAlignment), data);
        }
    }

    /**
     * Labeled checkbox component.
     */
    class LabeledCheckbox extends LabeledInputComponent {
        /**
         * Create LabeledCheckbox component.\
         * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
         * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
         * `LabelAlignment.START` can lead to a visually rather weird appearance.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the checkbox. If `id` is `undefined` or omitted, a unique ID
         * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
         * will be set. Any other value will be used as the id attribute.
         * @param value The value of the checkbox input element.
         * @param name The `name` attribute of the checkbox input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label toggles the checkbox input element (a unique ID has
         *   been set automatically on the checkbox input element), if `lblAction` is `false`, clicking
         *   on the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the checkbox input element).
         */
        constructor(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new Checkbox(_id, value, name)
                // Forward this event to make handling of the component easier.
                .on("checked", (ev) => {
                // ev.preventDefault();
                ev.stopImmediatePropagation();
                this.emit(new CheckedEvent("checked", this, { Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
            }), labelPhrase, _id, lblPosition ?? LabelPosition.END, lblAlignment, lblAction);
        }
        /**
         * Get Checkbox component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get Checkbox() {
            return this._component;
        }
        /**
         * Access the internal `Checkbox` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `Checkbox` component instance and
         * this instance as parameters.
         * @returns This instance.
         */
        checkbox(cb) {
            cb(this._component, this);
            return this;
        }
        /**
         * Get/set the checked state of the checkbox (re-exported for easier direct access).
         */
        get Checked() {
            return this._component.Checked;
        }
        /** @inheritdoc */
        set Checked(v) {
            this._component.Checked = v;
        }
        /**
         * Set the the checked state of the checkbox to checked/unchecked (re-exported for easier direct
         * access).
         * @param checked `true`, if the checkbox should be checked, otherwise false.
         * @returns This instance.
         */
        checked(checked) {
            this._component.Checked = checked;
            return this;
        }
        /**
         * Get/set the indeterminate state of the checkbox (re-exported for easier direct access).
         */
        get Indeterminate() {
            return this._component.Indeterminate;
        }
        /** @inheritdoc */
        set Indeterminate(v) {
            this._component.Indeterminate = v;
        }
        /**
         * Sets the indeterminate state of the checkbox to indeterminate/determinate (re-exported for
         * easier direct access).
         * @param indeterminate `true`, if the state of the checkbox should be indeterminate, otherwise
         * false.
         * @returns This instance.
         */
        indeterminate(indeterminate) {
            this._component.indeterminate(indeterminate);
            return this;
        }
    }
    /**
     * Factory for `LabeledCheckbox` components.
     */
    class LabeledCheckboxFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledCheckbox component.\
         * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
         * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
         * `LabelAlignment.START` can lead to a visually rather weird appearance.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the checkbox. If `id` is `undefined` or omitted, a unique ID
         * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
         * will be set. Any other value will be used as the id attribute.
         * @param value The value of the checkbox input element.
         * @param name The `name` attribute of the checkbox input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label toggles the checkbox input element (a unique ID has
         *   been set automatically on the checkbox input element), if `lblAction` is `false`, clicking
         *   on the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the checkbox input element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledCheckbox component.
         */
        labeledCheckbox(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledCheckbox(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
        }
        /**
         * Create, set up and return LabeledCheckbox component. Identical to {@link labeledCheckbox()},
         * but the class name `switch` is added to the inner checkbox.\
         * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
         * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
         * `LabelAlignment.START` can lead to a visually rather weird appearance.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the checkbox. If `id` is `undefined` or omitted, a unique ID
         * will be generated. If `id` is explicitely set to `null` or an empty string, no id attribute
         * will be set. Any other value will be used as the id attribute.
         * @param value The value of the checkbox input element.
         * @param name The `name` attribute of the checkbox input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label toggles the checkbox input element (a unique ID has
         *   been set automatically on the checkbox input element), if `lblAction` is `false`, clicking
         *   on the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the checkbox input element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledCheckbox component.
         */
        labeledSwitch(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            const ls = new LabeledCheckbox(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction);
            ls.Checkbox.addClass("switch");
            return this.setupComponent(ls, data);
        }
    }

    /**
     * LabeledContainer component.
     *
     * Usage notes:
     *
     * - Although it may seem that `LabeledContainer` is a simple replacement for `Div` components (it
     *   implements `IChildren` like `Div`), this is not the case (see following points).
     * - The property `Component`or `Container` __must not be used to add/remove/... components__,
     *   instead use the respective functions of `LabeledContainer` itself! `Component` should only be
     *   used for styling  or other (readonly) purposes!
     * - `clear()` is a destryoing operation(!), for an alternative see `clearContent()`.
     * - Children of `LabeledContainer` _may_ traverse the component hierarchy with `someChild.Parent`,
     *   but a single call to `Parent` is not enough. Due to the internal component tree and the use of
     *   `AElementComponentWithInternalUI` (through the inheritance chain),
     *   `someChild.Parent?.Parent?.Parent` must be called to reach the containing `LabeledContainer`
     *   instance!
     */
    class LabeledContainer extends LabeledComponentGroup {
        /**
         * Create LabeledContainer component.
         * @param labelPhrase The phrasing content for the label.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         */
        constructor(labelPhrase, lblPosition, lblAlignment) {
            super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
            this
                // !! Mandatory.
                .setContent(new Div())
                // Set target DOM for the `IChildren` mixin!!
                .setChildrenDOMTarget(this._component.DOM);
        }
        /**
         * Get Container component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get Container() {
            return this._component;
        }
        /**
         * Access the internal container component via a callback function. Useful for seamless chaining
         * when creating instances of this component.
         * @param cb A callback function that receives the current container component instance and this
         * instance as parameters.
         * @returns This instance.
         */
        container(cb) {
            cb(this._component, this);
            return this;
        }
        /**
         * Removes _and disposes_ of all children from the labeled container (except the label).
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
        static {
            /** Mixin the IChildren implementation (which targets `this.component`). */
            mixin(false, this, AChildren);
        }
    }
    /**
     * Factory for `LabeledContainer` components.
     */
    class LabeledContainerFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledContainer component.
         * @param labelPhrase The phrasing content for the label.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledContainer component.
         */
        labeledContainer(labelPhrase, lblPosition, lblAlignment, data) {
            return this.setupComponent(new LabeledContainer(labelPhrase, lblPosition, lblAlignment), data);
        }
    }

    /**
     * Labeled email input component.
     */
    class LabeledEmailInput extends LabeledInputComponent {
        /**
         * Create LabeledEmailInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the email input element. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the email input element.
         * @param name The `name` attribute of the email input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the email input element (a unique ID has been
         *   set automatically on the email input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the email input element).
         */
        constructor(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new EmailInput(_id, value, name), labelPhrase, _id, lblPosition, lblAlignment, lblAction);
        }
        /**
         * Get EmailInput component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get EmailInput() {
            return this._component;
        }
        /**
         * Access the internal `EmailInput` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `EmailInput` component instance and
         * this instance as parameters.
         * @returns This instance.
         */
        emailInput(cb) {
            cb(this._component, this);
            return this;
        }
    }
    /**
     * Factory for `LabeledEmailInput` components.
     */
    class LabeledEmailInputFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledEmailInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the email input element. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the email input element.
         * @param name The `name` attribute of the email input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the email input element (a unique ID has been
         *   set automatically on the email input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the email input element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledEmailInput component.
         */
        labeledEmailInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledEmailInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
        }
    }

    /**
     * Labeled number input component.
     */
    class LabeledNumberInput extends LabeledInputComponent {
        /**
         * Create LabeledNumberInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the number input element. If `id` is `undefined` or omitted,
         * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the number input element.
         * @param name The `name` attribute of the number input element.
         * @param min The minimum value (attribute) of the number input.
         * @param max The maximum value (attribute) of the number input.
         * @param step The step value (attribute) of the number input.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the number input element (a unique ID has been
         *   set automatically on the number input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the number input element).
         */
        constructor(labelPhrase, id, value, name, min, max, step, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new NumberInput(_id, value, name, min, max, step), labelPhrase, _id, lblPosition, lblAlignment, lblAction);
        }
        /**
         * Get NumberInput component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get NumberInput() {
            return this._component;
        }
        /**
         * Access the internal `NumberInput` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `NumberInput` component instance and
         * this instance as parameters.
         * @returns This instance.
         */
        numberInput(cb) {
            cb(this._component, this);
            return this;
        }
    }
    /**
     * Factory for `LabeledNumberInput` components.
     */
    class LabeledNumberInputFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledNumberInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the number input element. If `id` is `undefined` or omitted,
         * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the number input element.
         * @param name The `name` attribute of the number input element.
         * @param min The minimum value (attribute) of the number input.
         * @param max The maximum value (attribute) of the number input.
         * @param step The step value (attribute) of the number input.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the number input element (a unique ID has been
         *   set automatically on the number input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the number input element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledNumberInput component.
         */
        labeledNumberInput(labelPhrase, id, value, name, min, max, step, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledNumberInput(labelPhrase, id, value, name, min, max, step, lblPosition, lblAlignment, lblAction), data);
        }
    }

    /**
     * Labeled paragraph component. Can be used to display short text information which has a label,
     * e.g. in info panels like
     * ```
     * First name: John
     * Last name:  Doe
     * Role:       User
     * ```
     * The contained paragraph element itself is a compoment (`P`) so it can be used to display styled
     * text by, for example, appending `Span`, `Em` and other components to it. The same applies for the
     * label, which is a `Span` component.
     */
    class LabeledParagraph extends LabeledComponentWithSpan {
        /**
         * Create LabeledParagraph component.
         * @param labelPhrase The phrasing content for the label.
         * @param paragraphPhrase The phrasing content for the p element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         */
        constructor(labelPhrase, paragraphPhrase, lblPosition, lblAlignment) {
            super(new P().phrase(...[paragraphPhrase ?? []].flat()), labelPhrase, lblPosition, lblAlignment);
        }
        /**
         * Get P component of this component. Equivalent to `Component`, just with a more descriptive
         * name.
         */
        get Paragraph() {
            return this._component;
        }
        /**
         * Access the internal `P` component via a callback function. Useful for seamless chaining when
         * creating instances of this component.
         * @param cb A callback function that receives the current `P` component instance and this
         * instance as parameters.
         * @returns This instance.
         */
        paragraph(cb) {
            cb(this._component, this);
            return this;
        }
        /**
         * Set the phrasing content of the components paragraph. __The setter `Phrase` here is an alias
         * for the property `this.Paragraph.Phrase`.__
         */
        set Phrase(phrase) {
            this._component.Phrase = phrase;
        }
        /**
         * Set the phrasing content of the the components paragraph. __The function `phrase()` here is
         * an alias for the function `this.Paragraph.phrase()` but it returns _this_ instance instead of
         * the 'Paragraph' instance.__
         * @param phrase The phrasing content to be set for the paragraph.
         * @returns This instance.
         */
        phrase(...phrase) {
            this._component.phrase(...phrase);
            return this;
        }
        /**
         * Set the phrasing content of the components paragraph. __The setter `Rephrase` here is an
         * alias for the property `this.Paragraph.Rephrase`.__
         */
        set Rephrase(phrase) {
            this._component.Rephrase = phrase;
        }
        /**
         * Set the phrasing content of the the components paragraph. __The function `rephrase()` here is
         * an alias for the function `this.Paragraph.rephrase()` but it returns _this_ instance instead
         * of the 'Paragraph' instance.__
         * @param phrase The phrasing content to be set for the paragraph.
         * @returns This instance.
         */
        rephrase(...phrase) {
            this._component.rephrase(...phrase);
            return this;
        }
    }
    /**
     * Factory for `LabeledParagraph` components.
     */
    class LabeledParagraphFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledParagraph component.
         * @param labelPhrase The phrasing content for the label.
         * @param paragraphPhrase The phrasing content for the p element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledParagraph component.
         */
        labeledParagraph(labelPhrase, paragraphPhrase, lblPosition, lblAlignment, data) {
            return this.setupComponent(new LabeledParagraph(labelPhrase, paragraphPhrase, lblPosition, lblAlignment), data);
        }
    }

    /**
     * Labeled password input component.
     */
    class LabeledPasswordInput extends LabeledInputComponent {
        /**
         * Create LabeledPasswordInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the password input element. If `id` is `undefined` or
         * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
         * string, no id attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the password input element.
         * @param name The `name` attribute of the password input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the password input element (a unique ID has
         *   been set automatically on the password input element), if `lblAction` is `false`, clicking
         *   on the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the password input element).
         */
        constructor(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new PasswordInput(_id, value, name), labelPhrase, _id, lblPosition, lblAlignment, lblAction);
        }
        /**
         * Get PasswordInput component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get PasswordInput() {
            return this._component;
        }
        /**
         * Access the internal `PasswordInput` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `PasswordInput` component instance
         * and this instance as parameters.
         * @returns This instance.
         */
        passwordInput(cb) {
            cb(this._component, this);
            return this;
        }
    }
    /**
     * Factory for `LabeledPasswordInput` components.
     */
    class LabeledPasswordInputFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledPasswordInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the password input element. If `id` is `undefined` or
         * omitted, a unique ID will be generated. If `id` is explicitely set to `null` or an empty
         * string, no id attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the password input element.
         * @param name The `name` attribute of the password input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the password input element (a unique ID has
         *   been set automatically on the password input element), if `lblAction` is `false`, clicking
         *   on the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the password input element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledPasswordInput component.
         */
        labeledPasswordInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledPasswordInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
        }
    }

    /**
     * Labeled radio button component.
     */
    class LabeledRadioButton extends LabeledInputComponent {
        /**
         * Create LabeledRadioButton component.\
         * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
         * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
         * `LabelAlignment.START` can lead to a visually rather weird appearance.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the radio button element. If `id` is `undefined` or omitted,
         * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the radio button element.
         * @param name The `name` attribute of the radio button element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses/toggles the radio button element (a unique ID
         *   has been set automatically on the radio button element), if `lblAction` is `false`,
         *   clicking on the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the radio button element).
         */
        constructor(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new RadioButton(_id, value, name)
                // Forward this event to make handling of the component easier.
                .on("checked", (ev) => {
                // ev.preventDefault();
                ev.stopImmediatePropagation();
                this.emit(new CheckedEvent("checked", this, { Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
            }), labelPhrase, _id, lblPosition ?? LabelPosition.END, lblAlignment, lblAction);
            // Support toggling also on label clicks.
            this._label.on("click", (ev) => {
                if (this._component.Toggle) {
                    ev.preventDefault();
                    this._component.checked(!this._component.Checked);
                    this._component.emit(new Event("input", DEFAULT_EVENT_INIT_DICT));
                    this._component.emit(new Event("change", DEFAULT_EVENT_INIT_DICT));
                }
            });
        }
        /**
         * Alternative property to 'Input' for accessing the contained radio button with a descriptive
         * name.
         */
        get RadioButton() {
            return this._component;
        }
        /**
         * Access the internal `RadioButton` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `RadioButton` component instance and
         * this instance as parameters.
         * @returns This instance.
         */
        radioButton(cb) {
            cb(this._component, this);
            return this;
        }
        /**
         * Get/set the checked state of the radio button (re-exported for easier direct access).
         */
        get Checked() {
            return this._component.Checked;
        }
        /** @inheritdoc */
        set Checked(v) {
            this._component.Checked = v;
        }
        /**
         * Set the the checked state of the radio button to checked/unchecked (re-exported for easier
         * direct access).
         * @param checked `true`, if the radio button should be checked, otherwise false.
         * @returns This instance.
         */
        checked(checked) {
            this._component.Checked = checked;
            return this;
        }
        /**
         * Allow toggling the radio button state (re-exported for easier direct access).
         */
        get Toggle() {
            return this._component.Toggle;
        }
        /** @inheritdoc */
        set Toggle(v) {
            this._component.Toggle = v;
        }
        /**
         * Allow or disallow toggling the radio button state (re-exported for easier direct access).
         * @param toggle `true`, if the radio button can be toggled, otherwise false.
         * @returns This instance.
         */
        toggle(toggle) {
            this._component.Toggle = toggle;
            return this;
        }
    }
    /**
     * Factory for `LabeledRadioButton` components.
     */
    class LabeledRadioButtonFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledRadioButton component.\
         * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
         * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
         * `LabelAlignment.START` can lead to a visually rather weird appearance.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the radio button element. If `id` is `undefined` or omitted,
         * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the radio button element.
         * @param name The `name` attribute of the radio button element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses/toggles the radio button element (a unique ID
         *   has been set automatically on the radio button element), if `lblAction` is `false`,
         *   clicking on the label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the radio button element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledRadioButton component.
         */
        labeledRadioButton(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledRadioButton(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
        }
    }

    /**
     * A component that holds a group of labeled radio buttons inside a `<div>` container.
     */
    class RadioButtonGroup extends AElementComponentWithInternalUI {
        _labeledRadioButtons = [];
        _name;
        _orientation;
        _labelPosition = LabelPosition.END;
        _labelAlignment = LabelAlignment.START;
        _toggle;
        /**
         * Create RadioButtonGroup component.
         * @param radioButtons An array of radio button data used to create the buttons.
         * @param name The `name` property for all radio buttons.
         * @param orientation The orientation of the labeled radio buttons.\
         * Default: {@link Orientation.VERTICAL}.
         * @param labelPosition The position of the label of the radio buttons.\
         * Default: {@link LabelPosition.END}.
         * @param labelAlignment The alignment of the label of the radio buttons.\
         * Default: {@link LabelAlignment.START}.
         */
        constructor(radioButtons, name, orientation = Orientation.VERTICAL, labelPosition = LabelPosition.END, labelAlignment = LabelAlignment.START) {
            super();
            this._name = name;
            super
                .initialize()
                .orientation(orientation)
                .labelPosition(labelPosition)
                .labelAlignment(labelAlignment)
                .radioButtons(radioButtons, name);
        }
        /**
         * Get an array of all contained labeled radio button components. Modifying this array has no
         * effect.\
         * __Note:__ The internal radio button component (property `RadioButton`/`Component`) of each
         * labeled radio button will never fire the event `checked`. Instead, listening for this event
         * must be done on the radio button group instance itself.
         */
        get LabeledRadioButtons() {
            return this._labeledRadioButtons.slice();
        }
        /**
         * Set the radio buttons of this group.\
         * __Note:__ Setting new radio buttons clears the internal list of radio buttons and also
         * disposes of all previously contained radio buttons, so instances of radio buttons obtained
         * before with the getter `RadioButtons` are unusable after this operation!
         * @param radioButtons The radio buttons to be set.
         * @param name The `name` property for all radio buttons.
         * @param keepValue If `true`, the previous value of the radio button group will be restored (if
         * possible).
         * @returns This instance.
         */
        radioButtons(radioButtons, name, keepValue) {
            const oldValue = this.Value;
            this.ui.remove();
            for (const rb of this._labeledRadioButtons) {
                rb.dispose();
            }
            this._name = name;
            this._labeledRadioButtons.length = 0;
            this._labeledRadioButtons.push(...radioButtons.map(item => {
                const lrb = new LabeledRadioButton(item.Label, item.ID, item.Value, this._name, this._labelPosition, this._labelAlignment, undefined)
                    .parentDisabled(this.Disabled)
                    .addClass(LabeledRadioButton.DefaultCSSClassName);
                // Listen on `lrb` instead of `lrb.RadioButton` for `checked`. The internal radio
                // button component does not fire this event (propagation is stopped there).
                lrb.on("checked", (ev) => {
                    ev.stopImmediatePropagation();
                    this.emit(new CheckedEvent("checked", this, { LabeledRadioButton: lrb, Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
                });
                return lrb;
            }));
            keepValue && oldValue && this.value(oldValue);
            this.ui.append(...this._labeledRadioButtons);
            return this;
        }
        /**
         * Get/set `name` attribute value of the component. Internally the setter sets the `name`
         * attribute on all contained radio buttons. `null` or an empty string removes the attribute.
         */
        get Name() {
            return this._name;
        }
        /** @inheritdoc */
        set Name(v) {
            this.name(v);
        }
        /**
         * Set `name` attribute value of this radio button group. Internally this sets the `name`
         * attribute on all contained radio buttons.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @returns This instance.
         */
        name(v) {
            for (const rb of this._labeledRadioButtons) {
                rb.RadioButton.name(v);
            }
            return this;
        }
        /**
         * Gets/sets the value of this radio button group. For `get` this is the value of the first
         * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
         * it is found, its status is set to checked.
         */
        get Value() {
            for (const radioButton of this._labeledRadioButtons) {
                if (radioButton.Checked) {
                    return radioButton.Value;
                }
            }
            return "";
        }
        /** @inheritdoc */
        set Value(v) {
            this.value(v);
        }
        /**
         * Set the value of this radio button group.
         * @param v The value to be set.
         * @see {@link RadioButtonGroup.Value}.
         * @returns This instance.
         */
        value(v) {
            for (const radioButton of this._labeledRadioButtons) {
                radioButton.checked(false);
            }
            if (v !== null) {
                for (const radioButton of this._labeledRadioButtons) {
                    if (radioButton.Value === v) {
                        radioButton.checked(true);
                        break;
                    }
                }
            }
            return this;
        }
        /**
         * Allow toggling the radio button state of all contained radio buttons.
         */
        get Toggle() {
            return this._toggle;
        }
        /** @inheritdoc */
        set Toggle(v) {
            this.toggle(v);
        }
        /**
         * Allow or disallow toggling the radio button state of all contained radio buttons.
         * @param toggle `true`, if the radio buttons can be toggled, otherwise false.
         * @returns This instance.
         */
        toggle(toggle) {
            if (toggle !== this._toggle) {
                this._toggle = toggle;
                for (const radioButton of this._labeledRadioButtons) {
                    radioButton.RadioButton.toggle(toggle);
                }
            }
            return this;
        }
        /**
         * Gets/sets the orientation of the contained labeled radio buttons.
         */
        get Orientation() {
            return this._orientation;
        }
        /** @inheritdoc */
        set Orientation(v) {
            this.orientation(v);
        }
        /**
         * Sets the orientation of the contained labeled radio buttons.
         * @param orientation The orientation of the labeled radio buttons.
         * @returns This instance.
         */
        orientation(orientation) {
            if (orientation !== this._orientation) {
                this._orientation = orientation;
                this._orientation === Orientation.HORIZONTAL
                    ? this.removeClass("vertical").addClass("horizontal")
                    : this.removeClass("horizontal").addClass("vertical");
            }
            return this;
        }
        /**
         * Gets/sets the label position of the contained labeled radio buttons.
         */
        get LabelPosition() {
            return this._labelPosition;
        }
        /** @inheritdoc */
        set LabelPosition(v) {
            this.labelPosition(v);
        }
        /**
         * Sets the label position of the contained labeled radio buttons.
         * @param labelPosition The label position of the labeled radio buttons.
         * @returns This instance.
         */
        labelPosition(labelPosition) {
            if (labelPosition !== this._labelPosition) {
                this._labelPosition = labelPosition;
                for (const radioButton of this._labeledRadioButtons) {
                    radioButton.labelPosition(labelPosition);
                }
            }
            return this;
        }
        /**
         * Gets/sets the label alignment of the contained labeled radio buttons.
         */
        get LabelAlignment() {
            return this._labelAlignment;
        }
        /** @inheritdoc */
        set LabelAlignment(v) {
            this.labelAlignment(v);
        }
        /**
         * Sets the label alignment of the contained labeled radio buttons.
         * @param labelAlignment The label alignment of the labeled radio buttons.
         * @returns This instance.
         */
        labelAlignment(labelAlignment) {
            if (labelAlignment !== this._labelAlignment) {
                this._labelAlignment = labelAlignment;
                for (const radioButton of this._labeledRadioButtons) {
                    radioButton.labelAlignment(labelAlignment);
                }
            }
            return this;
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = new Div();
            return this;
        }
        /** @inheritdoc */
        focus(options) {
            (this._labeledRadioButtons.find(e => e.Checked) || this._labeledRadioButtons[0])?.focus(options);
            return this;
        }
        /** @inheritdoc */
        blur() {
            (this._labeledRadioButtons.find(e => e.Checked) || this._labeledRadioButtons[0])?.blur();
            return this;
        }
    }
    /**
     * Factory for `RadioButtonGroup` components.
     */
    class RadioButtonGroupFactory extends ComponentFactory {
        /**
         * Create, set up and return RadioButtonGroup component.
         * @param radioButtons An array of radio button data used to create the buttons.
         * @param name The `name` property for all radio buttons.
         * @param orientation The orientation of the labeled radio buttons.\
         * Default: {@link Orientation.VERTICAL}.
         * @param labelPosition The position of the label of the radio buttons.\
         * Default: {@link LabelPosition.END}.
         * @param labelAlignment The alignment of the label of the radio buttons.\
         * Default: {@link LabelAlignment.START}.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns RadioButtonGroup component.
         */
        radioButtonGroup(radioButtons, name, orientation = Orientation.VERTICAL, labelPosition = LabelPosition.END, labelAlignment = LabelAlignment.START, data) {
            return this.setupComponent(new RadioButtonGroup(radioButtons, name, orientation, labelPosition, labelAlignment), data);
        }
    }

    /**
     * Labeled radio button group component.
     */
    class LabeledRadioButtonGroup extends LabeledComponentGroup {
        /**
         * Create LabeledRadioButtonGroup component.
         * @param labelPhrase The phrasing content for the label.
         * @param radioButtons An array of radio button data used to create the buttons.
         * @param name The `name` property for all radio buttons.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param orientation The orientation of the labeled radio buttons.
         */
        constructor(labelPhrase, radioButtons, name, lblPosition = LabelPosition.TOP, lblAlignment = LabelAlignment.START, orientation = Orientation.VERTICAL) {
            super(labelPhrase, lblPosition, lblAlignment);
            // !! Mandatory.
            this.setContent(new RadioButtonGroup(radioButtons, name, orientation).addClass(RadioButtonGroup.DefaultCSSClassName));
            // Reshape this event to the correct sender (this).
            this._component.on("checked", (ev) => {
                ev.stopImmediatePropagation();
                this.emit(new CheckedEvent("checked", this, { LabeledRadioButton: ev.$.LabeledRadioButton, Checked: ev.$.Checked })); // eslint-disable-line jsdoc/require-jsdoc
            });
        }
        /**
         * Get the internal radio button group component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get RadioButtonGroup() {
            return this._component;
        }
        /**
         * Access the internal `RadioButtonGroup` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `RadioButtonGroup` component instance
         * and this instance as parameters.
         * @returns This instance.
         */
        radioButtonGroup(cb) {
            cb(this._component, this);
            return this;
        }
        /**
         * Get an array of all contained labeled radio buttons (as a copy). Also available via
         * `RadioButtonGroup`, re-exported here for convenience.
         * __Note:__ The internal radio button component (property `RadioButton`/`Component`) of each
         * labeled radio button will never fire the event `checked`. Instead, listening for this event
         * must be done on the labeled radio button group instance itself.
         */
        get LabeledRadioButtons() {
            return this._component.LabeledRadioButtons;
        }
        /**
         * Get/set `name` attribute value of the component. Internally the setter sets the `name`
         * attribute on all contained radio buttons. `null` or an empty string removes the attribute.
         * Equivalent to get/set `<instance>.RadioButtonGroup.Name`.
         */
        get Name() {
            return this._component.Name;
        }
        /** @inheritdoc */
        set Name(v) {
            this.name(v);
        }
        /**
         * Set `name` attribute value of this radio button group. Internally this sets the `name`
         * attribute on all contained radio buttons. Equivalent to `<instance>.RadioButtonGroup.name()`.
         * @param v The value to be set. `null` or an empty string removes the attribute.
         * @returns This instance.
         */
        name(v) {
            this._component.name(v);
            return this;
        }
        /**
         * Gets/sets the value of this radio button group. For `get` this is the value of the first
         * checked radio button, for `set` a radio button with `<rb>.Value === v` is searched for and if
         * it is found, its status is set to checked. Also available via `RadioButtonGroup`, re-exported
         * here for convenience.
         */
        get Value() {
            return this._component.Value;
        }
        /** @inheritdoc */
        set Value(v) {
            this._component.value(v);
        }
        /**
         * Set the value of this radio button group. Also available via `RadioButtonGroup`, re-exported
         * here for convenience.
         * @param v The value to be set.
         * @see {@link LabeledRadioButtonGroup.Value}
         * @returns This instance.
         */
        value(v) {
            this._component.value(v);
            return this;
        }
        /**
         * Allow toggling the radio button state of all contained radio buttons. Also available via
         * `RadioButtonGroup`, re-exported here for convenience.
         */
        get Toggle() {
            return this._component.Toggle;
        }
        /** @inheritdoc */
        set Toggle(v) {
            this._component.toggle(v);
        }
        /**
         * Allow or disallow toggling the radio button state of all contained radio buttons. Also
         * available via `RadioButtonGroup`, re-exported here for convenience.
         * @param toggle `true`, if the radio buttons can be toggled, otherwise false.
         * @returns This instance.
         */
        toggle(toggle) {
            this._component.toggle(toggle);
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
     * Factory for `LabeledRadioButtonGroup` components.
     */
    class LabeledRadioButtonGroupFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledRadioButtonGroup component.
         * @param labelPhrase The phrasing content for the label.
         * @param radioButtons An array of radio button data used to create the buttons.
         * @param name The `name` property for all radio buttons.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param orientation The orientation of the labeled radio buttons.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledRadioButtonGroup component.
         */
        labeledRadioButtonGroup(labelPhrase, radioButtons, name, lblPosition = LabelPosition.TOP, lblAlignment = LabelAlignment.START, orientation = Orientation.VERTICAL, data) {
            return this.setupComponent(new LabeledRadioButtonGroup(labelPhrase, radioButtons, name, lblPosition, lblAlignment, orientation), data);
        }
    }

    /**
     * Labeled search input component.
     */
    class LabeledSearchInput extends LabeledInputComponent {
        /**
         * Create LabeledSearchInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the search input element. If `id` is `undefined` or omitted,
         * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the search input element.
         * @param name The `name` attribute of the search input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the search input element (a unique ID has been
         *   set automatically on the search input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the search input element).
         */
        constructor(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new SearchInput(_id, value, name), labelPhrase, _id, lblPosition, lblAlignment, lblAction);
        }
        /**
         * Get SearchInput component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get SearchInput() {
            return this._component;
        }
        /**
         * Access the internal `SearchInput` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `SearchInput` component instance and
         * this instance as parameters.
         * @returns This instance.
         */
        searchInput(cb) {
            cb(this._component, this);
            return this;
        }
    }
    /**
     * Factory for `LabeledSearchInput` components.
     */
    class LabeledSearchInputFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledSearchInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the search input element. If `id` is `undefined` or omitted,
         * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the search input element.
         * @param name The `name` attribute of the search input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the search input element (a unique ID has been
         *   set automatically on the search input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the search input element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledSearchInput component.
         */
        labeledSearchInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledSearchInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
        }
    }

    /**
     * Labeled select component.
     */
    class LabeledSelect extends LabeledComponentWithLabel {
        /**
         * Create LabeledSelect component.
         * @param labelPhrase The phrasing content for the label.
         * @param values The values to be displayed in the select element.
         * @param id The id (attribute) of the select element. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the select element.
         * @param name The `name` attribute of the select element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the select element (a unique ID has been set
         *   automatically on the select element), if `lblAction` is `false`, clicking on the label does
         *   nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the select element).
         */
        constructor(labelPhrase, values, id, value, name, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new Select(values, _id, value, name), labelPhrase, _id, lblPosition, lblAlignment, lblAction);
        }
        /**
         * Get select component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get Select() {
            return this._component;
        }
        /**
         * Access the internal `Select` component via a callback function. Useful for seamless chaining
         * when creating instances of this component.
         * @param cb A callback function that receives the current `Select` component instance and this
         * instance as parameters.
         * @returns This instance.
         */
        select(cb) {
            cb(this._component, this);
            return this;
        }
        /**
         * __The property `Value` here is an alias for the property `this.Select.Value`.__
         */
        get Value() {
            return this._component.Value;
        }
        /** @inheritdoc */
        set Value(v) {
            this._component.Value = v;
        }
        /**
         * __The function `value()` here is an alias for the function `this.Select.value()` but it
         * returns _this_ instance instead of the 'TextArea' instance.__
         * @param v The value to be set.
         * @returns This instance.
         */
        value(v) {
            this._component.value(v);
            return this;
        }
    }
    /**
     * Factory for `LabeledSelect` components.
     */
    class LabeledSelectFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledSelect component.
         * @param labelPhrase The phrasing content for the label.
         * @param values The values to be displayed in the select element.
         * @param id The id (attribute) of the select element. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the select element.
         * @param name The `name` attribute of the select element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the select element (a unique ID has been set
         *   automatically on the select element), if `lblAction` is `false`, clicking on the label does
         *   nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the select element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledSelect component.
         */
        labeledSelect(labelPhrase, values, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledSelect(labelPhrase, values, id, value, name, lblPosition, lblAlignment, lblAction), data);
        }
    }

    /**
     * Labeled text input component.
     */
    class LabeledTextInput extends LabeledInputComponent {
        /**
         * Create LabeledTextInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the text input element. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the text input element.
         * @param name The `name` attribute of the text input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the text input element (a unique ID has been
         *   set automatically on the text input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the text input element).
         */
        constructor(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction) {
            const _id = id === undefined
                ? cid()
                : id === null || id === ""
                    ? null
                    : id;
            super(new TextInput(_id, value, name), labelPhrase, _id, lblPosition, lblAlignment, lblAction);
        }
        /**
         * Get TextInput component of this component. Equivalent to `Component`, just with a more
         * descriptive name.
         */
        get TextInput() {
            return this._component;
        }
        /**
         * Access the internal `TextInput` component via a callback function. Useful for seamless
         * chaining when creating instances of this component.
         * @param cb A callback function that receives the current `TextInput` component instance and
         * this instance as parameters.
         * @returns This instance.
         */
        textInput(cb) {
            cb(this._component, this);
            return this;
        }
    }
    /**
     * Factory for `LabeledTextInput` components.
     */
    class LabeledTextInputFactory extends ComponentFactory {
        /**
         * Create, set up and return LabeledTextInput component.
         * @param labelPhrase The phrasing content for the label.
         * @param id The id (attribute) of the text input element. If `id` is `undefined` or omitted, a
         * unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
         * attribute will be set. Any other value will be used as the id attribute.
         * @param value The value of the text input element.
         * @param name The `name` attribute of the text input element.
         * @param lblPosition The position of the label.
         * @param lblAlignment The alignment of the label.
         * @param lblAction Controls the following behavior:
         * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
         *   or `undefined`, a click on the label focuses the text input element (a unique ID has been
         *   set automatically on the text input element), if `lblAction` is `false`, clicking on the
         *   label does nothing.
         * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
         *   has been set on the text input element).
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns LabeledTextInput component.
         */
        labeledTextInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction, data) {
            return this.setupComponent(new LabeledTextInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
        }
    }

    /**
     * Container with scroll bars. This component enables a uniform design of scroll bars across all
     * platforms/UAs. The design and behavior of the scroll bars is based on the scroll bars of macOS.
     *
     * Usage notes:
     *
     * - Although it may seem that `ScrollContainer` is a simple replacement for `Div` components (it
     *   implements `IChildren` like `Div`), this is not the case (see following points).
     * - Due to the internal component tree, some CSS adjustments may be necessary compared to a normal
     *   `Div` component. This is especially true for `padding`, which should always be `0`, otherwise
     *   some internal calculations will lead to results that end up in a broken layout. Instead use
     *   padding on the inner container (property `Content`). The same is true for other CSS properties
     *   e.g. `flex`, `display` etc. In some cases `width` and `height` for the inner container must
     *   also be adjusted.
     * - Do not use `Content` to add/remove/... components, instead use the functions of
     *   `ScrollContainer` itself. Components added/removed/... via `Content` are not monitored for size
     *   changes and thus the scroll bars may get out of sync.
     * - `clear()` is a destryoing operation(!), for an alternative see `clearContent()`.
     * - Children of `ScrollContainer` _may_ traverse the component hierarchy with `someChild.Parent`,
     *   but a single call to `Parent` is not enough. Due to the internal component tree and the use of
     *   `AElementComponentWithInternalUI`, `someChild.Parent?.Parent?.Parent` must be called to reach
     *   the containing `ScrollContainer` instance!
     */
    class ScrollContainer extends AElementComponentWithInternalUI {
        #_dom_;
        #contentContainer;
        #scrollable;
        #_horizontal;
        #_vertical;
        #_native = false;
        #isRTL = false;
        #hAdjustment;
        #vAdjustment;
        #hBarStartOffset = 0;
        #hBarReduceWidth = 0;
        #vBarStartOffset = 0;
        #vBarReduceHeight = 0;
        // Precalculated scroll ranges (see `#syncScrollBarGeometry()` and `#repositionScrollBars()`)
        #hScrollRange;
        #hBarScrollRange;
        #vScrollRange;
        #vBarScrollRange;
        // UI parts.
        #hBarOverlay;
        #hBar;
        #hBarThumb;
        #vBarOverlay;
        #vBar;
        #vBarThumb;
        #passiveTrue = { passive: true }; // eslint-disable-line jsdoc/require-jsdoc
        #passiveFalse = { passive: false }; // eslint-disable-line jsdoc/require-jsdoc
        // Listeners for syncing the scroll bars with the scroll position of the inner content container.
        #onScrollListener = this.#syncScrollBars.bind(this);
        #onScrollEndListener = this.#onScrollEnd.bind(this);
        // Listener for mouse wheel events on the scroll bars.
        #onWheelListener = this.#onWheel.bind(this);
        // Observers for the size of children and the child list of the inner container.
        #resizeObserver;
        #mutationObserver;
        // Resize observer for components given to `horizontalAdjustment()` or `verticalAdjustment()`.
        #adjustmentResizeObserver;
        // Moving of a scroll bar thumb.
        #dragging = false;
        #dragStart = new DOMPoint(-Infinity, -Infinity);
        #dragStartElementPos = new DOMPoint(-Infinity, -Infinity);
        #draggingThumb;
        #draggingThumbRect = new DOMRect(0, 0, 0, 0);
        #draggingBarRect = new DOMRect(0, 0, 0, 0);
        #fncOnDragThumbPointerDown = this.#onDragThumbPointerDown.bind(this);
        #fncOnDragThumbPointerMove = this.#onDragThumbPointerMove.bind(this);
        #fncOnDragThumbPointerUp = this.#onDragThumbPointerUp.bind(this);
        // Scrolling by holding down a pointer or by clicking on a scroll bar.
        #contScrollStartPos = new DOMPoint(0, 0);
        #contScrollHorizontal = false;
        #contScrollBackwards = false;
        #scrollPageLength = 0;
        #isPointerDown = false;
        #lastScrollPos = new DOMPoint(0, 0);
        #onScrollEndTimeout;
        #fncOnScrollBarPointerDown = this.#onScrollBarPointerDown.bind(this);
        #fncOnScrollBarPointerUp = this.#onScrollBarPointerUp.bind(this);
        /**
         * Create ScrollContainer component.
         * @param horizontal `true`, if a horizontal scroll bar is to be displayed, otherwise `false`.
         * @param vertical `true`, if a vertical scroll bar is to be displayed, otherwise `false`.
         * @param native `true`, if native scroll bars are to be used, otherwise `false`. If `true` is
         * used permanently consider staying away from `ScrollContainer` since the actual purpose of
         * this component is to enable a uniform design of scroll bars across all platforms/UAs.
         * @param horizontalAdjustment Adjustment of the size and position of the horizontal scroll bar.
         * @param verticalAdjustment Adjustment of the size and position of the vertical scroll bar.
         */
        constructor(horizontal = true, vertical = true, native = false, horizontalAdjustment, verticalAdjustment) {
            super();
            this.#_horizontal = horizontal;
            this.#_vertical = vertical;
            this.initialize(true)
                .horizontalAdjustment(horizontalAdjustment)
                .verticalAdjustment(verticalAdjustment)
                .native(native);
        }
        /**
         * Get/set the availability of the horizontal scroll bar.
         */
        get Horizontal() {
            return this.#_horizontal;
        }
        /** @inheritdoc */
        set Horizontal(v) {
            this.horizontal(v);
        }
        /**
         * Set the availability of the horizontal scroll bar.
         * @param horizontal `true`, if a horizontal scroll bar is available, otherwise `false`.
         * @returns This instance.
         */
        horizontal(horizontal) {
            if (horizontal !== this.#_horizontal) {
                this.#_horizontal = horizontal;
                this.#_horizontal ? this.#_dom_.classList.add("horizontal") : this.#_dom_.classList.remove("horizontal");
                this.#_horizontal ? this.#_dom_.appendChild(this.#hBarOverlay) : this.#hBarOverlay.remove();
            }
            return this;
        }
        /**
         * Get/set the availability of the vertical scroll bar.
         */
        get Vertical() {
            return this.#_vertical;
        }
        /** @inheritdoc */
        set Vertical(v) {
            this.vertical(v);
        }
        /**
         * Set the availability of the vertical scroll bar.
         * @param vertical `true`, if a vertical scroll bar is available, otherwise `false`.
         * @returns This instance.
         */
        vertical(vertical) {
            if (vertical !== this.#_vertical) {
                this.#_vertical = vertical;
                this.#_vertical ? this.#_dom_.classList.add("vertical") : this.#_dom_.classList.remove("vertical");
                this.#_vertical ? this.#_dom_.appendChild(this.#vBarOverlay) : this.#vBarOverlay.remove();
            }
            return this;
        }
        /**
         * Get/set the availability of native scroll bars.
         */
        get Native() {
            return this.#_native;
        }
        /** @inheritdoc */
        set Native(v) {
            this.native(v);
        }
        /**
         * Turn the availability of native scroll bars on or off.
         * @param native `true`, if native scroll bars are to be used, otherwise `false`.
         * @returns This instance.
         */
        native(native) {
            if (native !== this.#_native) {
                this.#_native = native;
                // Workaround for WebKit/Safari bug.
                const oldX = this.#scrollable.style.overflowX;
                const oldY = this.#scrollable.style.overflowY;
                //
                if (this.#_native) {
                    this.#draggingThumb?.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove, this.#passiveTrue);
                    this.#_dom_.removeEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
                    this.#_dom_.removeEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
                    this.#hBarOverlay.remove();
                    this.#vBarOverlay.remove();
                    this.#_dom_.classList.add("native");
                }
                else {
                    this.#scrollable.addEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
                    this.#scrollable.addEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
                    this.#_dom_.insertBefore(this.#vBarOverlay, this.#scrollable);
                    this.#_dom_.insertBefore(this.#hBarOverlay, this.#vBarOverlay);
                    this.#_dom_.classList.remove("native");
                    this.#syncScrollBarGeometry();
                }
                // Workaround for WebKit/Safari bug.
                this.#scrollable.style.overflowX = "hidden";
                this.#scrollable.style.overflowY = "hidden";
                setTimeout(() => {
                    this.#scrollable.style.overflowX = oldX;
                    this.#scrollable.style.overflowY = oldY;
                }, 10);
                //
            }
            return this;
        }
        /**
         * Get/set the size and position adjustment for the horizontal scroll bar. `get` returns a copy!
         */
        get HorizontalAdjustment() {
            return { ...this.#hAdjustment };
        }
        /** @inheritdoc */
        set HorizontalAdjustment(v) {
            this.horizontalAdjustment(v);
        }
        /**
         * Set the size and position adjustment for the horizontal scroll bar.
         * @param scrollbarAdjustment Size and position adjustment for the horizontal scroll bar.
         * @returns This instance.
         */
        horizontalAdjustment(scrollbarAdjustment) {
            if (this.#hAdjustment && typeof this.#hAdjustment.Offset !== "number") {
                this.#adjustmentResizeObserver.unobserve(this.#hAdjustment?.Offset.DOM);
            }
            if (this.#hAdjustment && typeof this.#hAdjustment?.ReduceSize !== "number") {
                this.#adjustmentResizeObserver.unobserve(this.#hAdjustment?.ReduceSize.DOM);
            }
            this.#hAdjustment = scrollbarAdjustment ? { ...scrollbarAdjustment } : { Offset: 0, ReduceSize: 0 }; // eslint-disable-line jsdoc/require-jsdoc
            if (typeof this.#hAdjustment.Offset !== "number") {
                this.#adjustmentResizeObserver.observe(this.#hAdjustment.Offset.DOM);
                this.#hBarStartOffset = this.#hAdjustment.Offset.DOM.offsetLeft;
            }
            else {
                this.#hBarStartOffset = this.#hAdjustment.Offset;
            }
            if (typeof this.#hAdjustment.ReduceSize !== "number") {
                this.#adjustmentResizeObserver.observe(this.#hAdjustment.ReduceSize.DOM);
                this.#hBarReduceWidth = this.#hAdjustment.ReduceSize.DOM.offsetWidth;
            }
            else {
                this.#hBarReduceWidth = this.#hAdjustment.ReduceSize;
            }
            this.#syncScrollBarGeometry();
            return this;
        }
        /**
         * Get/set the size and position adjustment for the vertical scroll bar. `get` returns a copy!
         */
        get VerticalAdjustment() {
            return { ...this.#vAdjustment };
        }
        /** @inheritdoc */
        set VerticalAdjustment(v) {
            this.verticalAdjustment(v);
        }
        /**
         * Set the size and position adjustment for the vertical scroll bar.
         * @param scrollbarAdjustment Size and position adjustment for the vertical scroll bar.
         * @returns This instance.
         */
        verticalAdjustment(scrollbarAdjustment) {
            if (this.#vAdjustment && typeof this.#vAdjustment.Offset !== "number") {
                this.#adjustmentResizeObserver.unobserve(this.#vAdjustment?.Offset.DOM);
            }
            if (this.#vAdjustment && typeof this.#vAdjustment?.ReduceSize !== "number") {
                this.#adjustmentResizeObserver.unobserve(this.#vAdjustment?.ReduceSize.DOM);
            }
            this.#vAdjustment = scrollbarAdjustment ? { ...scrollbarAdjustment } : { Offset: 0, ReduceSize: 0 }; // eslint-disable-line jsdoc/require-jsdoc
            if (typeof this.#vAdjustment.Offset !== "number") {
                this.#adjustmentResizeObserver.observe(this.#vAdjustment.Offset.DOM);
                this.#vBarStartOffset = this.#vAdjustment.Offset.DOM.offsetTop;
            }
            else {
                this.#vBarStartOffset = this.#vAdjustment.Offset;
            }
            if (typeof this.#vAdjustment.ReduceSize !== "number") {
                this.#adjustmentResizeObserver.observe(this.#vAdjustment.ReduceSize.DOM);
                this.#vBarReduceHeight = this.#vAdjustment.ReduceSize.DOM.offsetHeight;
            }
            else {
                this.#vBarReduceHeight = this.#vAdjustment.ReduceSize;
            }
            this.#syncScrollBarGeometry();
            return this;
        }
        /**
         * Get the current scroll offset of the scroll container.
         */
        get ScrollOffset() {
            return { X: this.#scrollable.scrollLeft, Y: this.#scrollable.scrollTop }; // eslint-disable-line jsdoc/require-jsdoc
        }
        /** @inheritdoc */
        scroll(arg1, arg2) {
            if ((typeof arg1 === "number") && (typeof arg2 === "number")) {
                this.#scrollable.scroll(arg1, arg2);
            }
            else {
                this.#scrollable.scroll(arg1);
            }
            return this;
        }
        /** @inheritdoc */
        scrollBy(arg1, arg2) {
            if ((typeof arg1 === "number") && (typeof arg2 === "number")) {
                this.#scrollable.scrollBy(arg1, arg2);
            }
            else {
                this.#scrollable.scrollBy(arg1);
            }
            return this;
        }
        /**
         * Get the inner content container (the one which holds the components of the scrollable area).\
         * __Note:__ This property __must not be used to add/remove/... components__, instead use the
         * respective functions of `ScrollContainer` itself! `Content` should only be used for styling
         * or other (readonly) purposes!
         */
        get Content() {
            return this.#contentContainer;
        }
        /**
         * Removes _and disposes_ of all regular children from the scroll container.
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
         * Syncs the geometry and the position of the scroll bars. Although `ScrollContainer` tries to
         * detect any changes that may affect the geometry and the position of the scroll bars these
         * checks currently won't detect, for example, a change of `dir="rtl"` somewhere in the DOM.
         * Changes like this would need a rearrangement which can be carried out manually with `sync()`.
         * This can be remedied by calling `sync()` from within a custom suitable MutationObserver.
         */
        sync() {
            this.#syncScrollBarGeometry();
        }
        /**
         * Syncs the geometry of the handles and the visibility of the scroll bars based on the current
         * scroll container size and the current settings/offsets.
         */
        #syncScrollBarGeometry() {
            if (this.#_native) {
                return;
            }
            let hboWidth = "";
            let hasHOff = false;
            let vboHeight = "";
            let hasVOff = false;
            this.#isRTL = getComputedStyle(this.#_dom_).direction === "rtl";
            this.#isRTL
                ? this.#_dom_.classList.add("rtl")
                : this.#_dom_.classList.remove("rtl");
            if (this.#_horizontal) {
                const w = this.#scrollable.clientWidth;
                const sw = this.#scrollable.scrollWidth || 0.000001;
                this.#hBarOverlay.style.display = w < sw ? "" : "none";
                hboWidth = Math.max(w - this.#hBarStartOffset - this.#hBarReduceWidth, 0) + "px";
                this.#hBarOverlay.style.insetInlineStart = this.#hBarStartOffset + this.#hBarReduceWidth + "px";
                hasHOff = w >= sw;
                hasHOff ? this.#_dom_.classList.add("h-off") : this.#_dom_.classList.remove("h-off");
                hasHOff && (this.#vBarOverlay.style.height = "");
                this.#hBarThumb.style.width = w < sw ? (w / sw * 100) + "%" : "100%";
            }
            else {
                this.#hBarOverlay.style.display = "none";
            }
            if (this.#_vertical) {
                const h = this.#scrollable.clientHeight;
                const sh = this.#scrollable.scrollHeight || 0.000001;
                this.#vBarOverlay.style.display = h < sh ? "" : "none";
                vboHeight = Math.max(h - this.#vBarStartOffset - this.#vBarReduceHeight, 0) + "px";
                this.#vBarOverlay.style.insetBlockStart = this.#vBarStartOffset + this.#vBarReduceHeight + "px";
                hasVOff = h >= sh;
                hasVOff ? this.#_dom_.classList.add("v-off") : this.#_dom_.classList.remove("v-off");
                hasVOff && (this.#hBarOverlay.style.width = "");
                this.#vBarThumb.style.height = h < sh ? (h / sh * 100) + "%" : "100%";
            }
            else {
                this.#vBarOverlay.style.display = "none";
            }
            let repositionScrollBars = false;
            if (this.#_horizontal && !this.#scrollable.classList.contains("v-off")) {
                this.#hBarOverlay.style.width = !hasVOff
                    // FIXME: Don't use a CSS variable in code.
                    ? `calc(${Math.max(this.#scrollable.clientWidth - this.#hBarStartOffset - this.#hBarReduceWidth - this.#vBar.offsetWidth, 0)}px - var(--scrollbar-thumb-gap))`
                    : hboWidth;
                repositionScrollBars = true;
            }
            if (this.#_vertical && !this.#scrollable.classList.contains("h-off")) {
                this.#vBarOverlay.style.height = !hasHOff
                    // FIXME: Don't use a CSS variable in code.
                    ? `calc(${Math.max(this.#scrollable.clientHeight - this.#vBarStartOffset - this.#vBarReduceHeight - this.#hBar.offsetHeight, 0)}px - var(--scrollbar-thumb-gap))`
                    : vboHeight;
                repositionScrollBars = true;
            }
            this.#hScrollRange = this.#scrollable.scrollWidth - this.#scrollable.offsetWidth;
            this.#hBarScrollRange = this.#hBar.offsetWidth - this.#hBarThumb.offsetWidth;
            this.#vScrollRange = this.#scrollable.scrollHeight - this.#scrollable.offsetHeight;
            this.#vBarScrollRange = this.#vBar.offsetHeight - this.#vBarThumb.offsetHeight;
            repositionScrollBars && this.#repositionScrollBars();
        }
        /**
         * Syncs the position of the handles and the scroll bars with the current scroll position.
         * @param _event The scroll event.
         */
        #syncScrollBars(_event) {
            this.#_dom_.classList.add("scrolling");
            this.#repositionScrollBars();
        }
        /**
         * Repositions the position of the handles and the scroll bars according to the current scroll
         * position.
         */
        #repositionScrollBars() {
            if (this.#_native) {
                return;
            }
            /**
             * - `transform: translate` works but would need additional calculations in
             *   `onDragThumbPointerDown()` since the coordinates are translated.
             * - `animate()` also works very well but it doesn't seem to consume less CPU than
             *   `insetInlineStart` or `insetBlockStart`.
             * - `insetInlineStart` and `insetBlockStart` work very well and requiere the least amount
             *   of code.
             */
            if (this.#_horizontal && this.#hBarScrollRange > 0) {
                // ---
                this.#hBarThumb.style.insetInlineStart = clamp(this.#hBarScrollRange * (this.#isRTL ? -this.#scrollable.scrollLeft : this.#scrollable.scrollLeft) / this.#hScrollRange, 0, this.#hBarScrollRange) + "px";
                // ---
                // const offset = this.#hBarScrollRange * this.#scrollable.scrollLeft / this.#hScrollRange;
                // this.#isRTL
                //     ? this.#hBarThumb.style.transform = `translateX(${this.#putIntoRange(offset, 0, -this.#hBarScrollRange)}px)`
                //     : this.#hBarThumb.style.transform = `translateX(${this.#putIntoRange(offset, 0, this.#hBarScrollRange)}px)`;
                // ---
                // const animatedProp = this.#putIntoRange(this.#hBarScrollRange * (this.#isRTL ? -this.#scrollable.scrollLeft : this.#scrollable.scrollLeft) / this.#hScrollRange, 0, this.#hBarScrollRange) + "px";
                // const animation = this.#hBarThumb.animate([
                //     { insetInlineStart: animatedProp } // eslint-disable-line jsdoc/require-jsdoc
                // ],
                //     { duration: 1, fill: "forwards", iterations: 1 } // eslint-disable-line jsdoc/require-jsdoc
                // );
                // await animation.finished;
                // animation.commitStyles();
                // animation.finish();
            }
            else {
                this.#hBarOverlay.style.display = "none";
                this.#hBarThumb.style.insetInlineStart = "";
            }
            if (this.#_vertical && this.#vBarScrollRange > 0) {
                // ---
                this.#vBarThumb.style.insetBlockStart = clamp(this.#vBarScrollRange * this.#scrollable.scrollTop / this.#vScrollRange, 0, this.#vBarScrollRange) + "px";
                // ---
                // this.#vBarThumb.style.transform = `translateY(${this.#putIntoRange(this.#vBarScrollRange * this.#scrollable.scrollTop / this.#vScrollRange, 0, this.#vBarScrollRange)}px)`;
                // ---
                // const animation = this.#vBarThumb.animate([
                //     { insetBlockStart: this.#putIntoRange(this.#vBarScrollRange * this.#scrollable.scrollTop / this.#vScrollRange, 0, this.#vBarScrollRange) + "px" } // eslint-disable-line jsdoc/require-jsdoc
                // ],
                //     { duration: 1, fill: "forwards", iterations: 1 } // eslint-disable-line jsdoc/require-jsdoc
                // );
                // await animation.finished;
                // animation.commitStyles();
                // animation.finish();
            }
            else {
                this.#vBarOverlay.style.display = "none";
                this.#vBarThumb.style.insetInlineStart = "";
            }
        }
        /**
         * Execute scrolling caused by mouse wheel events on the scroll bars.
         * @param ev The mouse wheel event.
         */
        #onWheel(ev) {
            ev.preventDefault();
            this.#scrollable.scrollBy({
                /* eslint-disable jsdoc/require-jsdoc */
                left: ev.deltaX,
                top: ev.deltaY,
                // behavior: "auto"
                /* eslint-enable */
            });
        }
        /**
         * Handling for dragging the handles on the scroll bar. Triggered when the pointer is held down.
         * @param event The pointer event.
         */
        #onDragThumbPointerDown(event) {
            const target = event.target;
            if ((target === this.#vBarThumb) || (target === this.#hBarThumb)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.#dragging = true;
                this.#contScrollHorizontal = this.#draggingThumb === this.#hBarThumb;
                this.#dragStart.x = event.clientX;
                this.#dragStart.y = event.clientY;
                this.#dragStartElementPos.x = this.#scrollable.scrollLeft;
                this.#dragStartElementPos.y = this.#scrollable.scrollTop;
                this.#draggingThumb = target;
                this.#draggingThumbRect.x = this.#draggingThumb.offsetLeft;
                this.#draggingThumbRect.y = this.#draggingThumb.offsetTop;
                this.#draggingThumbRect.width = this.#draggingThumb.offsetWidth;
                this.#draggingThumbRect.height = this.#draggingThumb.offsetHeight;
                this.#draggingBarRect.width = this.#draggingThumb.parentElement.offsetWidth;
                this.#draggingBarRect.height = this.#draggingThumb.parentElement.offsetHeight;
                this.#draggingThumb.addEventListener("pointermove", this.#fncOnDragThumbPointerMove, this.#passiveTrue);
                this.#draggingThumb.setPointerCapture(event.pointerId);
                this.#_dom_.classList.add("dragging");
            }
        }
        /**
         * @see {@link #onDragThumbPointerDown()}
         * @param event The pointer event.
         */
        #onDragThumbPointerMove(event) {
            if (this.#draggingThumb === this.#hBarThumb) {
                const dx = event.clientX - this.#dragStart.x;
                // Map moveable area of the scroll bar to the scroll bar area.
                const f = 
                // Width of the invisible area.
                (this.#scrollable.scrollWidth - this.#scrollable.offsetWidth) /
                    // Width of the area which is available for moving with the mouse.
                    (this.#draggingBarRect.width - this.#draggingThumbRect.width);
                this.#scrollable.scrollTo({
                    left: this.#dragStartElementPos.x + (dx * f) // eslint-disable-line jsdoc/require-jsdoc
                });
            }
            else if (this.#draggingThumb === this.#vBarThumb) {
                const dy = event.clientY - this.#dragStart.y;
                // Map moveable area of the scroll bar to the scroll bar area.
                const f = 
                // Height of the invisible area.
                (this.#scrollable.scrollHeight - this.#scrollable.offsetHeight) /
                    // Height of the area which is available for moving with the mouse.
                    (this.#draggingBarRect.height - this.#draggingThumbRect.height);
                this.#scrollable.scrollTo({
                    top: this.#dragStartElementPos.y + (dy * f) // eslint-disable-line jsdoc/require-jsdoc
                });
            }
        }
        /**
         * @see {@link #onDragThumbPointerDown()}
         * @param event The pointer event.
         */
        #onDragThumbPointerUp(event) {
            if (this.#dragging) {
                event.preventDefault();
                event.stopImmediatePropagation();
                setTimeout(() => {
                    this.#dragging = false;
                    this.#draggingThumb.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove, this.#passiveTrue);
                    this.#draggingThumb.releasePointerCapture(event.pointerId);
                    this.#draggingThumb = undefined;
                    this.#dragStart.x = -Infinity;
                    this.#dragStart.y = -Infinity;
                    this.#dragStartElementPos.x = -Infinity;
                    this.#dragStartElementPos.y = -Infinity;
                    this.#_dom_.classList.remove("dragging");
                }, 1);
            }
        }
        /**
         * Handling for clicking on and holding down the scroll bar. Scrolls page by page when clicking
         * on a free area in the scroll bar and scrolls permanently when holding down on a free area in
         * the scroll bar.
         * @param event The pointer event.
         */
        #onScrollBarPointerDown(event) {
            if ((event.target === this.#hBar || event.target === this.#vBar)) {
                event.target.setPointerCapture(event.pointerId);
            }
            this.#contScrollStartPos.x = event.offsetX;
            this.#contScrollStartPos.y = event.offsetY;
            if (event.target === this.#hBar) {
                event.preventDefault();
                this.#isPointerDown = true;
                this.#contScrollHorizontal = true;
                this.#contScrollBackwards = event.offsetX <= this.#hBarThumb.offsetLeft;
                this.#scrollPageLength = this.#scrollable.scrollWidth * this.#hBarThumb.offsetWidth / this.#hBar.offsetWidth;
                const scrollBy = event.offsetX < this.#hBarThumb.offsetLeft ? -this.#scrollPageLength : this.#scrollPageLength;
                /* eslint-disable jsdoc/require-jsdoc */
                this.#scrollable.scrollBy({
                    left: scrollBy,
                    behavior: "smooth"
                });
                /* eslint-enable */
            }
            else if (event.target === this.#vBar) {
                event.preventDefault();
                this.#isPointerDown = true;
                this.#contScrollHorizontal = false;
                this.#contScrollBackwards = event.offsetY <= this.#vBarThumb.offsetTop;
                this.#scrollPageLength = this.#scrollable.scrollHeight * this.#vBarThumb.offsetHeight / this.#vBar.offsetHeight;
                const scrollBy = event.offsetY < this.#vBarThumb.offsetTop ? -this.#scrollPageLength : this.#scrollPageLength;
                /* eslint-disable jsdoc/require-jsdoc */
                this.#scrollable.scrollBy({
                    top: scrollBy,
                    behavior: "smooth"
                });
                /* eslint-enable */
            }
        }
        /**
         * @see {@link #onScrollBarPointerDown()}
         * @param event The pointer event.
         */
        #onScrollBarPointerUp(event) {
            if ((event.target === this.#hBar || event.target === this.#vBar)) {
                event.target.releasePointerCapture(event.pointerId);
            }
            this.#isPointerDown = false;
        }
        /**
         * @see {@link #onScrollBarPointerDown()}
         * @param _event The event.
         * @see https://bugs.webkit.org/show_bug.cgi?id=201556 Once implemented, this probably could be
         * made easier.
         */
        #onScrollEnd(_event) {
            this.#lastScrollPos.x = this.#scrollable.scrollLeft;
            this.#lastScrollPos.y = this.#scrollable.scrollTop;
            clearTimeout(this.#onScrollEndTimeout);
            this.#onScrollEndTimeout = setTimeout(() => {
                if ((this.#lastScrollPos.x !== this.#scrollable.scrollLeft) || (this.#lastScrollPos.y !== this.#scrollable.scrollTop)) {
                    this.#_dom_.classList.remove("scrolling");
                    return;
                }
                const rafScroll = () => {
                    if (!this.#isPointerDown) {
                        this.#_dom_.classList.remove("scrolling");
                        return;
                    }
                    const thumbRect = this.#contScrollHorizontal ?
                        new DOMRect(this.#hBarThumb.offsetLeft, this.#hBarThumb.offsetTop, this.#hBarThumb.offsetWidth, this.#hBarThumb.offsetHeight)
                        : new DOMRect(this.#vBarThumb.offsetLeft, this.#vBarThumb.offsetTop, this.#vBarThumb.offsetWidth, this.#vBarThumb.offsetHeight);
                    if (rectContains(thumbRect, this.#contScrollStartPos)) {
                        this.#_dom_.classList.remove("scrolling");
                        return;
                    }
                    const contScrollDistance = this.#contScrollBackwards ? -this.#scrollPageLength / 10 : this.#scrollPageLength / 10;
                    /* eslint-disable jsdoc/require-jsdoc */
                    this.#scrollable.scrollBy({
                        left: this.#contScrollHorizontal ? contScrollDistance : 0,
                        top: this.#contScrollHorizontal ? 0 : contScrollDistance,
                        behavior: "auto"
                    });
                    /* eslint-enable */
                    requestAnimationFrame(rafScroll);
                };
                rafScroll();
            }, 50);
        }
        /** @inheritdoc */
        clearOwner() {
            this.#mutationObserver.disconnect();
            this.#resizeObserver.disconnect();
            this.#scrollable.removeEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
            this.#scrollable.removeEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
            this.#hBar.removeEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
            this.#hBar.removeEventListener("pointerup", this.#fncOnScrollBarPointerUp);
            this.#hBarThumb.removeEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
            this.#hBarThumb.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove);
            this.#hBarThumb.removeEventListener("pointerup", this.#fncOnDragThumbPointerUp);
            this.#hBarOverlay.removeEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
            this.#hBarOverlay.remove();
            this.#hBar.remove();
            this.#hBarThumb.remove();
            this.#vBar.removeEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
            this.#vBar.removeEventListener("pointerup", this.#fncOnScrollBarPointerUp);
            this.#vBarThumb.removeEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
            this.#vBarThumb.removeEventListener("pointermove", this.#fncOnDragThumbPointerMove);
            this.#vBarThumb.removeEventListener("pointerup", this.#fncOnDragThumbPointerUp);
            this.#vBarOverlay.removeEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
            this.#vBarOverlay.remove();
            this.#vBar.remove();
            this.#vBarThumb.remove();
            super.clearOwner();
        }
        /**
         * Build UI of the component.
         * @returns This instance.
         */
        buildUI() {
            this.ui = new Div();
            /**
             * The user interface consists mostly of raw DOM elements instead of components, since
             * - there is no need to access the inner elements from the outside
             * - and to enable the most performant access to DOM properties of the inner elements.
             */
            this.#_dom_ = this.ui.DOM;
            // Horizontal scroll bar.
            this.#hBarOverlay = document.createElement("div");
            this.#hBarOverlay.classList.add("h-bar-overlay");
            this.#hBarOverlay.addEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
            this.#hBar = document.createElement("div");
            this.#hBar.classList.add("h-bar");
            this.#hBar.addEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
            this.#hBar.addEventListener("pointerup", this.#fncOnScrollBarPointerUp);
            this.#hBarOverlay.appendChild(this.#hBar);
            this.#hBarThumb = document.createElement("div");
            this.#hBarThumb.classList.add("h-bar-thumb");
            this.#hBarThumb.addEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
            this.#hBarThumb.addEventListener("pointerup", this.#fncOnDragThumbPointerUp);
            this.#hBar.appendChild(this.#hBarThumb);
            // Vertical scroll bar.
            this.#vBarOverlay = document.createElement("div");
            this.#vBarOverlay.classList.add("v-bar-overlay");
            this.#vBarOverlay.addEventListener("wheel", this.#onWheelListener, this.#passiveFalse);
            this.#vBar = document.createElement("div");
            this.#vBar.classList.add("v-bar");
            this.#vBar.addEventListener("pointerdown", this.#fncOnScrollBarPointerDown);
            this.#vBar.addEventListener("pointerup", this.#fncOnScrollBarPointerUp);
            this.#vBarOverlay.appendChild(this.#vBar);
            this.#vBarThumb = document.createElement("div");
            this.#vBarThumb.classList.add("v-bar-thumb");
            this.#vBarThumb.addEventListener("pointerdown", this.#fncOnDragThumbPointerDown);
            this.#vBarThumb.addEventListener("pointerup", this.#fncOnDragThumbPointerUp);
            this.#vBar.appendChild(this.#vBarThumb);
            // Container for content elements.
            this.#contentContainer = new Div()
                .addClass("content");
            // Set target DOM for the `IChildren` mixin!!
            this.setChildrenDOMTarget(this.#contentContainer.DOM);
            this.#scrollable = this.#contentContainer.DOM;
            // Sync scroll bars on scrolling and detect the end of a scroll process.
            this.#scrollable.addEventListener("scroll", this.#onScrollListener, this.#passiveTrue);
            this.#scrollable.addEventListener("scroll", this.#onScrollEndListener, this.#passiveTrue);
            // Sync scrollbar geometry on resizing.
            this.#resizeObserver = new ResizeObserver((entries => {
                if (this.#_vertical || this.#_horizontal) {
                    for (const entry of entries) {
                        if ((entry.target === this.#_dom_) || (entry.target.parentElement === this.#contentContainer.DOM)) {
                            this.#syncScrollBarGeometry();
                            // console.log("resize");
                            break;
                        }
                    }
                }
            }));
            this.#resizeObserver.observe(this.#_dom_);
            // Add/remove resize observing on adding/removing nodes.
            this.#mutationObserver = new MutationObserver(records => {
                for (const record of records) {
                    for (const node of record.removedNodes) {
                        node instanceof Element && this.#resizeObserver.unobserve(node);
                    }
                    for (const node of record.addedNodes) {
                        node instanceof Element && this.#resizeObserver.observe(node);
                    }
                }
                // console.log("mutate");
                this.#syncScrollBarGeometry();
            });
            this.#mutationObserver.observe(this.#contentContainer.DOM, { childList: true, subtree: true, attributes: true, characterData: true }); // eslint-disable-line jsdoc/require-jsdoc
            // Adjust `Offset` and `ReduceSize` if components are given for adjustments.
            this.#adjustmentResizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const ref = entry.target;
                    let syncScrollBarGeometry = false;
                    if (ref === this.#hAdjustment.Offset.DOM) {
                        this.#hBarStartOffset = ref.offsetLeft;
                        syncScrollBarGeometry = true;
                    }
                    if (ref === this.#hAdjustment.ReduceSize.DOM) {
                        this.#hBarReduceWidth = ref.offsetWidth;
                        syncScrollBarGeometry = true;
                    }
                    if (ref === this.#vAdjustment.Offset.DOM) {
                        this.#vBarStartOffset = ref.offsetTop;
                        syncScrollBarGeometry = true;
                    }
                    if (ref === this.#vAdjustment.ReduceSize.DOM) {
                        this.#vBarReduceHeight = ref.offsetHeight;
                        syncScrollBarGeometry = true;
                    }
                    syncScrollBarGeometry && this.#syncScrollBarGeometry();
                }
            });
            // Mount inner components.
            if (this.#_horizontal) {
                this.ui.addClass("horizontal");
                this.ui.DOM.appendChild(this.#hBarOverlay);
            }
            if (this.#_vertical) {
                this.ui.addClass("vertical");
                this.ui.DOM.appendChild(this.#vBarOverlay);
            }
            this.ui.append(this.#contentContainer);
            return this;
        }
        static {
            /** Mixin the IChildren implementation (which targets `this.#contentContainer`). */
            mixin(false, this, AChildren);
        }
    }
    /**
     * Factory for `ScrollContainer` components.
     */
    class ScrollContainerFactory extends ComponentFactory {
        /**
         * Create, set up and return ScrollContainer component.
         * @param horizontal `true`, if a horizontal scroll bar is to be displayed, otherwise `false`.
         * @param vertical `true`, if a vertical scroll bar is to be displayed, otherwise `false`.
         * @param native `true`, if native scroll bars are to be used, otherwise `false`. If `true` is
         * used permanently consider staying away from `ScrollContainer` since the actual purpose of
         * this component is to enable a uniform design of scroll bars across all platforms/browsers.
         * @param horizontalAdjustment Adjustment of the size and position of the horizontal scroll bar.
         * @param verticalAdjustment Adjustment of the size and position of the vertical scroll bar.
         * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
         * @returns ScrollContainer component.
         */
        scrollContainer(horizontal = true, vertical = true, native = false, horizontalAdjustment, verticalAdjustment, data) {
            return this.setupComponent(new ScrollContainer(horizontal, vertical, native, horizontalAdjustment, verticalAdjustment), data);
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
    class SplitterFactory extends ComponentFactory {
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
     * Create the footer section of the app.
     */
    class AppFooter extends AElementComponentWithInternalUI {
        constructor() {
            super();
            this.initialize();
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = new Footer()
                .addClass("app-footer")
                .append(new P("Footer/Statusbar"));
            return this;
        }
    }

    /**
     * Create the header section of the app.
     */
    class AppHeader extends AElementComponentWithInternalUI {
        constructor() {
            super();
            this.initialize();
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = new Header()
                .addClass("app-header")
                .append(new H1("@Vanilla.ts Showcase"), $.labeledCheckbox("Direction RTL")
                .on("checked", (ev) => {
                ev.$.Checked
                    ? document.documentElement.dir = "rtl"
                    : document.documentElement.removeAttribute("dir");
            })
            // b = $.buttonRegular("Test")
            //     .on("click", () => console.log("clicked 0"))
            //     .on("click", (ev) => {
            //         console.log("Clicked 1");
            //         if (Date.now() - start > 2500) {
            //             ev.preventDefault();
            //             ev.stopImmediatePropagation();
            //         }
            //     })
            //     .on("click", () => console.log("clicked 2"))
            //     .on("pointerdown", (ev) => {
            //         // b.DOM.setPointerCapture(ev.pointerId);
            //         start = Date.now();
            //         console.log("pointerdown", ev.pointerId);
            //     })
            //     .on("pointerup", (ev) => {
            //         // b.DOM.releasePointerCapture(ev.pointerId);
            //         console.log("pointerup", ev.pointerId);
            //         // @ts-ignore
            //         b.bla();
            //     })
            //     .on("pointerleave", (ev) => {
            //         // b.DOM.releasePointerCapture(ev.pointerId);
            //         console.log("pointerleave", ev.pointerId);
            //     })
            );
            // Object.defineProperty(b, "bla", {
            //     value: () => {
            //         console.log("blubb");
            //     }
            // });
            return this;
        }
    }

    /**
     * Taken from https://github.com/adamvleggett/drawdown
     * drawdown.js
     * (c) Adam Leggett
     */
    // @ts-nocheck
    function markdown(src) {
        var rx_lt = /</g;
        var rx_gt = />/g;
        var rx_space = /\t|\r|\uf8ff/g;
        var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g;
        var rx_hr = /^([*\-=_] *){3,}$/gm;
        var rx_list = /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g;
        var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g;
        var rx_highlight = /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g;
        var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g;
        var rx_link = /((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g;
        var rx_table = /\n(( *\|.*?\| *\n)+)/g;
        var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/;
        var rx_row = /.*\n/g;
        var rx_cell = /\||(.*?[^\\])\|/g;
        var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g;
        var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g;
        var rx_stash = /-\d+\uf8ff/g;
        function replace(rex, fn) {
            src = src.replace(rex, fn);
        }
        function element(tag, content) {
            return '<' + tag + '>' + content + '</' + tag + '>';
        }
        function list(src) {
            return src.replace(rx_list, function (all, ind, ol, num, low, content) {
                var entry = element('li', highlight(content.split(RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')).map(list).join('</li><li>')));
                return '\n' + (ol
                    ? '<ol start="' + (num
                        ? ol + '">'
                        : parseInt(ol, 36) - 9 + '" style="list-style-type:' + (low ? 'low' : 'upp') + 'er-alpha">') + entry + '</ol>'
                    : element('ul', entry));
            });
        }
        function highlight(src) {
            return src.replace(rx_highlight, function (all, _, p1, emp, sub, sup, small, big, p2, content) {
                return _ + element(emp ? (p2 ? 'strong' : 'em')
                    : sub ? (p2 ? 's' : 'sub')
                        : sup ? 'sup'
                            : small ? 'small'
                                : big ? 'big'
                                    : 'code', highlight(content));
            });
        }
        function unesc(str) {
            return str.replace(rx_escape, '$1');
        }
        var stash = [];
        var si = 0;
        src = '\n' + src + '\n';
        replace(rx_lt, '&lt;');
        replace(rx_gt, '&gt;');
        replace(rx_space, '  ');
        // blockquote
        // @vanilla-ts: disabled since not needed and causes issues CSS selectors in code blocks.
        // src = blockquote(src);
        // horizontal rule
        replace(rx_hr, '<hr/>');
        // See: https://github.com/adamvleggett/drawdown/pull/14/files
        // // list
        // src = list(src);
        // replace(rx_listjoin, '');
        // code
        replace(rx_code, function (all, p1, p2, p3, p4) {
            stash[--si] = element('pre', element('code', p3 || p4.replace(/^    /gm, '')));
            return si + '\uf8ff';
        });
        // list
        src = list(src);
        replace(rx_listjoin, '');
        // link or image
        replace(rx_link, function (all, p1, p2, p3, p4, p5, p6) {
            stash[--si] = p4
                ? p2
                    ? '<img src="' + p4 + '" alt="' + p3 + '"/>'
                    : '<a href="' + p4 + '">' + unesc(highlight(p3)) + '</a>'
                : p6;
            return si + '\uf8ff';
        });
        // table
        replace(rx_table, function (all, table) {
            var sep = table.match(rx_thead)[1];
            return '\n' + element('table', table.replace(rx_row, function (row, ri) {
                return row == sep ? '' : element('tr', row.replace(rx_cell, function (all, cell, ci) {
                    return ci ? element(sep && !ri ? 'th' : 'td', unesc(highlight(cell || ''))) : '';
                }));
            }));
        });
        // heading
        replace(rx_heading, function (all, _, p1, p2) { return _ + element('h' + p1.length, unesc(highlight(p2))); });
        // paragraph
        replace(rx_para, function (all, content) { return element('p', unesc(highlight(content))); });
        // stash
        replace(rx_stash, function (all) { return stash[parseInt(all)]; });
        return src.trim();
    }

    /**
     * Container for an example.
     */
    class BaseExample extends AElementComponentWithInternalUI {
        #scrollOffset = { X: 0, Y: 0 };
        constructor(title) {
            super();
            this.initialize(undefined, title);
            // A class extending this class isn't fully constructed yet here, so defer `buildExample()`.
            queueMicrotask(() => {
                this.buildExample();
                // @ts-expect-error - `highlightElement` is not typed in `@types/highlight.js` (which is used by `markdown`), but it exists at runtime.
                this.DOM.querySelectorAll("pre > code").forEach((e) => hljs.highlightElement(e));
            });
        }
        // #region
        /** @inheritdoc */
        onBeforeUnmount() {
            this.#scrollOffset = this.ui.ScrollOffset;
            super.onBeforeUnmount();
        }
        /** @inheritdoc */
        onDidMount(parent) {
            super.onDidMount(parent); /*!!*/
            this.ui.scroll({
                left: this.#scrollOffset.X,
                top: this.#scrollOffset.Y,
                behavior: "instant",
            });
        }
        /** @inheritdoc */
        buildUI(title) {
            const content = new Div().addClass("example-content");
            this.ui = $.scrollContainer()
                .addClass("example", "ex-" + this.DefaultCSSClassName.slice(0, -3))
                .append(title
                ? content.append(new H2(title))
                : content);
            // Set target DOM for the `IChildren` mixin!!
            this.setChildrenDOMTarget(content.DOM);
            return this;
        }
        example(children, toDisable) {
            let toolbar;
            let sizeSelect;
            let content;
            const example = new Div()
                .addClass("example-area", "toolbar")
                .append(toolbar = new Div()
                .addClass("toolbar")
                .append(sizeSelect = $.labeledSelect("Size", [
                { Text: "Tiny (50%)", Value: "tiny" },
                { Text: "Small (67%)", Value: "small" },
                { Text: "Smaller (83%)", Value: "smaller" },
                { Text: "Normal", Value: "normal" },
                { Text: "Larger (125%)", Value: "larger" },
                { Text: "Medium (150%)", Value: "medium" },
                { Text: "Large (175%)", Value: "large" },
                { Text: "Huge (200%)", Value: "huge" },
                { Text: "110%", Value: "110" },
                { Text: "120%", Value: "120" },
                { Text: "130%", Value: "130" },
                { Text: "140%", Value: "140" },
            ])
                .value("normal")
                .on("change", () => {
                let sizeClass = sizeSelect.Value === "normal"
                    ? ""
                    : "sz-" + sizeSelect.Value;
                for (const child of example.ElementChildren) {
                    child !== toolbar && child
                        .removeClass("sz-tiny", "sz-small", "sz-smaller", "sz-larger", "sz-medium", "sz-large", "sz-huge", "sz-110", "sz-120", "sz-130", "sz-140")
                        .addClass(sizeClass);
                }
            }), new Text$1("|"), $.labeledCheckbox("Disabled")
                .on("checked", (ev) => {
                const childrenToDisable = toDisable ?? content.ElementChildren;
                for (const child of childrenToDisable) {
                    child !== toolbar && child.disabled(ev.$.Checked);
                }
            }), new Text$1("|"), $.labeledCheckbox("Direction RTL")
                .on("checked", (ev) => {
                for (const child of example.ElementChildren) {
                    child !== toolbar && child.dir(ev.$.Checked ? "rtl" : null);
                }
            })), content = new Div().addClass("canvas")
                .append(...children));
            return example;
        }
        exampleNoToolbar(...children) {
            const example = new Div()
                .addClass("example-area")
                .append(new Div()
                .append(...children));
            return example;
        }
        properties(...children) {
            const props = new Div()
                .addClass("example-properties")
                .append(...children);
            return props;
        }
        markdown(md) {
            const result = new Div().addClass("md");
            const html = markdown(md)
                .replace(/§@([^\/]+)\/(.*?)§/g, (_match, navTarget, label) => {
                // return `<a href="javascript: __navigateTo__('#@${navTarget}/${label}')">${label}</a>`;
                return `<a href="#@${navTarget}/${label}">${label}</a>`;
            })
                .replace(/%([^\|]+)\|(.*?)%/g, (_match, label, href) => {
                return `<a href="${href}" target="_blank">${label}</a>`;
            })
                .replace(/\\/g, "<br/>")
                .replaceAll("<code>", '<code dir="ltr">');
            result.DOM.insertAdjacentHTML("beforeend", html);
            return result;
        }
        static {
            /** Mixin the IChildren implementation (which targets `this.ui.Content`). */
            mixin(false, this, AChildren);
        }
    }

    const intro$_ = `
\`BusyOverlay\` is a component for displaying an overlay that indicates a
'busy-with-no-defined-end' state. The overlay covers the complete viewport and prevents any user
interaction with the UI below it. It is typically used during long-running operations where user
input should be temporarily disabled.

**Class:** \`@vanilla-ts/components/BusyOverlay\`

The component offers additional features:

- Optionally allow the user to cancel the busy state by pressing the 'Esc' key.
- Configurable delay before showing the overlay.
- Custom events for busy state changes.
- Support for nested calls to \`busy()\`/\`idle()\`. This makes it very easy to use the overlay in
  scenarios where multiple (asynchronous) operations may overlap.
`;
    const example$V = `
### Basic usage

\`\`\`
import { BusyOverlay } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Button } from "@vanilla-ts/dom";

let timeout: ReturnType<typeof globalThis.setTimeout> | undefined;

const overlay = new BusyOverlay()
    .addClass("busy-overlay")
    .on("idle", () => clearTimeout(timeout));

const showOverlay = async (allowEscape: boolean, duration: number = 3000, delay?: number) => {
    overlay.allowEscape(allowEscape);
    await overlay.busy(delay);
    timeout = setTimeout(() => {
        clearTimeout(timeout);
        overlay.idle();
    }, duration);
};

const btn1 = new Button("Show for 3 seconds")
    .addClass("regular")
    .on("click", async () => await showOverlay(false));

const btn2 = new Button("Show for max. 3 seconds (cancelable with 'Esc')")
    .addClass("regular")
    .on("click", async () => await showOverlay(true));

const btn3 = new Button("Show for 3 seconds after a delay of 500 ms")
    .addClass("regular")
    .on("click", async () => await showOverlay(false, 3500, 500));

new VTS_App(document.body).append(btn1, btn2, btn3);
\`\`\`
`;
    const example2 = `
### Global application context

The following example shows how the \`BusyOverlay\` component is used in a global application
context so that multiple modules can use the overlay without having to check whether the overlay is
already displayed or not.

\`\`\`
// Module \`App.ts\`
import { BusyOverlay } from "@vanilla-ts/components";

class AppClass {
    #busyOverlay = new BusyOverlay(250, false)
        .addClass("busy-overlay");

    /**
     * Show a 'busy' overlay.
     * @param delay The delay after which the busy overlay is to be shown.
     * @returns This instance.
     */
    public async busy(delay?: number): Promise<this> {
        await this.#busyOverlay.busy(delay);
        return this;
    }

    /**
     * Hide the current 'busy' overlay.
     * @returns This instance.
     */
    public idle(): this {
        this.#busyOverlay.idle();
        return this;
    }

    /// Additional application-wide methods and properties to be added here.
    // ...
}

export const App = new AppClass();
\`\`\`

\`\`\`
// Module \`Module1.ts\`
import { App } from "./App.js";

// Long-running operation, may take an arbitrary amount of time.
export async function longRunning1() {
    await App.busy();
    try {
       ...
    } finally {
        App.idle();
    }
}
\`\`\`

\`\`\`
// Module \`Module2.ts\`
import { App } from "./App.js";
import { longRunning1 } from "./Module1.js";

// Long-running operation, may take an arbitrary amount of time.
async function longRunning2() {
    await App.busy();
    try {
        ...
        await longRunning1();
        ...
    } finally {
        App.idle();
    }
}

// Long-running operation, may take an arbitrary amount of time.
export async function longRunning3() {
    await App.busy();
    try {
        await longRunning2();
    } finally {
        App.idle();
    }
}
\`\`\`

\`\`\`
// Module \`Module3.ts\`
import { longRunning3 } from "./Module2.js";

longRunning3();
\`\`\`
`;
    class BusyOverlayEx extends BaseExample {
        constructor() {
            super("BusyOverlay");
        }
        /** @inheritdoc */
        buildExample() {
            const overlay = $.busyOverlay()
                .on("idle", () => clearTimeout(timeout));
            let timeout;
            const show = async (allowEscape, duration = 3000, delay) => {
                overlay.allowEscape(allowEscape);
                await overlay.busy(delay);
                timeout = setTimeout(() => {
                    clearTimeout(timeout);
                    overlay.idle();
                }, duration);
            };
            const btnBusy1 = new Button("Show")
                .addClass("regular")
                .on("click", async () => await show(false));
            const btnBusy2 = new Button("Show")
                .addClass("regular")
                .on("click", async () => await show(true));
            const btnBusy3 = new Button("Show")
                .addClass("regular")
                .on("click", async () => await show(false, 3500, 500));
            this.append(this.markdown(intro$_), this.markdown("### Examples"), this.properties(btnBusy1, new Span("\u2003Show for 3 seconds").style({ "display": "inline-block", "height": "2rem" }), new Br(), btnBusy2, new Span("\u2003Show for max. 3 seconds (cancelable with 'Esc')").style({ "display": "inline-block", "height": "2rem" }), new Br(), btnBusy3, new Span("\u2003Show for 3 seconds after a delay of 500 ms") //.style({ "display": "inline-block", "height": "2rem" }), new Br()
            ), this.markdown(example$V), this.markdown(example2));
        }
    }

    const intro$Z = `
A container component whose content can be disclosed/undisclosed.

**Class:** \`@vanilla-ts/components/DisclosureContainer\`

The \`DisclosureContainer\` component supports the follwoing features:

- Both the header and content areas can contain arbitrary components.
- Several appearance options.
- A (preventable) custom event when the container is disclosed/undisclosed.
- Custom buttons for the disclose/undisclose actions.
- Animations for the disclose/undisclose actions.
- An option to remove/keep content from the DOM when disclosed/undisclosed.

All features are configurable at runtime on an already existing instance.
`;
    const example$U = `
### Notes
- If \`WeakUndisclosed\` is \`true\` the inner content container will keep its content in the DOM
  when it is undisclosed, otherwise the content will be removed from the DOM.
- Setting \`Animatable\` to \`true\` will automatically set the property \`WeakUndisclosed\` to
  \`true\` as well!
- The custom disclose button appearance in the example is not a builtin design. It is achieved by
  adding/removing a CSS class that triggers a corresponding style on the disclose button and by
  setting the \`DisclosedButtonOptions\` / \`UndisclosedButtonOptions\` properties which configure
  the contained §@components/IconButton§ component.

### Code example

\`\`\`
import { DisclosureContainer } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Code, Div, P } from "@vanilla-ts/dom";

const example = new DisclosureContainer(
    ["Some ", new Code("Lorem ipsum"), " text."],
    new Div().style({ "padding": "0.5rem" }).append(
        new P("Lorem ipsum ut wisi enim ad minim veniam, quis ..."),
        new P("Nam liber tempor cum nobis id quod mazim placerat ...")
    )
)
    .addClass("disclosure-container")
    .animatable(true)
    .style({
        "padding": "0.5rem",
        "border": "1px solid hsl(0 0% 89.8%)",
        "borderRadius": "6px",
        "backgroundColor": "hsl(0, 0%, 98%)",
    });

new VTS_App(document.body).append(example);
\`\`\`

\`\`\`
// Enable/disable custom design
if (someCondition) {
    example.disclosureButton(c => c.addClass("custom-design"))
        .disclosedButtonOptions({ Title: "Collapse" })
        .undisclosedButtonOptions({ Title: "Expand" });
} else {
    example.disclosureButton(c => c.removeClass("custom-design"))
        .disclosedButtonOptions({ Title: null })
        .undisclosedButtonOptions({ Title: null });
}
\`\`\`
`;
    const css$1 = `
\`\`\`
/* Custom design CSS */
> .disclosure-container {
    > .header-container > .disclose.icon-button.custom-design {
        width: 1.4rem;
        height: 1.4rem;
        border-radius: 50%;
        font-family: monospace;
        font-size: 1rem;
        font-weight: bolder;
        color: white;
        background: hsl(216, 92%, 63%);
        clip-path: none;
        > .phrase {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        &:hover {
            filter: brightness(0.9);
        }
    }
    &.disabled > .header-container > .disclose.icon-button.custom-design {
        background: hsl(216, 92%, 68%);
    }
    &.horizontal > .header-container > .disclose.icon-button.custom-design > .phrase {
        transform: rotate(90deg);
    }
}
\`\`\`
`;
    class DisclosureContainerEx extends BaseExample {
        #dcContainer;
        #dc;
        #evCount = 0;
        constructor() {
            super("DisclosureContainer");
        }
        /** @inheritdoc */
        buildExample() {
            this.#dcContainer = new Div()
                .addClass("dc-container")
                .append(this.#dc = $.disclosureContainer(["Some ", new Code("Lorem ipsum"), " text."], new Div().style({ "padding": "var(--base-size-half)" }).append(new P("Lorem ipsum ut wisi enim ad minim veniam, quis nostrud exerci ullamcorper suscipit ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis et blandit augue duis dolore te feugait nulla facilisi."), new P("Nam liber tempor cum nobis id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, sed diam tincidunt ut magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.")))
                .animatable(true)
                .on("disclose", (ev) => {
                queueMicrotask(() => {
                    logMessage.phrase(`${++this.#evCount} '${ev.type}' event(s) received: Container is disclosed => ${this.#dc.Disclosed}.`);
                });
            })
                .style({
                "padding": "var(--base-size-half)",
                "border": "var(--1px) solid var(--border-color)",
                "borderRadius": "var(--border-radius-normal)",
                "backgroundColor": "var(--black-2)",
            }), new Div().addClass("spacer"));
            const logMessage = new P(`${this.#evCount} 'disclose' event(s) received: Container is disclosed => ${this.#dc.Disclosed}.`)
                .style({
                "minWidth": "35rem",
                "marginBlockStart": "1rem",
                "fontFamily": "monospace",
                "textAlign": "center",
            });
            this
                .append(this.markdown(intro$Z), this.example([this.#dcContainer, logMessage], [this.#dc]), this.markdown("### Configuration"), this.properties(this.#getConfiguration()), this.markdown(example$U), this.markdown(css$1));
        }
        #handleDisclose(ev) {
            ev.preventDefault();
        }
        #getConfiguration() {
            const div = new Div();
            const appearance = $.labeledSelect("Appearance", [
                { Text: "TOP_START", Value: "top-start" },
                { Text: "TOP_END", Value: "top-end" },
                { Text: "END_TOP", Value: "end-top" },
                { Text: "END_BOTTOM", Value: "end-bottom" },
                { Text: "BOTTOM_END", Value: "bottom-end" },
                { Text: "BOTTOM_START", Value: "bottom-start" },
                { Text: "START_BOTTOM", Value: "start-bottom" },
                { Text: "START_TOP", Value: "start-top" },
            ]).on("change", () => {
                switch (appearance.Value) {
                    case "top-start":
                        this.#dc.Appearance = DisclosureContainerAppearance.TOP_START;
                        break;
                    case "top-end":
                        this.#dc.Appearance = DisclosureContainerAppearance.TOP_END;
                        break;
                    case "end-top":
                        this.#dc.Appearance = DisclosureContainerAppearance.END_TOP;
                        break;
                    case "end-bottom":
                        this.#dc.Appearance = DisclosureContainerAppearance.END_BOTTOM;
                        break;
                    case "bottom-end":
                        this.#dc.Appearance = DisclosureContainerAppearance.BOTTOM_END;
                        break;
                    case "bottom-start":
                        this.#dc.Appearance = DisclosureContainerAppearance.BOTTOM_START;
                        break;
                    case "start-bottom":
                        this.#dc.Appearance = DisclosureContainerAppearance.START_BOTTOM;
                        break;
                    case "start-top":
                        this.#dc.Appearance = DisclosureContainerAppearance.START_TOP;
                        break;
                }
            });
            const weakUndisclosed = $.labeledCheckbox("WeakUndisclosed")
                .on("checked", (ev) => {
                animatable.disabled(!ev.$.Checked);
                ev.$.Checked || animatable.checked(false);
                this.#dc.WeakUndisclosed = ev.$.Checked;
            }).checked(true);
            const animatable = $.labeledCheckbox("Animatable")
                .on("checked", (ev) => {
                ev.$.Checked && (weakUndisclosed.Checked = true);
                this.#dc.Animatable = ev.$.Checked;
            }).checked(true);
            const events = $.labeledCheckbox("Prevent disclose/undisclose events")
                .on("checked", (ev) => {
                ev.$.Checked
                    ? this.#dc.on("disclose", this.#handleDisclose)
                    : this.#dc.off("disclose", this.#handleDisclose);
            }).checked(false);
            const btns = $.labeledCheckbox("Set custom disclose button appearance")
                .on("checked", (ev) => {
                if (ev.$.Checked) {
                    this.#dc
                        .disclosureButton(c => c.addClass("custom-design"))
                        .disclosedButtonOptions({ Title: "Collapse" })
                        .undisclosedButtonOptions({ Title: "Expand" });
                }
                else {
                    this.#dc
                        .disclosureButton(c => c.removeClass("custom-design"))
                        .disclosedButtonOptions({ Title: null })
                        .undisclosedButtonOptions({ Title: null });
                }
            });
            div.append(appearance, weakUndisclosed, animatable, events, btns);
            return div;
        }
    }

    const intro$Y = `
\`IconButton\` is a component to display buttons with icons and/or text. The
component itself is a regular \`§@dom/Button§\` component that contains three inner \`§@dom/Span§\`
components which can be styled individually:

- A \`Span\` component at the logical start side of the button (on the left side in 'ltr' direction,
  otherwise on right side; with a vertical layout the component is placed at the top side).
- A \`Span\` component containing the phrasing content of the button.
- A \`Span\` component at the logical end side of the button (on the right side in 'ltr' direction,
  otherwise on left side; with a vertical layout the component is placed at the bottom side).

The intended use of this component is that the icons (part one and three) are styled by background
images or with an icon font like 'Material Icons'.

**Class:** \`@vanilla-ts/components/IconButton\`

*Note:* \`IconButton\` has no built-in default design except for some basic inner margins. The two examples
provided below rely on the design of a regular default \`Button\` (see there) and use a custom
component factory to create the \`IconButton\` instances with the default CSS classes needed.
`;
    const exampleIBF = `
### IconButton factory

\`\`\`
// Module \`IconButtonFactory.ts\`
import { IconButton, IconButtonOptions } from "@vanilla-ts/components";
import { ComponentFactory } from "@vanilla-ts/core";

class MyIconButtonFactory<T> extends ComponentFactory<IconButton> {
    public iconButton(options?: IconButtonOptions, data?: T): IconButton {
        return this.setupComponent(
            new IconButton(options).addClass("icon-button", "regular"),
            data
        );
    }
}

export const IconButtonFactory = new MyIconButtonFactory();
\`\`\`
`;
    const exampleBackgroundImages = `
### Code example (using background images)

\`\`\`
import type { IconButton } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { IconButtonFactory as IBF } from "IconButtonFactory.js";

let ibWifi: IconButton;

const example = new Div().append(
    IBF.iconButton({
        // The \`-\` character here and in all occurences below results in an empty
        // span element. Since this example uses background images, there is no need
        // to have any text content in the span.
        IconStart: "-ios_share",
        Title: "Share..."
    }),
    IBF.iconButton({
        IconStart: "-settings",
        Caption: ["Settings"],
        Title: "Open settings dialog"
    }),
    IBF.iconButton({
        IconEnd: "-print",
        Caption: ["Print"],
        Title: "Print document"
    }),
    ibWifi = IBF.iconButton({
        IconStart: "-wifi",
        Caption: ["Wifi"],
        IconEnd: "-circle",
        Title: "Turn Wifi on"
    })
        .on("click", () => {
            setTimeout(() => {
                ibWifi
                    .toggleClass("wifi-on")
                    .title(ibWifi.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
            }, 500);
        })
);

new VTS_App(document.body).append(example);
\`\`\`
`;
    const cssBackgroundImages = `
### CSS example (for background images)

\`\`\`
.icon-button {
    > .start,
    > .end {
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        /* 'Hide' any text in these span elements. */
        font-size: 0;
        color: transparent;
        &:not(.empty) {
            /* Make room for icons. */
            width: 1.2rem;
            aspect-ratio: 1;
        }
    }
    &.disabled {
        > .start,
        > .end {
            filter: opacity(0.5);
        }
    }
    > .ios_share {
        background-image: url("data:image/svg+xml,...");
    }
    > .settings {
        background-image: url("data:image/svg+xml,...");
    }
    > .print {
        background-image: url("data:image/svg+xml,...");
    }
    > .wifi {
        background-image: url("data:image/svg+xml,...");
    }
    > .circle {
        background-image: url("data:image/svg+xml;...");
    }
    &.wifi-on > .circle {
        background-image: url("data:image/svg+xml;...");
    }
}
\`\`\`
`;
    const exampleIconFont = `
### Code example (using an icon font)

This example is almost identical to the example above which uses background images except for the
strings for \`IconStart\` and \`IconEnd\` which don't start with a leading hyphen. These spans will
contain the given strings as text content which will be rendered with an icon font.

\`\`\`
import type { IconButton } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { IconButtonFactory as IBF } from "IconButtonFactory.js";

let ibWifi: IconButton;

const example = new Div().append(
    IBF.iconButton({
        // The text content here and in all occurences below must correspond to/trigger
        // the desired icon glyph. See the documentation of the used icon font for details.
        IconStart: "ios_share",
        Title: "Share..."
    }),
    IBF.iconButton({
        IconStart: "settings",
        Caption: ["Settings"],
        Title: "Open settings dialog"
    }),
    IBF.iconButton({
        IconEnd: "print",
        Caption: ["Print"],
        Title: "Print document"
    }),
    ibWifi = IBF.iconButton({
        IconStart: "wifi",
        Caption: ["Wifi"],
        IconEnd: "circle",
        Title: "Turn Wifi on"
    })
        .on("click", () => {
            setTimeout(() => {
                ibWifi
                    .toggleClass("wifi-on")
                    .title(ibWifi.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
            }, 500);
        })
);

new VTS_App(document.body).append(example);
\`\`\`
`;
    const cssIconFont = `
### CSS example (for an icon font)

Compared to the example which uses background images the amount of CSS needed here is much less.

\`\`\`
.icon-button {
    > .start,
    > .end {
        /* Uses the 'Material Icons' font from Google. */
        font-family: "MaterialIconsRounded";
        font-size: 1.2rem;
        line-height: 1;
    }
    > .circle {
        color: red;
        /* Support for a filled symbol. */
        font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 20;
    }
    &.disabled > .circle {
        filter: opacity(0.5);
    }
    &.wifi-on > .circle {
        color: green;
    }
}
\`\`\`
`;
    class MyIconButtonFactory extends ComponentFactory {
        iconButton(options, data) {
            return this.setupComponent(new IconButton(options).addClass("icon-button", "regular"), data);
        }
    }
    class IconButtonEx extends BaseExample {
        constructor() {
            super("IconButton");
        }
        /** @inheritdoc */
        buildExample() {
            let ib0;
            let ib1;
            let ib2;
            let ib3;
            let ib0a;
            let ib1a;
            let ib2a;
            let ib3a;
            const ibf = new MyIconButtonFactory();
            this.append(this.markdown(intro$Y), this.example([
                new P("IconButtons with background images:"),
                new Div().addClass("icon-button-container").append(ib0 = ibf.iconButton({
                    IconStart: "-ios_share",
                    Title: "Share...",
                }), ib1 = ibf.iconButton({
                    IconStart: "-settings",
                    Caption: ["Settings"],
                    Title: "Open settings dialog",
                }), ib2 = ibf.iconButton({
                    IconEnd: "-print",
                    Caption: ["Print"],
                    Title: "Print document",
                }), ib3 = ibf.iconButton({
                    IconStart: "-wifi",
                    Caption: ["Wifi"],
                    IconEnd: "-circle",
                    Title: "Turn Wifi on"
                })
                    .on("click", () => {
                    setTimeout(() => {
                        ib3
                            .toggleClass("wifi-on")
                            .title(ib3.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
                    }, 500);
                })),
                new Hr(),
                new P("IconButtons with icon font symbols:"),
                new Div().addClass("icon-button-container").append(ib0a = ibf.iconButton({
                    IconStart: "ios_share",
                    Title: "Share...",
                }), ib1a = ibf.iconButton({
                    IconStart: "settings",
                    Caption: ["Settings"],
                    Title: "Open settings dialog",
                }), ib2a = ibf.iconButton({
                    IconEnd: "print",
                    Caption: ["Print"],
                    Title: "Print document",
                }), ib3a = ibf.iconButton({
                    IconStart: "wifi",
                    Caption: ["Wifi"],
                    IconEnd: "circle",
                    Title: "Turn Wifi on"
                })
                    .on("click", () => {
                    setTimeout(() => {
                        ib3a
                            .toggleClass("wifi-on")
                            .title(ib3a.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
                    }, 500);
                }))
            ], [ib0, ib1, ib2, ib3, ib0a, ib1a, ib2a, ib3a]), this.markdown("### Orientation"), this.properties($.labeledCheckbox("Vertical")
                .checked(false)
                .on("checked", (e) => [ib0, ib1, ib2, ib3, ib0a, ib1a, ib2a, ib3a].forEach(ib => ib.options({ Horizontal: !e.$.Checked })))), this.markdown(exampleIBF), this.markdown(exampleBackgroundImages), this.markdown(cssBackgroundImages), this.markdown(exampleIconFont), this.markdown(cssIconFont));
            [ib0, ib1, ib2, ib3].forEach(ib => ib.addClass("ib-img"));
            [ib0a, ib1a, ib2a, ib3a].forEach(ib => ib.addClass("ib-font"));
        }
    }

    const intro$X = `
## Advanced components

The components provided by the \`@vanilla-ts/components\` package are complex elements that address
common application requirements, such as tabs or dialog windows. They are composed entirely of the
basic DOM components provided by the [\`@vanilla-ts/dom\`](#@dom/Introduction) package and the
building blocks from the underlying \`@vanilla-ts/core\` package.

### Styling

Following the principle of being as style-agnostic as possible, the components don't come with a
*built-in* default styling. However, there is (of course) a default theme (in the directory
\`@vanilla-ts/components/themes/vts\`) that provides a design for all components. This theme uses
the component's class name in 'kebab-case' as the CSS selector. For example, the CSS selector for
the §@components/DisclosureContainer§ component is \`.disclosure-container\` and for the
§@components/Stepper§ component it is \`.stepper\`. So in most of the examples you'll find code
similar to this excerpt:

\`\`\`
const lcb = new LabeledCheckbox("Labeled checkbox")
    .addClass("labeled-checkbox") // <== Add the class name in 'kebab-case' as a CSS class.
    .checked(true);
\`\`\`

This ensures that the necessary styles from the _default theme_ are applied to the component
instance. This has to be done for _all_ components in \`@vanilla-ts/components\` that you want to
use with the default theme.

Only if you can make sure that the class names won't be changed by minification, bundling or other
optimizations, you could also use the static property \`DefaultCSSClassName\` provided by each
component. Its default implementation simply returns the the component's class name in kebab-case:

\`\`\`
const lcb = new LabeledCheckbox("Labeled checkbox")
    .addClass(LabeledCheckbox.DefaultCSSClassName) // => 'labeled-checkbox'
    .checked(true);
\`\`\`

The drawback here is that you'd have to change the implementation of \`DefaultCSSClassName\`
(prototype modification of the class \`AComponent\`) if, for any reason, it is not desirable or
possible to use kebab case class names as CSS selectors.

In most cases it is recommended to use component factories instead to get component instances, see
§@core/Component factories§. This is also what the code of the showcase application does.


### Labeled components

\`@vanilla-ts/components\` provides some common components in 'labeled' versions, which means that
they are composed of a regular component (e.g. an input field) and a label component that serves as
a caption for the regular component. For input components, the label is a standard §@dom/Label§; for
other components, a §@dom/Span§ is used.

Labeled components allow different label positions and alignments. They are based on the
\`LabeledComponent\` class, which handles the position and alignment in a generic way; as a result,
not all combinations of position and alignment are necessarily appropriate; for example, a checkbox
placed below a label tends to look rather unusual. To illustrate and try the label alignments, you
can use the checkbox 'Use wide label with fixed width' which is available for all examples for
labeled components.
`;
    class ComponentsIntroductionEx extends BaseExample {
        constructor() {
            super();
        }
        /** @inheritdoc */
        buildExample() {
            this
                .addClass("ex-components-introduction")
                .append(this.markdown(intro$X));
        }
    }

    function labeledComponentLabelFlags(lc, includeWideLabel = true, positionValue = "start", alignmentValue = "start") {
        let lsPositionCb;
        let lsAlignmentCb;
        return [
            lsPositionCb = $.labeledSelect("Label position", [
                { Text: "TOP", Value: "top" },
                { Text: "END", Value: "end" },
                { Text: "BOTTOM", Value: "bottom" },
                { Text: "START", Value: "start" },
            ], undefined, positionValue)
                .on("change", () => {
                switch (lsPositionCb.Value) {
                    case "top":
                        lc.forEach((e) => e.labelPosition(LabelPosition.TOP));
                        break;
                    case "end":
                        lc.forEach((e) => e.labelPosition(LabelPosition.END));
                        break;
                    case "bottom":
                        lc.forEach((e) => e.labelPosition(LabelPosition.BOTTOM));
                        break;
                    case "start":
                        lc.forEach((e) => e.labelPosition(LabelPosition.START));
                        break;
                }
            }),
            lsAlignmentCb = $.labeledSelect("Label alignment", [
                { Text: "START", Value: "start" },
                { Text: "CENTER", Value: "center" },
                { Text: "END", Value: "end" },
            ], undefined, alignmentValue)
                .on("change", () => {
                switch (lsAlignmentCb.Value) {
                    case "start":
                        lc.forEach((e) => e.labelAlignment(LabelAlignment.START));
                        break;
                    case "center":
                        lc.forEach((e) => e.labelAlignment(LabelAlignment.CENTER));
                        break;
                    case "end":
                        lc.forEach((e) => e.labelAlignment(LabelAlignment.END));
                        break;
                }
            }),
            includeWideLabel
                ? $.labeledCheckbox("Use wide label with fixed width")
                    .on("checked", () => lc.forEach((e) => e.toggleClass("wide-label")))
                : undefined
        ];
    }

    const intro$W = `
A component with an §@dom/A§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledAnchor\`
`;
    const example$T = `
### Code example

\`\`\`
import { LabeledAnchor } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const anchor1 = new LabeledAnchor(
    "https://github.com/mn4367/vanilla-ts-dom",
    "DOM project home",
    "Vanilla.ts DOM"
)
    .addClass("labeled-anchor")
    .target("_blank");

const anchor2 = new LabeledAnchor(
    "https://github.com/mn4367/vanilla-ts-components",
    "Components project home",
    [] // \`[]\` or \`undefined\` => link text is the href attribute of the anchor.
)
    .addClass("labeled-anchor")
    .target("_blank");

new VTS_App(document.body).append(anchor1, anchor2);
\`\`\`
`;
    class LabeledAnchorEx extends BaseExample {
        #lAnchor1;
        #lAnchor2;
        constructor() {
            super("LabeledAnchor");
        }
        /** @inheritdoc */
        buildExample() {
            this.#lAnchor1 = $.labeledAnchor("https://github.com/mn4367/vanilla-ts-dom", "DOM project home", "Vanilla.ts DOM").target("_blank");
            this.#lAnchor2 = $.labeledAnchor("https://github.com/mn4367/vanilla-ts-components", "Components project home").target("_blank");
            this.append(this.markdown(intro$W), this.example([new Div(this.#lAnchor1, new Br(), this.#lAnchor2)]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lAnchor1, this.#lAnchor2], true, "start", "start")), this.markdown(example$T));
        }
    }

    const introLabeledCheckbox = `
A component with a §@dom/Checkbox / Switch§ and a §@dom/Label§ representing a caption for the
component.

**Class:** \`@vanilla-ts/components/LabeledCheckbox\`
`;
    const exampleLabeledCheckbox = `
### Code example (labeled checkbox)

\`\`\`
import { LabeledCheckbox } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledCheckbox("Use classic design")
    .addClass("labeled-checkbox")
    .checked(true);
    //.checked(false);
    //.indeterminate(true);

new VTS_App(document.body).append(example);
\`\`\`

For easier handling, the labeled checkbox component emits its own event \`CheckedEvent\`; see the
corresponding documentation in the \`LabeledCheckbox\` class.
`;
    const introLabeledSwitch = `
## Labeled switch

The labeled checkbox is also available with a 'switch' design. This is achieved by simply adding the
class \`switch\` to the \`Checkbox\` property available on the \`LabeledCheckbox\` instance.`;
    const exampleLabeledSwitch = `
### Code example (labeled switch)

\`\`\`
import { LabeledCheckbox } from "@vanilla-ts/components";

const lcb = new LabeledCheckbox("Use modern design")
    .addClass("labeled-checkbox")
    .checked(true);
lcb.Checkbox.addClass("switch");
\`\`\`
`;
    const exampleComponentFactory$1 = `
### Component factory

Using a component factory makes it easier to create labeled checkbox and labeled switch components.

\`\`\`
import {
    CSSClassNameFactory,
    LabeledCheckboxFactory,
    mixinComponentFactories
} from "@vanilla-ts/components";

const cf = new (mixinComponentFactories(
    CSSClassNameFactory,
    LabeledCheckboxFactory,
    // more factories can be added here
    // ...
))();


// Regular labeled checkbox
const cb = cf.labeledCheckbox("Use classic design");
// Labeled switch (automatically adds the \`switch\` class to the \`Checkbox\` property of the
// created LabeledCheckbox instance)
const sw = cf.labeledSwitch("Use modern design");
\`\`\`

For an advanced usage of component factories see §@core/Component factories§.
`;
    class LabeledCheckboxEx extends BaseExample {
        #lcb;
        #rbgCb;
        #lswitch;
        #rbgSwitch;
        constructor() {
            super("LabeledCheckbox / -Switch");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(introLabeledCheckbox), this.example([
                this.#lcb = $.labeledCheckbox("Use classic design")
                    .checked(true)
                    .on("checked", () => this.#rbgCb.value(this.#lcb.Checked ? "checked" : "unchecked"))
            ]), this.markdown("### Label position, label alignment and checkbox states"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lcb], true, "end", "start"), this.#rbgCb = $.radioButtonGroup([
                { Label: "Checked", Value: "checked" },
                { Label: "Unchecked", Value: "unchecked" },
                { Label: "Indeterminate", Value: "indeterminate" }
            ], "rbg-labeled-checkbox-ex")
                .value("checked")
                .on("checked", (ev) => {
                switch (ev.$.Sender.Value) {
                    case "checked":
                        this.#lcb.checked(true);
                        break;
                    case "unchecked":
                        this.#lcb.checked(false);
                        break;
                    case "indeterminate":
                        this.#lcb.indeterminate(true);
                        break;
                }
            })), this.markdown(exampleLabeledCheckbox), this.markdown("---"), this.markdown(introLabeledSwitch), this.example([
                this.#lswitch = $.labeledCheckbox("Use modern design")
                    .checked(true)
                    .on("checked", () => this.#rbgSwitch.value(this.#lswitch.Checked ? "checked" : "unchecked"))
            ]), this.markdown("### Label position, label alignment and switch states"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lswitch], true, "end", "start"), this.#rbgSwitch = $.radioButtonGroup([
                { Label: "Checked", Value: "checked" },
                { Label: "Unchecked", Value: "unchecked" },
                { Label: "Indeterminate", Value: "indeterminate" }
            ], "rbg-labeled-switch-ex-s")
                .value("checked")
                .on("checked", (ev) => {
                switch (ev.$.Sender.Value) {
                    case "checked":
                        this.#lswitch.checked(true);
                        break;
                    case "unchecked":
                        this.#lswitch.checked(false);
                        break;
                    case "indeterminate":
                        this.#lswitch.indeterminate(true);
                        break;
                }
            })), this.markdown(exampleLabeledSwitch), this.markdown("---"), this.markdown(exampleComponentFactory$1));
            this.#lswitch.Checkbox.addClass("switch");
        }
    }

    const intro$V = `
A component with a §@dom/Div§ as a (inner) container for other components and a §@dom/Span§
representing the caption for the container component.

**Class:** \`@vanilla-ts/components/LabeledContainer\`
`;
    const example$S = `
### Code example

\`\`\`
import { LabeledCheckbox, LabeledContainer, RadioButtonGroup } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Hr, P } from "@vanilla-ts/dom";

let rbg1: RadioButtonGroup;
let lcb1: LabeledCheckbox;
let lcb2: LabeledCheckbox;
let lcb3: LabeledCheckbox;

const example = new LabeledContainer(
    "Software update settings",
    undefined,
    LabelAlignment.CENTER
)
    .addClass("labeled-container", "software-updates")
    .append(
        new P("Types of updates to be notified about"),
        rbg1 = new RadioButtonGroup(
            [
                { Label: "Regular updates", Value: "regular" },
                { Label: "Beta versions", Value: "beta" },
                { Label: "Nightly builds", Value: "nightly" },
            ],
            "rbg-software-updates"
        )
            .value("beta"),
        new Hr(),
        new P("Choose how updates should be installed"),
        lcb1 = new LabeledCheckbox("Automatically download available updates")
            .checked(true),
        lcb2 = new LabeledCheckbox("Install updates automatically")
            .checked(true),
        lcb3 = new LabeledCheckbox("Install security updates automatically")
            .checked(true)
            .disabled(true),
    );

new VTS_App(document.body).append(example);
\`\`\`
`;
    const exampleCSS$1 = `
### CSS example

\`\`\`css
.labeled-container.software-updates {
    > .lc-component {
        > p {
            margin-block: 0.5rem;
        }
        > hr {
            margin-block: 1rem;
        }
    }
}
\`\`\`
`;
    class LabeledContainerEx extends BaseExample {
        #container;
        constructor() {
            super("LabeledContainer");
        }
        /** @inheritdoc */
        buildExample() {
            this.#container = $.labeledContainer("Software update settings", undefined, LabelAlignment.CENTER)
                .addClass("software-updates-sample")
                .append(new P("Types of updates to be notified about"), $.radioButtonGroup([
                { Label: "Regular updates", Value: "regular" },
                { Label: "Beta versions", Value: "beta" },
                { Label: "Nightly builds", Value: "nightly" },
            ], "rbg-sample-1")
                .value("beta"), $.hr(), new P("Choose how updates should be installed"), $.labeledCheckbox("Automatically download available updates").checked(true), $.labeledCheckbox("Install updates automatically").checked(true), $.labeledCheckbox("Install security updates automatically").checked(true).disabled(true));
            this.append(this.markdown(intro$V), this.example([this.#container]), this.markdown("### Label position and label alignment"), new Div().addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#container], false, "top", "center")), this.markdown(example$S), this.markdown(exampleCSS$1));
        }
    }

    const intro$U = `
A component with an §@dom/EmailInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledEmailInput\`
`;
    const example$R = `
### Code example

\`\`\`
import { LabeledEmailInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledEmailInput("Business contact")
    .addClass("labeled-email-input")
    .emailInput(c => c.placeholder("sophie@example.com"));

new VTS_App(document.body).append(example);
\`\`\`
`;
    class LabeledEmailInputEx extends BaseExample {
        #lInput;
        constructor() {
            super("LabeledEmailInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.#lInput = $
                .labeledEmailInput("Business contact")
                .emailInput(c => c.placeholder("sophie@example.com"));
            this.append(this.markdown(intro$U), this.example([this.#lInput]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lInput], true, "start", "start")), this.markdown(example$R));
        }
    }

    const intro$T = `
A component with a §@dom/NumberInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledNumberInput\`
`;
    const example$Q = `
### Code example

\`\`\`
import { LabeledNumberInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledNumberInput(
    "The answer to all questions?",
    undefined,      // id (auto-generated if not provided)
    "22",           // value (initial value)
    "the_question", // name (form name)
    "2",            // minimum value
    "44",           // maximum value
    "2"             // step interval
)
    .addClass("labeled-number-input")
    .numberInput(c => c.DOM.setCustomValidity("not_42")) // \`c\` is the inner \`NumberInput\`
    .on("input", () => {
        example.NumberInput.DOM.setCustomValidity(example.Value === "42" ? "" : "not_42");
    });

new VTS_App(document.body).append(example);
\`\`\`
`;
    const css = `
### CSS example

\`\`\`
.labeled-number-input {
    > input[type="number"] {
        &:valid {
            /* \`--color-success\` is defined in the default theme as \`hsl(120, 100 %, 35 %)\`*/
            color: var(--color-success);
        }
        /* \`:invalid\` is already defined in the default theme with
           \`--color-warn: hsl(0, 100 %, 72.5 %)\`
        &:invalid {
            color: var(--color-warn);
        }
        */
    }
}
\`\`\`
`;
    class LabeledNumberInputEx extends BaseExample {
        #lInput;
        constructor() {
            super("LabeledNumberInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.#lInput = $.labeledNumberInput("The answer to all questions?", undefined, // id (auto-generated if not provided)
            "22", // value (initial value)
            "the_question", // (form name)
            "2", // minimum value
            "44", // maximum value
            "2" // step interval
            )
                .addClass("lni-example")
                .numberInput(c => c.DOM.setCustomValidity("not_42"))
                .on("input", () => {
                this.#lInput.NumberInput.DOM.setCustomValidity(this.#lInput.Value === "42" ? "" : "not_42");
            });
            this.append(this.markdown(intro$T), this.example([this.#lInput]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lInput], true, "start", "start")), this.markdown(example$Q), this.markdown(css));
        }
    }

    const intro$S = `
A component with a §@dom/P§ and a §@dom/Span§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledParagraph\`
`;
    const example$P = `
### Code example

\`\`\`
import { LabeledParagraph } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledParagraph("Sample text", "Lorem ipsum ...")
    .addClass("labeled-paragraph");

new VTS_App(document.body).append(example);
\`\`\`
`;
    const lorem = `
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est.
`;
    class LabeledParagraphEx extends BaseExample {
        #lParagraph;
        constructor() {
            super("LabeledParagraph");
        }
        /** @inheritdoc */
        buildExample() {
            this.#lParagraph = $.labeledParagraph("Sample text", lorem);
            this.append(this.markdown(intro$S), this.example([this.#lParagraph]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lParagraph], true, "start", "start")), this.markdown(example$P));
        }
    }

    const intro$R = `
A component with a §@dom/PasswordInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledPasswordInput\`
`;
    const example$O = `
### Code example

\`\`\`
import { LabeledPasswordInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledPasswordInput("Password")
    .addClass("labeled-password-input")
    .passwordInput(c => c.placeholder("Enter password"));

new VTS_App(document.body).append(example);
\`\`\`
`;
    class LabeledPasswordInputEx extends BaseExample {
        #lInput;
        constructor() {
            super("LabeledPasswordInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.#lInput = $
                .labeledPasswordInput("Password")
                .passwordInput(c => c.placeholder("Enter password"));
            this.append(this.markdown(intro$R), this.example([this.#lInput]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lInput], true, "start", "start")), this.markdown(example$O));
        }
    }

    const intro$Q = `
A component with a §@dom/RadioButton§ and a §@dom/Label§ representing a caption for the component.
This class mainly exists as a building block for §@components/RadioButtonGroup§s and
§@components/LabeledRadioButtonGroup§s.

**Class:** \`@vanilla-ts/components/LabeledRadioButton\`
`;
    const example$N = `
### Code example

\`\`\`
import { LabeledRadioButton } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledRadioButton("Beta versions")
    .addClass("labeled-radio-button")
    .checked(true);
    //.checked(false);
    //.toggle(true);

new VTS_App(document.body).append(example);
\`\`\`

For easier handling, the labeled radio button component emits its own event \`CheckedEvent\`; see
the corresponding documentation in the \`LabeledRadioButton\` class.
`;
    class LabeledRadioButtonEx extends BaseExample {
        #lrb;
        #rbgCb;
        constructor() {
            super("LabeledRadioButton");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$Q), this.example([
                this.#lrb = $.labeledRadioButton("Beta versions")
                    .on("checked", () => this.#rbgCb.value(this.#lrb.Checked ? "checked" : "unchecked"))
            ]), this.markdown("### Label position, label alignment and radio button state"), new Div()
                .addClass("example-properties")
                .append(this.#rbgCb = $.radioButtonGroup([
                { Label: "Checked", Value: "checked" },
                { Label: "Unchecked", Value: "unchecked" },
            ], "rbg-labeled-radio-button-ex")
                .value("unchecked")
                .on("checked", (ev) => {
                switch (ev.$.Sender.Value) {
                    case "checked":
                        this.#lrb.checked(true);
                        break;
                    case "unchecked":
                        this.#lrb.checked(false);
                        break;
                }
            }), ...labeledComponentLabelFlags([this.#lrb], true, "end", "start"), $.labeledCheckbox("Allow toggling the state")
                .on("checked", () => this.#lrb.toggle(!this.#lrb.Toggle))), this.markdown(example$N));
        }
    }

    const intro$P = `
A component that groups multiple §@components/LabeledRadioButton§s into a single component that is
similar to a §@components/LabeledContainer§.

**Class:** \`@vanilla-ts/components/LabeledRadioButtonGroup\`
`;
    const example$M = `
### Code example

\`\`\`
import { LabeledRadioButtonGroup } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledRadioButtonGroup(
    "Your position",
    [
        { Label: "Software developer", Value: "software_developer" },
        { Label: "Security engineer", Value: "security_engineer" },
        { Label: "UX/UI designer", Value: "ux_ui_designer" },
        { Label: "DevOps engineer", Value: "devops_engineer" },
        { Label: "Other", Value: "other" },
    ],
    "your-position" // Group name
)
    .addClass("labeled-radio-button-group")
    .value("other");
    //.toggle(true);

new VTS_App(document.body).append(example);
\`\`\`

Grouping is done by attaching the same
%name|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio#defining_a_radio_group%
to all radio buttons in the group. The component makes it easier to handle multiple radio buttons
with functions like \`value()\`, \`toggle()\` etc. The group also emits a custom \`CheckedEvent\`
for easier handling of the checked state of the radio buttons; see the corresponding documentation
in the \`RadioButtonGroup\` class.
`;
    class LabeledRadioButtonGroupEx extends BaseExample {
        #lrbg;
        #lsAlignment;
        constructor() {
            super("LabeledRadioButtonGroup");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$P), this.example([
                this.#lrbg = $.labeledRadioButtonGroup("Your position", [
                    { Label: "Software developer", Value: "software_developer" },
                    { Label: "Security engineer", Value: "security_engineer" },
                    { Label: "UX/UI designer", Value: "ux_ui_designer" },
                    { Label: "DevOps engineer", Value: "devops_engineer" },
                    { Label: "Other", Value: "other" },
                ], "your-position")
                    .value("other")
            ]), this.markdown("### Alignment, label positions, label alignments and radio button states"), new Div()
                .addClass("example-properties")
                .append(this.markdown("\u2014 Outer labeled container \u2014"), ...labeledComponentLabelFlags([this.#lrbg], false, "top", "start"), $.br(), this.markdown("\u2014 Inner radio button group \u2014"), this.#lsAlignment = $.labeledSelect("Alignment", [
                { Text: "VERTICAL", Value: "vertical" },
                { Text: "HORIZONTAL", Value: "horizontal" },
            ])
                .on("change", () => {
                switch (this.#lsAlignment.Value) {
                    case "vertical":
                        this.#lrbg.RadioButtonGroup.orientation(Orientation.VERTICAL);
                        break;
                    case "horizontal":
                        this.#lrbg.RadioButtonGroup.orientation(Orientation.HORIZONTAL);
                        break;
                }
            }), 
            // $.labeledContainer("Inner radio button group").append(
            ...labeledComponentLabelFlags([this.#lrbg.RadioButtonGroup], true, "end", "start"), $.labeledCheckbox("Allow toggling the state")
                .on("checked", () => this.#lrbg.toggle(!this.#lrbg.Toggle))), this.markdown(example$M));
        }
    }

    const intro$O = `
A component with a §@dom/SearchInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledSearchInput\`
`;
    const example$L = `
### Code example

\`\`\`
import { LabeledSearchInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledSearchInput("Search")
    .addClass("labeled-search-input")
    .searchInput(c => c.placeholder("Enter search term..."));

new VTS_App(document.body).append(example);
\`\`\`
`;
    class LabeledSearchInputEx extends BaseExample {
        #lInput;
        constructor() {
            super("LabeledSearchInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.#lInput = $
                .labeledSearchInput("Search")
                .searchInput(c => c.placeholder("Enter search term..."));
            this.append(this.markdown(intro$O), this.example([this.#lInput]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lInput], true, "start", "start")), this.markdown(example$L));
        }
    }

    const intro$N = `
A component with an §@dom/Select§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledSelect\`
`;
    const example$K = `
### Code example

\`\`\`
import { LabeledSelect, LabelPosition } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Em, ISelectValues, P } from "@vanilla-ts/dom";

const selectValues: ISelectValues[] = [
    { Text: "Apple", Value: "apple" },
    { Text: "Banana", Value: "banana" },
    { Text: "Cherry", Value: "cherry" },
    { Text: "Dragonfruit", Value: "dragonfruit" },
    { Text: "Eggplant", Value: "eggplant" }
];

const example = new LabeledSelect("Fruits", selectValues)
    .value("cherry")
    .labelPosition(LabelPosition.TOP)
    .on("change", () => log.phrase("Selected fruit (value): ", new Em(example.Value)));

const log = new P("Select a fruit from the dropdown above.")
    .style("marginBlockStart", "1rem");

new VTS_App(document.body).append(example, log);
\`\`\`
`;
    class LabeledSelectEx extends BaseExample {
        #lInput;
        constructor() {
            super("LabeledSelect");
        }
        /** @inheritdoc */
        buildExample() {
            const selectValues = [
                { Text: "Apple", Value: "apple" },
                { Text: "Banana", Value: "banana" },
                { Text: "Cherry", Value: "cherry" },
                { Text: "Dragonfruit", Value: "dragonfruit" },
                { Text: "Eggplant", Value: "eggplant" }
            ];
            const log = new P("Select a fruit from the dropdown above.").style("marginBlockStart", "1rem");
            this.#lInput = $.labeledSelect("Fruits", selectValues)
                .value("cherry")
                .labelPosition(LabelPosition.TOP)
                .on("change", () => log.phrase("Selected fruit (value): ", new Em(this.#lInput.Value)));
            this.append(this.markdown(intro$N), this.example([
                this.#lInput,
                log
            ]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lInput], true, "top", "start")), this.markdown(example$K));
        }
    }

    const intro$M = `
A component with a §@dom/TextInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledTextInput\`
`;
    const example$J = `
### Code example

\`\`\`
import { LabeledTextInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledTextInput("Username")
    .addClass("labeled-text-input")
    .textInput(c => c.placeholder("Enter your name here"));

new VTS_App(document.body).append(example);
\`\`\`
`;
    class LabeledTextInputEx extends BaseExample {
        #lInput;
        constructor() {
            super("LabeledTextInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.#lInput = $
                .labeledTextInput("Username")
                .textInput(c => c.placeholder("Enter your name here"));
            this.append(this.markdown(intro$M), this.example([this.#lInput]), this.markdown("### Label position and label alignment"), new Div()
                .addClass("example-properties")
                .append(...labeledComponentLabelFlags([this.#lInput], true, "start", "start")), this.markdown(example$J));
        }
    }

    const intro$L = `
A component that groups multiple §@components/LabeledRadioButton§s into a single component.

**Class:** \`@vanilla-ts/components/RadioButtonGroup\`
`;
    const example$I = `
### Code example

\`\`\`
import { RadioButtonGroup } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new RadioButtonGroup(
    [
        { Label: "Regular updates", Value: "regular" },
        { Label: "Beta versions", Value: "beta" },
        { Label: "Nightly builds", Value: "nightly" },
    ],
    "software-updates" // Group name
)
    .addClass("radio-button-group")
    .value("beta");
    //.toggle(true);

new VTS_App(document.body).append(example);
\`\`\`

Grouping is done by attaching the same
%name|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio#defining_a_radio_group%
to all radio buttons in the group. The component makes it easier to handle multiple radio buttons
with functions like \`value()\`, \`toggle()\` etc. The group also emits a custom \`CheckedEvent\`
for easier handling of the checked state of the radio buttons; see the corresponding documentation
in the \`RadioButtonGroup\` class.
`;
    class RadioButtonGroupEx extends BaseExample {
        #rbg;
        #lsAlignment;
        constructor() {
            super("RadioButtonGroup");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$L), this.example([
                this.#rbg = $.radioButtonGroup([
                    { Label: "Regular updates", Value: "regular" },
                    { Label: "Beta versions", Value: "beta" },
                    { Label: "Nightly builds", Value: "nightly" },
                ], "software-updates")
                    .value("beta")
            ]), this.markdown("### Alignment, label position, label alignment and radio button state"), new Div()
                .addClass("example-properties")
                .append(this.#lsAlignment = $.labeledSelect("Alignment", [
                { Text: "VERTICAL", Value: "vertical" },
                { Text: "HORIZONTAL", Value: "horizontal" },
            ])
                .on("change", () => {
                switch (this.#lsAlignment.Value) {
                    case "vertical":
                        this.#rbg.orientation(Orientation.VERTICAL);
                        break;
                    case "horizontal":
                        this.#rbg.orientation(Orientation.HORIZONTAL);
                        break;
                }
            }), ...labeledComponentLabelFlags([this.#rbg], true, "end", "start"), $.labeledCheckbox("Allow toggling the state")
                .on("checked", () => this.#rbg.toggle(!this.#rbg.Toggle))), this.markdown(example$I));
        }
    }

    class ComponentFactoriesEx extends BaseExample {
        constructor() {
            super("Component factories");
        }
        /** @inheritdoc */
        buildExample() {
            this
                .append(this.markdown("..."));
        }
    }

    class ElementComponentVoidEx extends BaseExample {
        constructor() {
            super("ElementComponentVoid");
        }
        /** @inheritdoc */
        buildExample() {
            this
                .append(this.markdown("..."));
        }
    }

    class ElementComponentWithChildrenEx extends BaseExample {
        constructor() {
            super("ElementComponentWithChildren");
        }
        /** @inheritdoc */
        buildExample() {
            this
                .append(this.markdown("..."));
        }
    }

    class EventBusEx extends BaseExample {
        constructor() {
            super("EventBus");
        }
        /** @inheritdoc */
        buildExample() {
            this
                .append(this.markdown("..."));
        }
    }

    const intro$K = `
The components provided by the \`@vanilla-ts/core\` package ...
`;
    class CoreIntroductionEx extends BaseExample {
        constructor() {
            super();
        }
        /** @inheritdoc */
        buildExample() {
            this
                .addClass("ex-core-introduction")
                .append(this.markdown(intro$K));
        }
    }

    const intro$J = `
A component that encapsulates the DOM element
%\`<address>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address%.

**Class:** \`@vanilla-ts/dom/Address\`
`;
    const example$H = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { A, Address, Br, Div, P } from "@vanilla-ts/dom";

const example = new Div()
    .append(
        new P("Contact the author of this page:"),
        new Address().append(
            new A("mailto:jim@example.com", "jim@example.com"),
            new Br(),
            new A("tel:+14155550132", "+1 (415) 555‑0132")
        )
    );

new VTS_App(document.body).append(example);
\`\`\`
`;
    class AddressEx extends BaseExample {
        constructor() {
            super("Address");
        }
        /** @inheritdoc */
        buildExample() {
            let address;
            this.append(this.markdown(intro$J), this.example([
                new P("Contact the author of this page:"),
                address = new Address().append(new A("mailto:jim@example.com", "jim@example.com"), new Br(), new A("tel:+14155550132", "+1 (415) 555‑0132"))
            ], [address]), this.markdown(example$H));
        }
    }

    const intro$I = `
A component that encapsulates a native DOM anchor element
(%\`<a>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a%).
This component is also available as a §@components/LabeledAnchor§.

**Class:** \`@vanilla-ts/dom/A\`
`;
    const example$G = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { A } from "@vanilla-ts/dom";

const example = new A(
    "https://github.com/mn4367/vanilla-ts-components",
    "Go to vanilla-ts-components at GitHub."
)
    .target("_blank");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class AEx extends BaseExample {
        constructor() {
            super("A");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$I), this.example([
                new A("https://github.com/mn4367/vanilla-ts-components", "Go to vanilla-ts-components at GitHub.").target("_blank")
            ]), this.markdown(example$G));
        }
    }

    const intro$H = `
A component that encapsulates the DOM element
%\`<b>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/b%.

**Class:** \`@vanilla-ts/dom/B\`
`;
    const example$F = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { B, P } from "@vanilla-ts/dom";

const b = new B("dolor");

const example = new P("Lorem ipsum ", b, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class BEx extends BaseExample {
        constructor() {
            super("B");
        }
        /** @inheritdoc */
        buildExample() {
            const b = new B("dolor");
            this.append(this.markdown(intro$H), this.example([
                new P("Lorem ipsum ", b, " sit amet.")
            ], [b]), this.markdown(example$F));
        }
    }

    const intro$G = `
A component that encapsulates the DOM element
%\`<br>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/br%.

**Class:** \`@vanilla-ts/dom/Br\`
`;
    const example$E = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Br, P } from "@vanilla-ts/dom";

const example = new P("Lorem ipsum dolor", new Br(), "sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class BrEx extends BaseExample {
        constructor() {
            super("Br");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$G), this.example([
                new P("Lorem ipsum dolor", new Br(), "sit amet.")
            ]), this.markdown(example$E));
        }
    }

    const intro$F = `
A component that encapsulates the native DOM button element
(%\`<button>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button%).

**Class:** \`@vanilla-ts/dom/Button\`

__Note:__ Buttons do not have a default styling. This is done to ease the creation of dedicated
button styles for different usage contexts (like dialogs, toolbars, icon buttons etc.).
`;
    const example$D = `
### Code example (unstyled default button)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Button } from "@vanilla-ts/dom";

const example = new Button("Button");

new VTS_App(document.body).append(example);
\`\`\`
`;
    const exampleStyled = `
Nevertheless, it is expected that every CSS theme (like the default the theme of Vanilla-ts already
does) provides styles for the following common button types:

- Normal buttons (for example to dismiss a dialog) are given the class name \`regular\`.
- Default buttons are given the class name \`default\` in addition to \`regular\`. Usually such
  buttons are are triggerd by pressing the 'Enter' key regardless of where the current focus is.
- Buttons that trigger a destructive action (like deleting data) are given the class name \`warn\`
  in addition to \`regular\`. \`warn\` can't be used together with \`default\`, doing so may lead to
  a confusing styling.

### Code example (styled default buttons)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Button } from "@vanilla-ts/dom";

const btnSkip = new Button("Skip").addClass("regular", "warn");
const btnCancel = new Button("Cancel").addClass("regular");
const btnOk = new Button("OK").addClass("regular", "default");

new VTS_App(document.body).append(btnSkip, btnCancel, btnOk);
\`\`\`
`;
    const exampleFactory = `
### Component factory

Because always adding class names manually is not very convenient, it's recommended to use the
\`ButtonFactory\` from \`@vanilla-ts/dom/Button\`, for example:


\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { ButtonFactory } from "@vanilla-ts/dom";

const bf = new ButtonFactory();

const btnSkip = bf.buttonWarn("Skip");
const btnCancel = bf.buttonRegular("Cancel");
const btnOk = bf.buttonDefault("OK");

new VTS_App(document.body).append(btnSkip, btnCancel, btnOk);
\`\`\`

This way, the correct class names are applied automatically (the result is optically identical to
the previous example). For an advanced usage of component factories see §@core/ComponentFactories§.
`;
    class ButtonEx extends BaseExample {
        constructor() {
            super("Button");
        }
        /** @inheritdoc */
        buildExample() {
            let btnSkip;
            let btnCancel;
            let btnOk;
            this.append(this.markdown(intro$F), this.markdown(example$D), this.example([
                new Button("Button")
            ]), this.markdown(exampleStyled), this.example([
                btnSkip = $.buttonWarn("Skip"),
                new Text$1("\u2003"),
                btnCancel = $.buttonRegular("Cancel"),
                new Text$1("\u2003"),
                btnOk = $.buttonDefault("OK"),
            ], [btnSkip, btnCancel, btnOk]), this.markdown(exampleFactory));
        }
    }

    const intro$E = `
A component that encapsulates the DOM element
%\`<canvas>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas%.

**Class:** \`@vanilla-ts/dom/Canvas\`
`;
    const example$C = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Canvas } from "@vanilla-ts/dom";

const example = new Canvas("Three overlapping colored circles")
    .width(200)
    .height(200)
    .style("border", "1px solid black");

// Get a drawing context from the underlying native canvas element (\`DOM\`).
const ctx = example.DOM.getContext("2d")!;

const drawCircle = (x: number, y: number, radius: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
};

drawCircle(50, 50, 40, "red");
drawCircle(100, 100, 40, "green");
drawCircle(150, 150, 40, "blue");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class CanvasEx extends BaseExample {
        constructor() {
            super("Canvas");
        }
        /** @inheritdoc */
        buildExample() {
            const canvas = new Canvas("Three overlapping colored circles")
                .width(200)
                .height(200)
                .style("border", "1px solid black");
            const ctx = canvas.DOM.getContext("2d");
            const drawCircle = (x, y, radius, color) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fill();
            };
            drawCircle(50, 50, 40, "red");
            drawCircle(100, 100, 40, "green");
            drawCircle(150, 150, 40, "blue");
            this.append(this.markdown(intro$E), this.exampleNoToolbar(canvas), this.markdown(example$C));
        }
    }

    const introCheckbox = `
A component that encapsulates the native DOM checkbox
(%\`<input type="checkbox">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox%).
This component is also available as a §@components/LabeledCheckbox / -Switch§.

**Class:** \`@vanilla-ts/dom/Checkbox\`
`;
    const exampleCheckbox = `
### Code example (checkbox)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Checkbox } from "@vanilla-ts/dom";

const cb1 = new Checkbox().checked(true);
const cb2 = new Checkbox().checked(false);
const cb3 = new Checkbox().indeterminate(true);

new VTS_App(document.body).append(cb1, cb2, cb3);
\`\`\`

For easier handling, the checkbox component emits its own event \`CheckedEvent\`; see the
corresponding documentation in the \`Checkbox\` class.
`;
    const introSwitch = `
## Switch

The checkbox is also available with a 'switch' design. This is achieved by simply adding the class
\`switch\` to the checkbox instance:
`;
    const exampleSwitch = `
### Code example (switch)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Checkbox } from "@vanilla-ts/dom";

const cb1 = new Checkbox().checked(true).addClass("switch");
const cb2 = new Checkbox().checked(false).addClass("switch");
const cb3 = new Checkbox().indeterminate(true).addClass("switch");

new VTS_App(document.body).append(cb1, cb2, cb3);
\`\`\`
`;
    const exampleComponentFactory = `
### Component factory

Using a component factory makes it easier to create checkbox and switch components.

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { CheckboxFactory } from "@vanilla-ts/dom";

const cbf = new CheckboxFactory();

// Regular checkbox
const cb = cbf.checkbox();
// Switch (automatically adds the \`switch\` class)
const sw = cbf.switch();

new VTS_App(document.body).append(cb, sw);
\`\`\`

For an advanced usage of component factories see §@core/Component factories§.
`;
    class CheckboxEx extends BaseExample {
        #cb;
        #rbgCb;
        #switch;
        #rbgSwitch;
        constructor() {
            super("Checkbox");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(introCheckbox), this.example([this.#cb = new Checkbox()
                    .checked(true)
                    .on("checked", () => this.#rbgCb.value(this.#cb.Checked ? "checked" : "unchecked"))]), this.markdown("### States"), new Div().addClass("example-properties")
                .append(this.#rbgCb = $.radioButtonGroup([
                { Label: "Checked", Value: "checked" },
                { Label: "Unchecked", Value: "unchecked" },
                { Label: "Indeterminate", Value: "indeterminate" }
            ], "rbg-checkbox-ex")
                .value("checked")
                .on("checked", (ev) => {
                switch (ev.$.Sender.Value) {
                    case "checked":
                        this.#cb.checked(true);
                        break;
                    case "unchecked":
                        this.#cb.checked(false);
                        break;
                    case "indeterminate":
                        this.#cb.indeterminate(true);
                        break;
                }
            })), this.markdown(exampleCheckbox), this.markdown("---"), this.markdown(introSwitch), this.example([
                this.#switch = new Checkbox()
                    .addClass("switch")
                    .checked(true)
                    .on("checked", () => this.#rbgSwitch.value(this.#switch.Checked ? "checked" : "unchecked"))
            ]), this.markdown("### States"), new Div().addClass("example-properties")
                .append(this.#rbgSwitch = $.radioButtonGroup([
                { Label: "Checked", Value: "checked" },
                { Label: "Unchecked", Value: "unchecked" },
                { Label: "Indeterminate", Value: "indeterminate" }
            ], "rbg-switch-ex-s")
                .value("checked")
                .on("checked", (ev) => {
                switch (ev.$.Sender.Value) {
                    case "checked":
                        this.#switch.checked(true);
                        break;
                    case "unchecked":
                        this.#switch.checked(false);
                        break;
                    case "indeterminate":
                        this.#switch.indeterminate(true);
                        break;
                }
            })), this.markdown(exampleSwitch), this.markdown("---"), this.markdown(exampleComponentFactory));
        }
    }

    const intro$D = `
A component that encapsulates the DOM element
%\`<code>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code%.

**Class:** \`@vanilla-ts/dom/Code\`
`;
    const example$B = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Code, P } from "@vanilla-ts/dom";

const c = new Code("dolor").style("background", "lightgray");

const example = new P("Lorem ipsum ", c, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class CodeEx extends BaseExample {
        constructor() {
            super("Code");
        }
        /** @inheritdoc */
        buildExample() {
            const c = new Code("dolor").style("background", "lightgray");
            this.append(this.markdown(intro$D), this.example([
                new P("Lorem ipsum ", c, " sit amet.")
            ], [c]), this.markdown(example$B));
        }
    }

    const intro$C = `
A component that encapsulates a DOM comment node
(%\`<!-\u200b- -->\`|https://developer.mozilla.org/en-US/docs/Web/API/Comment%).
There is, of course, no visual representation of a comment node in a web page but the created
component can be used like any other 'real' component.

**Class:** \`@vanilla-ts/dom/Comment\`
`;
    const example$A = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Comment } from "@vanilla-ts/dom";

const example = new Comment("Lorem ipsum dolor sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class CommentEx extends BaseExample {
        constructor() {
            super("Comment");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$C), this.exampleNoToolbar(new Comment("Lorem ipsum dolor sit amet."), new Code("<!--", new Text$1(new Comment("Lorem ipsum dolor sit amet.").Text), "-->")), this.markdown(example$A));
        }
    }

    const intro$B = `
A component that encapsulates a native dialog DOM element
(%\`<dialog>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog%).
The §@components/Dialog§ class from \`@vanilla-ts/components\` builds upon this class here and adds
a lot of advanced features.

**Class:** \`@vanilla-ts/dom/Dialog\`
`;
    const example$z = `
### Code example

\`\`\`
import { IElementComponent, VTS_App } from "@vanilla-ts/core";
import { Br, Code, Dialog, P } from "@vanilla-ts/dom";

function getDialog(modal: boolean, caller?: IElementComponent<HTMLElement>): Dialog {
    const dlg = new Dialog(
        new P(
            \`This is a \${modal? "modal": "non-modal"} dialog.\`, new Br(),
            modal
                ? "It can be closed by clicking the 'Close' button, by pressing the 'Esc' key"
                : "It can be closed by clicking the 'Close' button", new Br(),
            "or programmatically via the ", new Code("<dlg>.close()"), " function.",
        ),
        new Button("Close")
            .autofocus(true)
            .on("click", () => dlg.close())
    ).on("close", () => caller?.disabled(false));
    return dlg;
}

const nonModalDlg = getDialog(false, btnNonModal);
const modalDlg = getDialog(true, btnModal);

const btnNonModal = new Button("Open a non-modal dialog")
    .on("click", () =>
        nonModalDlg.Open || btnNonModal.disabled(true) && nonModalDlg.show()
    );

const btnModal = new Button("Open a modal dialog")
    .on("click", () =>
        modalDlg.Open
            ? modalDlg.close()
            : btnModal.disabled(true) && modalDlg.showModal()
    );

new VTS_App(document.body).append(btnNonModal, btnModal);
\`\`\`
`;
    class DialogEx extends BaseExample {
        constructor() {
            super("Dialog");
        }
        /** @inheritdoc */
        async buildExample() {
            function getDialog(modal, caller) {
                const dlg = new Dialog(new P(`This is a ${modal ? "modal" : "non-modal"} dialog.`, new Br(), modal
                    ? "It can be closed by clicking the 'Close' button, by pressing the 'Esc' key"
                    : "It can be closed by clicking the 'Close' button", new Br(), "or programmatically via the ", new Code("<dlg>.close()"), " function."), $.buttonRegular("Close")
                    .autofocus(true)
                    .on("click", () => dlg.close())).on("close", () => caller?.disabled(false));
                return dlg;
            }
            const btnNonModal = $.buttonRegular("Open a non-modal dialog")
                .on("click", () => nonModalDlg.Open || btnNonModal.disabled(true) && nonModalDlg.show());
            const btnModal = $.buttonRegular("Open a modal dialog")
                .on("click", () => modalDlg.Open ? modalDlg.close() : btnModal.disabled(true) && modalDlg.showModal());
            const nonModalDlg = getDialog(false, btnNonModal);
            const modalDlg = getDialog(true, btnModal);
            this.append(this.markdown(intro$B), this.markdown("### Examples"), this.properties(btnNonModal, new Text$1("\u2003"), btnModal), this.markdown(example$z));
        }
    }

    const intro$A = `
A component that encapsulates the DOM element
%\`<div>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div%.

**Class:** \`@vanilla-ts/dom/Div\`
`;
    const example$y = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Br, Button, Code, Div, P } from "@vanilla-ts/dom";

const example = new Div(new P("Example ", new Code("<div>").dir("ltr"), "."))
    .style({
        padding: "1rem",
        borderRadius: "1rem",
        border: "1px solid lightgray"
    })
    .append(
        new Br(),
        new P("Lorem ipsum dolor sit amet."),
        new Button("Click me!")
            .addClass("regular")
            .on("click", () => alert("Thank you!"))
    );

new VTS_App(document.body).append(example);
\`\`\`
`;
    class DivEx extends BaseExample {
        constructor() {
            super("Div");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$A), this.example([
                new Div(new P("Example ", new Code("<div>").dir("ltr"), "."))
                    .style({
                    padding: "1rem",
                    borderRadius: "1rem",
                    border: "1px solid lightgray"
                })
                    .append(new Br(), new P("Lorem ipsum dolor sit amet."), new Button("Click me!")
                    .addClass("regular")
                    .on("click", () => alert("Thank you!")))
            ]), this.markdown(example$y));
        }
    }

    const intro$z = `
A component that encapsulates a native email input DOM element
(%\`<input type="email">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email%).
This component is also available as a §@components/LabeledEmailInput§.

**Class:** \`@vanilla-ts/dom/EmailInput\`
`;
    const example$x = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { EmailInput } from "@vanilla-ts/dom";

const example = new EmailInput().placeholder("sophie@example.com");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class EmailInputEx extends BaseExample {
        constructor() {
            super("EmailInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$z), this.example([
                new EmailInput().placeholder("sophie@example.com")
            ]), this.markdown(example$x));
        }
    }

    const intro$y = `
A component that encapsulates the DOM element
%\`<em>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em%.

**Class:** \`@vanilla-ts/dom/Em\`
`;
    const example$w = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Em, P } from "@vanilla-ts/dom";

const em = new Em("dolor");

const example = new P("Lorem ipsum ", em, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class EmEx extends BaseExample {
        constructor() {
            super("Em");
        }
        /** @inheritdoc */
        buildExample() {
            let em = new Em("dolor");
            this.append(this.markdown(intro$y), this.example([
                new P("Lorem ipsum ", em, " sit amet."),
            ], [em]), this.markdown(example$w));
        }
    }

    const intro$x = `
A component that encapsulates the DOM element
%\`<footer>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer%.

**Class:** \`@vanilla-ts/dom/Footer\`
`;
    const example$v = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Footer, Header, Main } from "@vanilla-ts/dom";

const style = {
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid lightgray"
};

const h = new Header("Header content").style(style);
const m = new Main("Main content").style("padding", "1rem 0.5rem");
const f = new Footer("Footer content").style(style);

new VTS_App(document.body).append(h, m, f);
\`\`\`
`;
    class FooterEx extends BaseExample {
        constructor() {
            super("Footer");
        }
        /** @inheritdoc */
        buildExample() {
            const style = {
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid lightgray"
            };
            const h = new Header("Header content").style(style);
            const m = new Main("Main content").style("padding", "1rem 0.5rem");
            const f = new Footer("Footer content").style(style);
            this.append(this.markdown(intro$x), this.example([
                new Div(h, m, f).id(cid())
            ], [f]), this.markdown(example$v));
        }
    }

    const intro$w = `
A component that encapsulates a DOM document fragment
(%\`DocumentFragment\`|https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment%).

**Class:** \`@vanilla-ts/dom/Fragment\`

There are not so many use cases for this component, but it can be useful in some scenarios,
like collecting components to be appended in a single operation later to another component, or to
create a real DOM fragment from regular components which should be appended to another DOM node.

Like with a real DOM fragment, the \`Fragment\` component shouldn't be seen as a
%performance optimization|https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment#performance%
for appending/inserting component collections. If you need to append/insert multiple components to
another component, the regular \`append()\`/\`insert()\` functions are usually a bit faster.
`;
    const example$u = `
### Code examples

\`\`\`
import { Div, Fragment, P } from "@vanilla-ts/dom";

// Regular use case.
const f1 = new Fragment(new P("first child"));
const extracted: INodeComponent<Node>[] = [];
this.extract(extracted);
f1.append(...extracted, new P("last child"));
const t1 = new Div();
t1.appendFragment(f1);
f1.dispose();

// Using the released fragment for a direct DOM manipulation on another node.
const f2 = new Fragment();
f2.append(new P("first child"), new P("second child"), new P(" third child"));
// Append some other components
// f2.append(...);
// Release the fragment for direct DOM use
const content = f2.release();
const DOM = document.getElementById("target")!;
for (const child of content.Children) {
    console.log("Adding " + child.ClassName + " to '<" + DOM.tagName + ">' target element.");
}
DOM.append(content.Fragment);
f2.dispose();
\`\`\`
`;
    class FragmentEx extends BaseExample {
        constructor() {
            super("Fragment");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$w), this.markdown(example$u));
        }
    }

    const intro$v = `
A component that encapsulates the DOM element
%\`<header>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header%.

**Class:** \`@vanilla-ts/dom/Header\`
`;
    const example$t = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Footer, Header, Main } from "@vanilla-ts/dom";

const style = {
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid lightgray"
};

const h = new Header("Header content").style(style);
const m = new Main("Main content").style("padding", "1rem 0.5rem");
const f = new Footer("Footer content").style(style);

new VTS_App(document.body).append(h, m, f);
\`\`\`
`;
    class HeaderEx extends BaseExample {
        constructor() {
            super("Header");
        }
        /** @inheritdoc */
        buildExample() {
            const style = {
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid lightgray"
            };
            const h = new Header("Header content").style(style);
            const m = new Main("Main content").style("padding", "1rem 0.5rem");
            const f = new Footer("Footer content").style(style);
            this.append(this.markdown(intro$v), this.example([
                new Div(h, m, f).id(cid())
            ], [h]), this.markdown(example$t));
        }
    }

    const intro$u = `
A component that encapsulates the DOM element
%\`<hr>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr%.

**Class:** \`@vanilla-ts/dom/Hr\`
`;
    const example$s = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Hr } from "@vanilla-ts/dom";

const example = new Hr();

new VTS_App(document.body).append(example);
\`\`\`
`;
    class HrEx extends BaseExample {
        constructor() {
            super("Hr");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$u), this.example([
                new Hr(),
            ]), this.markdown(example$s));
        }
    }

    const intro$t = `
6 components that encapsulate the \`h1\` to \`h6\` section heading DOM elements
(%\`<h1>\` to \`<h6>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements%).

**Classes:** \`@vanilla-ts/dom/H1\` to \`@vanilla-ts/dom/H6\`
`;
    const example$r = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, H1, H2, H3, H4, H5, H6 } from "@vanilla-ts/dom";

const example = new Div().append(
    new H1("H1 Heading"),
    new H2("H2 Heading"),
    new H3("H3 Heading"),
    new H4("H4 Heading"),
    new H5("H5 Heading"),
    new H6("H6 Heading")
);

new VTS_App(document.body).append(example);
\`\`\`
`;
    class HxEx extends BaseExample {
        #h1;
        #h2;
        #h3;
        #h4;
        #h5;
        #h6;
        constructor() {
            super("Hx");
            new Div;
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$t), this.example([
                this.#h1 = new H1("H1 Heading"),
                this.#h2 = new H2("H2 Heading"),
                this.#h3 = new H3("H3 Heading"),
                this.#h4 = new H4("H4 Heading"),
                this.#h5 = new H5("H5 Heading"),
                this.#h6 = new H6("H6 Heading")
            ], [this.#h1, this.#h2, this.#h3, this.#h4, this.#h5, this.#h6]), this.markdown(example$r));
        }
    }

    const intro$s = `
A component that encapsulates the DOM element
%\`<i>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/i%.

**Class:** \`@vanilla-ts/dom/I\`
`;
    const example$q = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { I, P } from "@vanilla-ts/dom";

const i = new I("dolor");

const example = new P("Lorem ipsum ", i, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class IEx extends BaseExample {
        constructor() {
            super("I");
        }
        /** @inheritdoc */
        buildExample() {
            let i = new I("dolor");
            this.append(this.markdown(intro$s), this.example([
                new P("Lorem ipsum ", i, " sit amet."),
            ], [i]), this.markdown(example$q));
        }
    }

    const intro$r = `
A component that encapsulates the DOM element
%\`<img>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img%.

**Class:** \`@vanilla-ts/dom/Img\`
`;
    const example$p = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Img, P } from "@vanilla-ts/dom";

const example = new Img("./res/XPR15789.jpg")
    .width(3240)   // If possible, always set width and height
    .height(2160)  // explicitly to avoid layout shifts!
    .style({ "width": "25rem", "height": "auto" })
    .loading("lazy");
const p = new P("Of course it has to be a picture of a cat!")
    .style("textAlign", "center");

new VTS_App(document.body).append(example, p);
\`\`\`
`;
    class ImgEx extends BaseExample {
        constructor() {
            super("Img");
        }
        /** @inheritdoc */
        buildExample() {
            const img = new Img("./res/XPR15789.jpg")
                .width(3240)
                .height(2160)
                .style({ "width": "25rem", "height": "auto" })
                .loading("lazy");
            const p = new P("Of course it has to be a picture of a cat!")
                .style("textAlign", "center");
            this.append(this.markdown(intro$r), this.example([img, p], [img, p]), this.markdown(example$p));
        }
    }

    const intro$q = `
\`Input\` is an *abstract* component that is used as the base class for all input components, such
as §@dom/TextInput§, §@dom/Checkbox / Switch§, §@dom/RadioButton§, etc., so there is no visual
example here. It provides basic functionality common to all input components, such as \`required\` /
\`readonly\` attributes and value handling.

**Class:** \`@vanilla-ts/dom/Input\`
`;
    class InputEx extends BaseExample {
        constructor() {
            super("Input");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$q));
        }
    }

    const intro$p = `
## DOM components

The components provided by the \`@vanilla-ts/dom\` package are basic elements that encapsulate
native DOM elements and provide a convenient API for their usage and configuration. They are also
used as building blocks for more complex components like those in the
[\`@vanilla-ts/components\`](#@components/Introduction) package. Currently not yet all native DOM
elements are covered by this package. However, many common ones are and the package is continuously
being expanded.
`;
    class DOMIntroductionEx extends BaseExample {
        constructor() {
            super();
        }
        /** @inheritdoc */
        buildExample() {
            this
                .addClass("ex-dom-introduction")
                .append(this.markdown(intro$p));
        }
    }

    const intro$o = `
A component that encapsulates the DOM element
%\`<label>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label%.

**Class:** \`@vanilla-ts/dom/Label\`
`;
    const example$o = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, Label, TextInput } from "@vanilla-ts/dom";

const style: CSSStyleDeclarations = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem"
};
const example = new Div()
    .style(style)
    .append(
        new Label("ti", "Username"),
        new TextInput("ti", undefined, "text-input")
            .placeholder("Enter username here")
    );

new VTS_App(document.body).append(example);
\`\`\`

*Note:* \`@vanilla-ts/components\` already provides many specialized labeled components like
§@components/LabeledTextInput§ which internally use the \`Label\` component so there is usually no
need to manually construct labeled components like in the example aboove.
`;
    class LabelEx extends BaseExample {
        #label;
        constructor() {
            super("Label");
        }
        /** @inheritdoc */
        buildExample() {
            const style = {
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem"
            };
            const labeledTextInput = new Div()
                .style(style)
                .append(this.#label = new Label("ti", "Username"), new TextInput("ti", undefined, "text-input")
                .placeholder("Enter username here"));
            this.append(this.markdown(intro$o), this.example([labeledTextInput], [this.#label]), this.markdown(example$o));
        }
    }

    const intro$n = `
Components that encapsulate the DOM element
%\`<li>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li%
for ordered lists (§@dom/Ol§) and unordered lists (§@dom/Ul§). \`LiOl\` components also allow to set
an individual number with the first constructor argument. If this is set to \`undefined\`, the
number will be automatically generated by the browser.

**Classes:** \`@vanilla-ts/dom/LiOl\`, \`@vanilla-ts/dom/LiUl\`
`;
    const example$n = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, Em, Hr, LiOl, LiUl, Ol, P, Ul } from "@vanilla-ts/dom";

const example = new Div(
    new P("Shopping List:"),
    new Ul(
        // List items can be strings ...
        "Flour",
        "Baking powder",
        "Sugar",
        "Salt",
        "Oil",
        // ... or @vanilla-ts/dom/LiUl components ...
        new LiUl(
            "From the cooling shelf:",
            // ... or simply any other component, e.g. another @vanilla-ts/dom/Ul instance.
            new Ul(
                new LiUl("Eggs"),
                new LiUl("Milk")
            )
        )
    ),
    new Hr(),
    new P("How to make a muffin:"),
    new Ol(
        // For \`Ol\` list items the same applies.
        new LiOl(0, "Relax (optional)."), // An individual number can be set for every list item
        "Mix flour, baking powder, sugar, and salt.",
        "In another bowl, mix eggs, milk, and oil.",
        "Stir both mixtures together.",
        "Fill muffin tray 3/4 full.",
        new Em("Bake for 20 minutes.")
    )
);

new VTS_App(document.body).append(example);
\`\`\`
`;
    class LiOlUlEx extends BaseExample {
        constructor() {
            super("LiOl / LiUl");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$n), this.example([
                new P("Shopping List:"),
                new Ul("Flour", "Baking powder", "Sugar", "Salt", "Oil", new LiUl("From the cooling shelf:", new Ul(new LiUl("Eggs"), new LiUl("Milk")))),
                new Hr(),
                new P("How to make a muffin:"),
                new Ol(new LiOl(0, "Relax (optional)."), "Mix flour, baking powder, sugar, and salt.", "In another bowl, mix eggs, milk, and oil.", "Stir both mixtures together.", "Fill muffin tray 3/4 full.", new Em("Bake for 20 minutes."))
            ]), this.markdown(example$n));
        }
    }

    const intro$m = `
A component that encapsulates the DOM element
%\`<main>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main%.

**Class:** \`@vanilla-ts/dom/Main\`
`;
    const example$m = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Footer, Header, Main } from "@vanilla-ts/dom";

const style = {
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid lightgray"
};

const h = new Header("Header content").style(style);
const m = new Main("Main content").style("padding", "1rem 0.5rem");
const f = new Footer("Footer content").style(style);

new VTS_App(document.body).append(h, m, f);
\`\`\`
`;
    class MainEx extends BaseExample {
        constructor() {
            super("Main");
        }
        /** @inheritdoc */
        buildExample() {
            const style = {
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid lightgray"
            };
            const h = new Header("Header content").style(style);
            const m = new Main("Main content").style("padding", "1rem 0.5rem");
            const f = new Footer("Footer content").style(style);
            this.append(this.markdown(intro$m), this.example([
                new Div(h, m, f).id(cid())
            ], [m]), this.markdown(example$m));
        }
    }

    const intro$l = `
A component that encapsulates the DOM element
%\`<menu>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu%.

**Class:** \`@vanilla-ts/dom/Menu\`
`;
    const example$l = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { ButtonFactory, LiUl, Menu } from "@vanilla-ts/dom";

const bf = new ButtonFactory();

const example = new Menu()
    .addClass("menu-example")
    .append(
        new LiUl(
            bf.buttonRegular("Cut")
                .title("Cut the selected text")
                .on("click", () => console.log("Fake 'Cut text' executed"))
        ),
        new LiUl(
            bf.buttonRegular("Copy")
                .title("Copy the selected text")
                .on("click", () => console.log("Fake 'Copy text' executed"))
        ),
        new LiUl(
            bf.buttonRegular("Paste")
                .title("Paste text from the clipboard")
                .on("click", () => console.log("Fake 'Paste text' executed"))
        )
    );

new VTS_App(document.body).append(example);
\`\`\`
`;
    const exampleCSS = `
### CSS

\`\`\`css
.menu-example {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
    > li {
        > button.regular {
            width: 5rem;
        }
    }
}
\`\`\`
`;
    class MenuEx extends BaseExample {
        constructor() {
            super("Menu");
        }
        /** @inheritdoc */
        buildExample() {
            const bf = new ButtonFactory();
            this.append(this.markdown(intro$l), this.example([
                new Menu()
                    .addClass("menu-example")
                    .append(new LiUl(bf.buttonRegular("Cut")
                    .title("Cut the selected text")
                    .on("click", () => console.log("Fake 'Cut text' executed"))), new LiUl(bf.buttonRegular("Copy")
                    .title("Copy the selected text")
                    .on("click", () => console.log("Fake 'Copy text' executed"))), new LiUl(bf.buttonRegular("Paste")
                    .title("Paste text from the clipboard")
                    .on("click", () => console.log("Fake 'Paste text' executed"))))
            ]), this.markdown(example$l), this.markdown(exampleCSS));
        }
    }

    const intro$k = `
A component that encapsulates the DOM element
%\`<nav>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav%.

**Class:** \`@vanilla-ts/dom/Nav\`
`;
    const example$k = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { A, LiUl, Nav, Ul } from "@vanilla-ts/dom";

const example = new Nav(
    new Ul(
        new LiUl(
            new A("#Introduction", "Introduction"),
        ),
        new LiUl(
            new A("#@core/Introduction", "Core components"),
        ),
        new LiUl(
            new A("#@dom/Introduction", "DOM components"),
        ),
        new LiUl(
            new A("#@components/Introduction", "Advanced components"),
        )
    ).style({
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        listStyle: "none",
        margin: "0",
        padding: "0"
    })
);

new VTS_App(document.body).append(example);
\`\`\`
`;
    class NavEx extends BaseExample {
        constructor() {
            super("Nav");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$k), this.example([
                new Nav(new Ul(new LiUl(new A("#Introduction", "Introduction")), new LiUl(new A("#@core/Introduction", "Core components")), new LiUl(new A("#@dom/Introduction", "DOM components")), new LiUl(new A("#@components/Introduction", "Advanced components"))).style({
                    display: "flex",
                    flexDirection: "row",
                    gap: "1rem",
                    listStyle: "none",
                    margin: "0",
                    padding: "0"
                }))
            ]), this.markdown(example$k));
        }
    }

    const intro$j = `
A component that encapsulates a native number input DOM element
(%\`<input type="number">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number%).
This component is also available as a §@components/LabeledNumberInput§.

**Class:** \`@vanilla-ts/dom/NumberInput\`
`;
    const example$j = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { NumberInput } from "@vanilla-ts/dom";

const example = new NumberInput()
    .value("22")
    .min("2")
    .max("42")
    .step("2");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class NumberInputEx extends BaseExample {
        constructor() {
            super("NumberInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$j), this.example([
                new NumberInput()
                    .value("22")
                    .min("2")
                    .max("44")
                    .step("2")
            ]), this.markdown(example$j));
        }
    }

    const intro$i = `
A component that encapsulates the DOM element
%\`<ol>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol%. The list also supports the
properties \`start\`, \`reversed\` and \`type\`.

**Class:** \`@vanilla-ts/dom/Ol\`
`;
    const example$i = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, LiOl, Ol, P } from "@vanilla-ts/dom";

const example = new Div(
    new P("How to make a muffin:"),
    new Ol(
        // List items can be @vanilla-ts/dom/LiOl components ...
        new LiOl(0, "Relax (optional)."), // An individual number can be set for every list item
        // ... or simply strings ...
        "Mix flour, baking powder, sugar, and salt.",
        "In another bowl, mix eggs, milk, and oil.",
        "Stir both mixtures together.",
        "Fill muffin tray 3/4 full.",
        // ... or any other component, e.g. an @vanilla-ts/dom/Em instance.
        new Em("Bake for 20 minutes.")
    )
);

new VTS_App(document.body).append(example);
\`\`\`
`;
    class OlEx extends BaseExample {
        constructor() {
            super("Ol");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$i), this.example([
                new P("How to make a muffin:"),
                new Ol(new LiOl(0, "Relax (optional)."), "Mix flour, baking powder, sugar, and salt.", "In another bowl, mix eggs, milk, and oil.", "Stir both mixtures together.", "Fill muffin tray 3/4 full.", new Em("Bake for 20 minutes."))
            ]), this.markdown(example$i));
        }
    }

    const intro$h = `
A component that encapsulates the DOM element
%\`<optgroup>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup%.

**Class:** \`@vanilla-ts/dom/OptGroup\`
`;
    const example$h = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { OptGroup } from "@vanilla-ts/dom";

const example = new OptGroup();

new VTS_App(document.body).append(example);
\`\`\`
`;
    class OptGroupEx extends BaseExample {
        constructor() {
            super("OptGroup");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$h), this.example([
                new OptGroup("label")
            ]), this.markdown(example$h));
        }
    }

    const intro$g = `
A component that encapsulates the DOM element
%\`<output>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output%.

**Class:** \`@vanilla-ts/dom/Output\`
`;
    const example$g = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, NumberInput, Output, RangeInput, Text } from "@vanilla-ts/dom";

let ri: RangeInput;
let ni: NumberInput;
let output: Output;

function updateOutput() {
    output.text((ri.ValueAsNumber + ni.ValueAsNumber).toString());
}

const example = new Div(
    ri = new RangeInput()
        .id("range-output")
        .value("32"),
    new Text("+"),
    ni = new NumberInput()
        .id("number-output")
        .min("0")
        .max("1000")
        .value("10"),
    new Text("="),
    output = new Output()
        .for("range-output number-output")
        .style("width", "3rem"),
)
    .on("input", updateOutput)
    .style({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "0.5rem"
    })

new VTS_App(document.body).append(example);

\`\`\`
`;
    class OutputEx extends BaseExample {
        constructor() {
            super("Output");
        }
        /** @inheritdoc */
        buildExample() {
            let ri;
            let ni;
            let output;
            function updateOutput() {
                output.text((ri.ValueAsNumber + ni.ValueAsNumber).toString());
            }
            this.append(this.markdown(intro$g), this.example([
                new Div(ri = new RangeInput()
                    .id("range-output")
                    .value("32"), new Text$1("+"), ni = new NumberInput()
                    .id("number-output")
                    .min("0")
                    .max("1000")
                    .value("10"), new Text$1("="), output = new Output()
                    .for("range-output number-output")
                    .style("width", "3rem"))
                    .on("input", updateOutput)
                    .style({
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0.5rem"
                })
            ]), this.markdown(example$g));
            updateOutput();
        }
    }

    const intro$f = `
A component that encapsulates a native password input DOM element
(%\`<input type="password">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password%).
This component is also available as a §@components/LabeledPasswordInput§.

**Class:** \`@vanilla-ts/dom/PasswordInput\`
`;
    const example$f = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { PasswordInput } from "@vanilla-ts/dom";

const example = new PasswordInput().placeholder("Enter password");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class PasswordInputEx extends BaseExample {
        constructor() {
            super("PasswordInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$f), this.example([
                new PasswordInput().placeholder("Enter password")
            ]), this.markdown(example$f));
        }
    }

    const intro$e = `
A component that encapsulates the DOM element
%\`<p>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p%. This component is
also available as a §@components/LabeledParagraph§.

**Class:** \`@vanilla-ts/dom/P\`
`;
    const example$e = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { B, Em, I, P, Strong } from "@vanilla-ts/dom";

// Create some phrasing content for the paragraph
const b = new B(" ipsum");
const e = new Em(" dolor");
const s = new Strong(" sit");
const i = new I(" amet");

const example = new P("Lorem ", b, e, s, i, ".");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class PEx extends BaseExample {
        constructor() {
            super("P");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$e), this.example([
                new P("Lorem", new B(" ipsum"), new Em(" dolor"), new Strong(" sit"), new I(" amet"), "."),
            ]), this.markdown(example$e));
        }
    }

    const intro$d = `
A component that encapsulates the DOM element
%\`<pre>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre%.

**Class:** \`@vanilla-ts/dom/Pre\`
`;
    const example$d = `
### Code example

\`\`\`text
import { VTS_App } from "@vanilla-ts/core";
import { Code, Pre } from "@vanilla-ts/dom";

const cow = new Code(\`
^__^
(oo)\________
(__)\ufe68       )\ufe68/\ufe68
    ||----w||
    ||     ||
\`);

const example = new Pre(cow);

new VTS_App(document.body).append(example);
\`\`\`
`;
    class PreEx extends BaseExample {
        constructor() {
            super("Pre");
        }
        /** @inheritdoc */
        buildExample() {
            const cow = new Code(`
^__^
(oo)\ufe68________
(__)\ufe68       )\ufe68/\ufe68
    ||----w||
    ||     ||
`);
            this.append(this.markdown(intro$d), this.example([
                new Pre(cow)
            ], [cow]), this.markdown(example$d));
        }
    }

    const intro$c = `
A component that encapsulates the DOM element
%\`<progress>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress%.
This component is also available as a §@components/LabeledProgress§.

**Class:** \`@vanilla-ts/dom/Progress\`
`;
    const example$c = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Progress } from "@vanilla-ts/dom";

// Set \`value\` after setting \`max\`, otherwise it may have
// no effect if \`value\` is greater than the current \`max\`.
const example = new Progress().max(100).value(70);

// Initializes the component with an 'indeterminate' state.
// const example = new Progress().indeterminate(true);

new VTS_App(document.body).append(example);
\`\`\`

For easier handling, the progress component emits its own event \`ProgressValueEvent\`; see the
corresponding documentation in the \`Progress\` class.
`;
    class ProgressEx extends BaseExample {
        constructor() {
            super("Progress");
        }
        /** @inheritdoc */
        buildExample() {
            let progress;
            let valueInput;
            this.append(this.markdown(intro$c), this.example([
                progress = new Progress().max(100).value(70)
            ]), this.markdown("### Configuration"), this.properties($.labeledCheckbox("Vertical orientation", undefined, "orientation")
                .on("checked", (ev) => {
                progress.orientation(ev.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL);
            }), $.labeledNumberInput("Maximum value:", undefined, "100", "", "1", "100")
                .numberInput((ni) => ni.on("input", () => {
                progress.max(ni.ValueAsNumber);
                valueInput.NumberInput.max(ni.Value);
            })), valueInput = $.labeledNumberInput("Current value:", undefined, progress.Value.toString(), "", "0", "100")
                .numberInput((ni) => ni.on("input", () => {
                progress.value(ni.ValueAsNumber === 0 ? undefined : ni.ValueAsNumber);
            })), new P("Note: a current value of ", new Code("0"), " will set the progress component to an 'indeterminate' state.")
                .style({
                marginBlock: "0.5rem 0"
            })), this.markdown(example$c));
        }
    }

    const intro$b = `
A component that encapsulates a native radio button DOM element
(%\`<input type="radio">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio%).
This component is also available as a §@components/LabeledRadioButton§.

**Class:** \`@vanilla-ts/dom/RadioButton\`
`;
    const example$b = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { RadioButton } from "@vanilla-ts/dom";

const example = new RadioButton();

new VTS_App(document.body).append(example);
// The following code line would allow toggling the checked state. Toggling can be
// done by clicking or by pressing the space or enter key on a focused radio button.
// example.toggle(true);
\`\`\`

For easier handling, the radio button component emits its own event \`CheckedEvent\`; see the
corresponding documentation in the \`RadioButton\` class.
`;
    class RadioButtonEx extends BaseExample {
        #rb;
        #rbgCb;
        constructor() {
            super("RadioButton");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$b), this.example([this.#rb = new RadioButton().on("checked", () => this.#rbgCb.value(this.#rb.Checked ? "checked" : "unchecked"))]), this.markdown("### Radio button states"), new Div().addClass("example-properties")
                .append(this.#rbgCb = $.radioButtonGroup([
                { Label: "Checked", Value: "checked" },
                { Label: "Unchecked", Value: "unchecked" },
            ], "rbg-labeled-radio-button-ex")
                .value("unchecked")
                .on("checked", (ev) => {
                switch (ev.$.Sender.Value) {
                    case "checked":
                        this.#rb.checked(true);
                        break;
                    case "unchecked":
                        this.#rb.checked(false);
                        break;
                }
            }), $.labeledCheckbox("Allow toggling the state")
                .on("checked", () => this.#rb.toggle(!this.#rb.Toggle))), this.markdown(example$b));
        }
    }

    const intro$a = `
A component that encapsulates a native DOM input range element
(%\`<input type="range">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range%).
This component is also available as a §@components/LabeledRangeInput§.

**Class:** \`@vanilla-ts/dom/RangeInput\`
`;
    const example$a = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { RangeInput } from "@vanilla-ts/dom";

const example = new RangeInput()
    .max("100")
    .min("0")
    .step("0.1")
    .valueAsNumber(42);

new VTS_App(document.body).append(example);
\`\`\`
`;
    class RangeInputEx extends BaseExample {
        constructor() {
            super("RangeInput");
        }
        /** @inheritdoc */
        buildExample() {
            let rangeInput;
            let maxInput;
            let minInput;
            let val;
            this.append(this.markdown(intro$a), this.example([
                rangeInput = new RangeInput()
                    .max("100")
                    .min("0")
                    .step("0.1")
                    .valueAsNumber(42)
                    .on("input", () => val.text(rangeInput.Value))
            ]), this.markdown("### Configuration"), this.properties($.labeledCheckbox("Vertical orientation", undefined, "orientation")
                .on("checked", (ev) => {
                rangeInput.orientation(ev.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL);
            }), maxInput = $.labeledNumberInput("Maximum value:", undefined, "100", "", "1", "100")
                .numberInput((ni) => ni.on("input", () => {
                rangeInput.max(ni.Value);
                minInput.Component.max(ni.Value);
                val.text(rangeInput.Value);
            })), minInput = $.labeledNumberInput("Minimum value:", undefined, "0", "", "0", "100")
                .numberInput((ni) => ni.on("input", () => {
                rangeInput.min(ni.Value);
                maxInput.Component.min(ni.Value);
                val.text(rangeInput.Value);
            })), new P("Current value: ", val = new Code("42"))
                .style({
                marginBlock: "0.5rem 0"
            })), this.markdown(example$a));
        }
    }

    const intro$9 = `
A component that encapsulates a native search input DOM element
(%\`<input type="search">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/search%).
This component is also available as a §@components/LabeledSearchInput§.

**Class:** \`@vanilla-ts/dom/SearchInput\`
`;
    const example$9 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { SearchInput } from "@vanilla-ts/dom";

const example = new SearchInput().placeholder("Enter search term...");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class SearchInputEx extends BaseExample {
        constructor() {
            super("SearchInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$9), this.example([
                new SearchInput().placeholder("Enter search term...")
            ]), this.markdown(example$9));
        }
    }

    const intro$8 = `
A component that encapsulates the DOM element
%\`<section>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section%.

**Class:** \`@vanilla-ts/dom/Section\`
`;
    const example$8 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Code, Div, H1, H2, P, Section } from "@vanilla-ts/dom";

const example = new Div(
    new H1("Choosing an Apple*"),
    new Section(
        new H2("Introduction"),
        new P(
            "This document provides a guide to help with ..."
        ),
    ),
    new Section(
        new H2("Criteria"),
        new P(
            "There are many different criteria to be considered ..."
        ),
    ),
    new P(
        "* Example text taken from the MDN article on ",
        new Code("<section>"),
        " linked to above."
    )
        .addClass("sz-smaller")
)

new VTS_App(document.body).append(example);
\`\`\`
`;
    class SectionEx extends BaseExample {
        constructor() {
            super("Section");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$8), this.example([
                new H1("Choosing an Apple*"),
                new Section(new H2("Introduction"), new P("This document provides a guide to help with the important task of choosing the correct Apple.")),
                new Section(new H2("Criteria"), new P("There are many different criteria to be considered when choosing an Apple — "
                    + "size, color, firmness, sweetness, tartness...")),
                new P("* Example text taken from the MDN article on ", new Code("<section>"), " linked to above.").addClass("sz-smaller"),
            ]), this.markdown(example$8));
        }
    }

    const intro$7 = `
A component that encapsulates a native DOM select element
(%\`<select>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select%).
This component is also available as a §@components/LabeledSelect§.

**Class:** \`@vanilla-ts/dom/Select\`
`;
    const example$7 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Em, ISelectValues, P, Select } from "@vanilla-ts/dom";

const selectValues: ISelectValues[] = [
    { Text: "Apple", Value: "apple" },
    { Text: "Banana", Value: "banana" },
    { Text: "Cherry", Value: "cherry" },
    { Text: "Dragonfruit", Value: "dragonfruit" },
    { Text: "Eggplant", Value: "eggplant" }
];

const example = new Select(selectValues)
    .value("cherry")
    .style("width", "8rem")
    .on("change", () => log.phrase("Selected fruit (value): ", new Em(example.Value)));

const log = new P("Select a fruit from the dropdown above.")
    .style({
        width: "20rem",
        marginBlockStart: "1rem"
    });

new VTS_App(document.body).append(example, log);
\`\`\`
`;
    class SelectEx extends BaseExample {
        constructor() {
            super("Select");
        }
        /** @inheritdoc */
        buildExample() {
            const selectValues = [
                { Text: "Apple", Value: "apple" },
                { Text: "Banana", Value: "banana" },
                { Text: "Cherry", Value: "cherry" },
                { Text: "Dragonfruit", Value: "dragonfruit" },
                { Text: "Eggplant", Value: "eggplant" }
            ];
            const log = new P("Select a fruit from the dropdown above.").style({ width: "20rem", marginBlockStart: "1rem" });
            const select = new Select(selectValues)
                .value("cherry")
                .style("width", "10rem")
                .on("change", () => log.phrase("Selected fruit (value): ", new Em(select.Value)));
            this.append(this.markdown(intro$7), this.example([
                select,
                log
            ]), this.markdown(example$7));
        }
    }

    const intro$6 = `
A component that encapsulates the DOM element
%\`<span>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span%.

**Class:** \`@vanilla-ts/dom/Span\`
`;
    const example$6 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { P, Span } from "@vanilla-ts/dom";

const span = new Span("dolor").style("textDecoration", "underline");

const example = new P("Lorem ipsum ", span, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class SpanEx extends BaseExample {
        constructor() {
            super("Span");
        }
        /** @inheritdoc */
        buildExample() {
            let span = new Span("dolor").style("textDecoration", "underline");
            this.append(this.markdown(intro$6), this.example([
                new P("Lorem ipsum ", span, " sit amet."),
            ], [span]), this.markdown(example$6));
        }
    }

    const intro$5 = `
A component that encapsulates the DOM element
%\`<strong>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong%.

**Class:** \`@vanilla-ts/dom/Strong\`
`;
    const example$5 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { P, Strong } from "@vanilla-ts/dom";

const strong = new Strong("dolor");

const example = new P("Lorem ipsum ", strong, " sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class StrongEx extends BaseExample {
        constructor() {
            super("Strong");
        }
        /** @inheritdoc */
        buildExample() {
            const strong = new Strong("dolor");
            this.append(this.markdown(intro$5), this.example([
                new P("Lorem ipsum ", strong, " sit amet.")
            ], [strong]), this.markdown(example$5));
        }
    }

    const intro$4 = `
A component that encapsulates various native date/time related DOM input elements:

- %\`<input type="date">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date%
- %\`<input type="datetime-local">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local%
- %\`<input type="time">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time%
- %\`<input type="month">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month%
- %\`<input type="week">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week%

Please note that the availability of these input types may vary across different browser engines and
platforms. For example, the \`<input type="week">\` is not supported in the desktop versions of
Safari and Firefox. The look and feel of the pickers (if available at all) is also different across
browsers and platforms.

This component is also available as a §@components/LabeledTemporalInput§.

**Class:** \`@vanilla-ts/dom/TemporalInput\`
`;
    const example$4 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Code, Div, TemporalInput, TemporalType } from "@vanilla-ts/dom";

function getTemporalInput(type: TemporalType): Div {
    let typeName: string;
    let tt: TemporalType;
    switch (type) {
        case TemporalType.DateTimeSeconds:
            typeName = "DateTimeSeconds";
            tt = TemporalType.DateTimeSeconds;
            break;
        case TemporalType.DateTime:
            typeName = "DateTime";
            tt = TemporalType.DateTime;
            break;
        case TemporalType.TimeSeconds:
            typeName = "TimeSeconds";
            tt = TemporalType.TimeSeconds;
            break;
        case TemporalType.Time:
            typeName = "Time";
            tt = TemporalType.Time;
            break;
        case TemporalType.Month:
            typeName = "Month";
            tt = TemporalType.Month;
            break;
        case TemporalType.Week:
            typeName = "Week";
            tt = TemporalType.Week;
            break;
        default:
            typeName = "Date";
            tt = TemporalType.Date;
            break;
    }
    return new Div(
        // The CSS for \`.temporal-input-type\` could be something like
        // \`display: inline-block; width: 20rem;\`
        new Code("TemporalType." + typeName).addClass("temporal-input-type"),
        new TemporalInput(tt)
    );
}

const example = new Div(
    ...[
        TemporalType.DateTimeSeconds, TemporalType.DateTime,
        TemporalType.Date, TemporalType.TimeSeconds,
        TemporalType.Time, TemporalType.Month, TemporalType.Week
    ].map((e) => this.getTemporalInput(e))
)
    .style({ display: "flex", flexDirection: "column", gap: "0.5rem" });

new VTS_App(document.body).append(example);
\`\`\`
`;
    class TemporalInputEx extends BaseExample {
        constructor() {
            super("TemporalInput");
        }
        getTemporalInput(type) {
            let typeName;
            let tt;
            switch (type) {
                case TemporalType.DateTimeSeconds:
                    typeName = "DateTimeSeconds";
                    tt = TemporalType.DateTimeSeconds;
                    break;
                case TemporalType.DateTime:
                    typeName = "DateTime";
                    tt = TemporalType.DateTime;
                    break;
                case TemporalType.TimeSeconds:
                    typeName = "TimeSeconds";
                    tt = TemporalType.TimeSeconds;
                    break;
                case TemporalType.Time:
                    typeName = "Time";
                    tt = TemporalType.Time;
                    break;
                case TemporalType.Month:
                    typeName = "Month";
                    tt = TemporalType.Month;
                    break;
                case TemporalType.Week:
                    typeName = "Week";
                    tt = TemporalType.Week;
                    break;
                default:
                    typeName = "Date";
                    tt = TemporalType.Date;
                    break;
            }
            return new Div(new Code("TemporalType." + typeName).addClass("temporal-input-type"), new TemporalInput(tt));
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$4), this.example([
                TemporalType.DateTimeSeconds, TemporalType.DateTime, TemporalType.Date,
                TemporalType.TimeSeconds, TemporalType.Time, TemporalType.Month,
                TemporalType.Week
            ].map((e) => this.getTemporalInput(e))), this.markdown(example$4));
        }
    }

    const intro$3 = `
A component that encapsulates the DOM element
%\`<textarea>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea%. Instances of
the \`TextArea\` component are resizeable in both directions by default; in the example below, the
component is intentionally resizeable only horizontally. This component is also available as a
§@components/LabeledTextArea§.

**Class:** \`@vanilla-ts/dom/TextArea\`
`;
    const example$3 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { TextArea } from "@vanilla-ts/dom";

const example = new TextArea(
    "Lorem ipsum ut wisi enim ad minim veniam ...",
    10,
    50
)
    .resizable("horizontal");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class TextAreaEx extends BaseExample {
        constructor() {
            super("TextArea");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$3), this.example([
                new TextArea("Lorem ipsum ut wisi enim ad minim veniam, quis nostrud exerci ullamcorper suscipit ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis et blandit augue duis dolore te feugait nulla facilisi.", 10, 50).resizable("horizontal")
            ]), this.markdown(example$3));
        }
    }

    const intro$2 = `
A component that encapsulates a
%\`DOM Text node\`|https://developer.mozilla.org/en-US/docs/Web/API/Text%.

**Class:** \`@vanilla-ts/dom/Text\`
`;
    const example$2 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { P, Text } from "@vanilla-ts/dom";

let c = 0;

const t = new Text(c.toString());

const example = new P("Counter called ", t, " times.");

setInterval(() => t.text((++c).toString()), 1000);

new VTS_App(document.body).append(example);
\`\`\`

If you inspect the paragraph inside the example above with the browsers development tools, you will
see that it consists of three text nodes and that only the middle one is updated every second.
`;
    class TextEx extends BaseExample {
        #c = 0;
        #t;
        #interval;
        constructor() {
            super("Text");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$2), this.example([
                new P("Counter called ", this.#t = new Text$1(this.#c.toString()), " times."),
            ]), this.markdown("### Example usage"), new Div().addClass("example-properties")
                .append($.labeledCheckbox("Counter active", "lcb-text-ex")
                .on("checked", ((ev) => {
                ev.$.Checked
                    ? this.#interval = setInterval(() => this.#t.text((++this.#c).toString()), 1000)
                    : clearInterval(this.#interval);
            }))), this.markdown(example$2));
        }
    }

    const intro$1 = `
A component that encapsulates a native text input DOM element
(%\`<input type="text">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text%).
This component is also available as a §@components/LabeledTextInput§.

**Class:** \`@vanilla-ts/dom/TextInput\`
`;
    const example$1 = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { TextInput } from "@vanilla-ts/dom";

const example = new TextInput().placeholder("Enter some text here");

new VTS_App(document.body).append(example);
\`\`\`
`;
    class TextInputEx extends BaseExample {
        constructor() {
            super("TextInput");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro$1), this.example([
                new TextInput().placeholder("Enter some text here")
            ]), this.markdown(example$1));
        }
    }

    const intro = `
A component that encapsulates the DOM element
%\`<ul>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul%.

**Class:** \`@vanilla-ts/dom/Ul\`
`;
    const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, LiUl, P, Ul } from "@vanilla-ts/dom";

const example = new Div(
    new P("Shopping List:"),
    new Ul(
        // List items can be strings ...
        "Flour",
        "Baking powder",
        "Sugar",
        "Salt",
        "Oil",
        // ... or @vanilla-ts/dom/LiUl components ...
        new LiUl(
            "From the cooling shelf:",
            // ... or simply any other component, e.g. another @vanilla-ts/dom/Ul instance.
            new Ul(
                new LiUl("Eggs"),
                new LiUl("Milk")
            )
        )
    )
);

new VTS_App(document.body).append(example);
\`\`\`
`;
    class UlEx extends BaseExample {
        constructor() {
            super("Ul");
        }
        /** @inheritdoc */
        buildExample() {
            this.append(this.markdown(intro), this.example([
                new P("Shopping List:"),
                new Ul("Flour", "Baking powder", "Sugar", "Salt", "Oil", new LiUl("From the cooling shelf:", new Ul(new LiUl("Eggs"), new LiUl("Milk")))),
            ]), this.markdown(example));
        }
    }

    class IntroductionEx extends BaseExample {
        constructor() {
            super();
        }
        /** @inheritdoc */
        buildExample() {
            this
                .addClass("ex-introduction")
                .append(this.markdown("This showcase application..."));
        }
    }

    /** All navigation targets. */
    const NAVIGATION_TARGETS = [
        // Introduction
        "#Introduction",
        // Core
        "#@core/Introduction",
        "#@core/ElementComponentVoid",
        "#@core/ElementComponentWithChildren",
        "#@core/EventBus",
        "#@core/Component factories",
        // DOM
        "#@dom/Introduction",
        "#@dom/A",
        "#@dom/Address",
        "#@dom/B",
        "#@dom/Br",
        "#@dom/Button",
        "#@dom/Canvas",
        "#@dom/Checkbox / Switch",
        "#@dom/Code",
        "#@dom/Comment",
        "#@dom/Dialog",
        "#@dom/Div",
        "#@dom/Em",
        "#@dom/EmailInput",
        "#@dom/Footer",
        "#@dom/Fragment",
        "#@dom/Header",
        "#@dom/Hr",
        "#@dom/H1 to H6",
        "#@dom/I",
        "#@dom/Img",
        "#@dom/Input",
        "#@dom/Label",
        "#@dom/LiOl / LiUl",
        "#@dom/Main",
        "#@dom/Menu",
        "#@dom/Nav",
        "#@dom/NumberInput",
        "#@dom/Ol",
        "#@dom/OptGroup",
        "#@dom/Output",
        "#@dom/P",
        "#@dom/PasswordInput",
        "#@dom/Pre",
        "#@dom/Progress",
        "#@dom/RadioButton",
        "#@dom/RangeInput",
        "#@dom/SearchInput",
        "#@dom/Section",
        "#@dom/Select",
        "#@dom/Span",
        "#@dom/Strong",
        "#@dom/TemporalInput",
        "#@dom/Text",
        "#@dom/TextArea",
        "#@dom/TextInput",
        "#@dom/Ul",
        // Components
        "#@components/Introduction",
        "#@components/BusyOverlay",
        "#@components/Dialog",
        "#@components/DisclosureContainer",
        "#@components/IconButton",
        "#@components/LabeledAnchor",
        "#@components/LabeledCheckbox / -Switch",
        "#@components/LabeledContainer",
        "#@components/LabeledEmailInput",
        "#@components/LabeledNumberInput",
        "#@components/LabeledParagraph",
        "#@components/LabeledPasswordInput",
        "#@components/LabeledProgress",
        "#@components/LabeledRadioButton",
        "#@components/LabeledRadioButtonGroup",
        "#@components/LabeledRangeInput",
        "#@components/LabeledSearchInput",
        "#@components/LabeledSelect",
        "#@components/LabeledTemporalInput",
        "#@components/LabeledTextArea",
        "#@components/LabeledTextInput",
        "#@components/Menu",
        "#@components/PinchZoomGestureHandler",
        "#@components/RadioButtonGroup",
        "#@components/ScrollContainer",
        "#@components/Splitter",
        "#@components/StdDialog",
        "#@components/Stepper",
        "#@components/TabGroup",
        "#@components/Throbber",
        "#@components/Viewer"
    ];
    /** A map containing component instances that can issue a navigation to a target. */
    const NAVIGATION_ISSUER_COMPONENTS = new Map();
    /** All example renderers. */
    // Introduction
    let introductionEx;
    // Core
    let coreIntroductionEx;
    let elementComponentVoidEx;
    let elementComponentWithChildrenEx;
    let eventBusEx;
    let componentFactoriesEx;
    // DOM
    let domIntroductionEx;
    let aEx;
    let addressEx;
    let bEx;
    let brEx;
    let buttonEx;
    let canvasEx;
    let checkboxEx;
    let commentEx;
    let codeEx;
    let dialogEx;
    let divEx;
    let emEx;
    let emailInputEx;
    let footerEx;
    let fragmentEx;
    let headerEx;
    let hrEx;
    let hxEx;
    let iEx;
    let inputEx;
    let imgEx;
    let labelEx;
    let liOlUlEx;
    let mainEx;
    let menuEx;
    let navEx;
    let numberInputEx;
    let olEx;
    let optGroupEx;
    let outputEx;
    let pEx;
    let passwordInputEx;
    let preEx;
    let progressEx;
    let radioButtonEx;
    let rangeInputEx;
    let searchInputEx;
    let sectionEx;
    let selectEx;
    let spanEx;
    let strongEx;
    let temporalInputEx;
    let textEx;
    let textAreaEx;
    let textInputEx;
    let ulEx;
    // Components
    let componentsIntroductionEx;
    let busyOverlayEx;
    let iconButtonEx;
    let disclosureContainerEx;
    let labeledAnchorEx;
    let labeledCheckboxEx;
    let labeledContainerEx;
    let labeledEmailInputEx;
    let labeledNumberInputEx;
    let labeledParagraphEx;
    let labeledPasswordInputEx;
    let labeledRadioButtonEx;
    let labeledRadioButtonGroupEx;
    let labeledSearchInputEx;
    let labeledSelectEx;
    let labeledTextInputEx;
    let radioButtonGroupEx;
    /** Previous sender of a `NavigateTo` event. */
    let prevSenderOfNavigateTo = undefined;
    /**
     * Navigate to an example.
     */
    function navigateTo(target, sender, focus) {
        // console.log(target, sender);
        console.time();
        prevSenderOfNavigateTo?.removeClass("selected");
        prevSenderOfNavigateTo = sender;
        focus
            ? focus.focus().addClass("selected")
            : NAVIGATION_ISSUER_COMPONENTS.get(target)?.focus().addClass("selected");
        let example;
        switch (target) {
            // Introduction
            case "#Introduction":
                example = introductionEx ??= new IntroductionEx();
                break;
            // Core
            case "#@core/Introduction":
                example = coreIntroductionEx ??= new CoreIntroductionEx();
                break;
            case "#@core/ElementComponentVoid":
                example = elementComponentVoidEx ??= new ElementComponentVoidEx();
                break;
            case "#@core/ElementComponentWithChildren":
                example = elementComponentWithChildrenEx ??= new ElementComponentWithChildrenEx();
                break;
            case "#@core/EventBus":
                example = eventBusEx ??= new EventBusEx();
                break;
            case "#@core/Component factories":
                example = componentFactoriesEx ??= new ComponentFactoriesEx();
                break;
            // DOM
            case "#@dom/Introduction":
                example = domIntroductionEx ??= new DOMIntroductionEx();
                break;
            case "#@dom/A":
                example = aEx ??= new AEx();
                break;
            case "#@dom/Address":
                example = addressEx ??= new AddressEx();
                break;
            case "#@dom/B":
                example = bEx ??= new BEx();
                break;
            case "#@dom/Br":
                example = brEx ??= new BrEx();
                break;
            case "#@dom/Button":
                example = buttonEx ??= new ButtonEx();
                break;
            case "#@dom/Canvas":
                example = canvasEx ??= new CanvasEx();
                break;
            case "#@dom/Checkbox / Switch":
                example = checkboxEx ??= new CheckboxEx();
                break;
            case "#@dom/Code":
                example = codeEx ??= new CodeEx();
                break;
            case "#@dom/Comment":
                example = commentEx ??= new CommentEx();
                break;
            case "#@dom/Dialog":
                example = dialogEx ??= new DialogEx();
                break;
            case "#@dom/Div":
                example = divEx ??= new DivEx();
                break;
            case "#@dom/Em":
                example = emEx ??= new EmEx();
                break;
            case "#@dom/EmailInput":
                example = emailInputEx ??= new EmailInputEx();
                break;
            case "#@dom/Footer":
                example = footerEx ??= new FooterEx();
                break;
            case "#@dom/Fragment":
                example = fragmentEx ??= new FragmentEx();
                break;
            case "#@dom/Header":
                example = headerEx ??= new HeaderEx();
                break;
            case "#@dom/Hr":
                example = hrEx ??= new HrEx();
                break;
            case "#@dom/H1 to H6":
                example = hxEx ??= new HxEx();
                break;
            case "#@dom/I":
                example = iEx ??= new IEx();
                break;
            case "#@dom/Input":
                example = inputEx ??= new InputEx();
                break;
            case "#@dom/Img":
                example = imgEx ??= new ImgEx();
                break;
            case "#@dom/Label":
                example = labelEx ??= new LabelEx();
                break;
            case "#@dom/LiOl / LiUl":
                example = liOlUlEx ??= new LiOlUlEx();
                break;
            case "#@dom/Main":
                example = mainEx ??= new MainEx();
                break;
            case "#@dom/Menu":
                example = menuEx ??= new MenuEx();
                break;
            case "#@dom/Nav":
                example = navEx ??= new NavEx();
                break;
            case "#@dom/NumberInput":
                example = numberInputEx ??= new NumberInputEx();
                break;
            case "#@dom/Ol":
                example = olEx ??= new OlEx();
                break;
            case "#@dom/OptGroup":
                example = optGroupEx ??= new OptGroupEx();
                break;
            case "#@dom/Output":
                example = outputEx ??= new OutputEx();
                break;
            case "#@dom/P":
                example = pEx ??= new PEx();
                break;
            case "#@dom/PasswordInput":
                example = passwordInputEx ??= new PasswordInputEx();
                break;
            case "#@dom/Pre":
                example = preEx ??= new PreEx();
                break;
            case "#@dom/Progress":
                example = progressEx ??= new ProgressEx();
                break;
            case "#@dom/RadioButton":
                example = radioButtonEx ??= new RadioButtonEx();
                break;
            case "#@dom/RangeInput":
                example = rangeInputEx ??= new RangeInputEx();
                break;
            case "#@dom/SearchInput":
                example = searchInputEx ??= new SearchInputEx();
                break;
            case "#@dom/Section":
                example = sectionEx ??= new SectionEx();
                break;
            case "#@dom/Select":
                example = selectEx ??= new SelectEx();
                break;
            case "#@dom/Span":
                example = spanEx ??= new SpanEx();
                break;
            case "#@dom/Strong":
                example = strongEx ??= new StrongEx();
                break;
            case "#@dom/TemporalInput":
                example = temporalInputEx ??= new TemporalInputEx();
                break;
            case "#@dom/Text":
                example = textEx ??= new TextEx();
                break;
            case "#@dom/TextArea":
                example = textAreaEx ??= new TextAreaEx();
                break;
            case "#@dom/TextInput":
                example = textInputEx ??= new TextInputEx();
                break;
            case "#@dom/Ul":
                example = ulEx ??= new UlEx();
                break;
            // Components
            case "#@components/Introduction":
                example = componentsIntroductionEx ??= new ComponentsIntroductionEx();
                break;
            case "#@components/BusyOverlay":
                example = busyOverlayEx ??= new BusyOverlayEx();
                break;
            case "#@components/Dialog":
                break;
            case "#@components/DisclosureContainer":
                example = disclosureContainerEx ??= new DisclosureContainerEx();
                break;
            case "#@components/IconButton":
                example = iconButtonEx ??= new IconButtonEx();
                break;
            case "#@components/LabeledAnchor":
                example = labeledAnchorEx ??= new LabeledAnchorEx();
                break;
            case "#@components/LabeledCheckbox / -Switch":
                example = labeledCheckboxEx ??= new LabeledCheckboxEx();
                break;
            case "#@components/LabeledContainer":
                example = labeledContainerEx ??= new LabeledContainerEx();
                break;
            case "#@components/LabeledEmailInput":
                example = labeledEmailInputEx ??= new LabeledEmailInputEx();
                break;
            case "#@components/LabeledNumberInput":
                example = labeledNumberInputEx ??= new LabeledNumberInputEx();
                break;
            case "#@components/LabeledParagraph":
                example = labeledParagraphEx ??= new LabeledParagraphEx();
                break;
            case "#@components/LabeledPasswordInput":
                example = labeledPasswordInputEx ??= new LabeledPasswordInputEx();
                break;
            case "#@components/LabeledProgress":
                break;
            case "#@components/LabeledRadioButton":
                example = labeledRadioButtonEx ??= new LabeledRadioButtonEx();
                break;
            case "#@components/LabeledRadioButtonGroup":
                example = labeledRadioButtonGroupEx ??= new LabeledRadioButtonGroupEx();
                break;
            case "#@components/LabeledRangeInput":
                break;
            case "#@components/LabeledSearchInput":
                example = labeledSearchInputEx ??= new LabeledSearchInputEx();
                break;
            case "#@components/LabeledSelect":
                example = labeledSelectEx ??= new LabeledSelectEx();
                break;
            case "#@components/LabeledTemporalInput":
                break;
            case "#@components/LabeledTextArea":
                break;
            case "#@components/LabeledTextInput":
                example = labeledTextInputEx ??= new LabeledTextInputEx();
                break;
            case "#@components/Menu":
                break;
            case "#@components/PinchZoomGestureHandler":
                break;
            case "#@components/RadioButtonGroup":
                example = radioButtonGroupEx ??= new RadioButtonGroupEx();
                break;
            case "#@components/ScrollContainer":
                break;
            case "#@components/Splitter":
                break;
            case "#@components/StdDialog":
                break;
            case "#@components/Stepper":
                break;
            case "#@components/TabGroup":
                break;
            case "#@components/Throbber":
                break;
            case "#@components/Viewer":
                break;
            default:
                console.timeEnd();
                return;
        }
        APP.ExampleContainer.Children[0] !== example && APP.ExampleContainer // Variant 1 (see `App.ts`)
            // $.ExampleContainer.Children[0] !== example && $.ExampleContainer // Variant 2 (see `App.ts`)
            .remove()
            .append(example);
        document.location.hash = target;
        console.timeEnd();
    }

    /**
     * Label for an example.
     */
    class ExampleSelectorLabel extends AElementComponentWithInternalUI {
        #label;
        #eventMessage;
        constructor(label, eventMessage) {
            super();
            this.#label = label;
            this.#eventMessage = eventMessage;
            this.initialize();
        }
        get Label() {
            return this.#label;
        }
        get EventMessage() {
            return this.#eventMessage;
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = new P(this.#label)
                .addClass("example-selector-label")
                .tabbable(true)
                .on("pointerdown", (ev) => ev.preventDefault())
                .on("click", (ev) => {
                ev.preventDefault();
                this.focus();
            })
                .on("focus", (_ev) => document.location.hash = this.#eventMessage);
            // Register this component in the navigation map for the respective target.
            NAVIGATION_ISSUER_COMPONENTS.set(this.#eventMessage, this);
            return this;
        }
    }

    /**
     * Container for selecting an example category depending on the corresponding project.
     */
    class ExampleCategory extends AElementComponentWithInternalUI {
        constructor(title) {
            super();
            this.initialize(undefined, title);
        }
        /**
         * Get all labels in this category.
         */
        get Labels() {
            return [...this.ui.ElementChildren];
        }
        /**
         * Append a label to this category.
         */
        appendLabel(label, eventMessage) {
            this.ui.append(new ExampleSelectorLabel(label, eventMessage));
            return this;
        }
        disclosed(disclosed) {
            this.ui.disclosed(disclosed);
            return this;
        }
        /** @inheritdoc */
        buildUI(title) {
            this.ui = $.disclosureContainer(title)
                .addClass("example-category")
                .appearance(DisclosureContainerAppearance.TOP_END)
                .animatable(true);
            this.ui.Header.on("pointerup", (_ev) => this.ui.toggleDisclosed());
            return this;
        }
    }

    /**
     * Container for all example categories.
     */
    class ExampleCategories extends AElementComponentWithInternalUI {
        #introduction;
        #core_examples;
        #dom_examples;
        #components_examples;
        constructor() {
            super();
            this.initialize()
                .#appendLabels();
        }
        /**
         * Get all example categories.
         */
        get Categories() {
            // return [this.#introduction, this.#core_examples, this.#dom_examples, this.#components_examples];
            return [this.#core_examples, this.#dom_examples, this.#components_examples];
        }
        /**
         * Append all labels to all categories.
         */
        #appendLabels() {
            for (const target of NAVIGATION_TARGETS) {
                if (target.startsWith("#@core/")) {
                    this.#core_examples.appendLabel(target.substring(7), target);
                }
                else if (target.startsWith("#@dom/")) {
                    this.#dom_examples.appendLabel(target.substring(6), target);
                }
                else if (target.startsWith("#@components/")) {
                    this.#components_examples.appendLabel(target.substring(13), target);
                }
                else if (target === "#Introduction") {
                    // this.#introduction.appendLabel(<NAVIGATION_TARGET>target.substring(1), target);
                    // this.#introduction.appendLabel(<NAVIGATION_TARGET>"Introduction", target);
                    this.#introduction.append(new ExampleSelectorLabel("Introduction", target));
                }
            }
            return this;
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = $.scrollContainer()
                .addClass("example-categories")
                .append(
            // this.#introduction = new ExampleCategory("Introduction"),
            this.#introduction = new Div().addClass("example-category"), this.#core_examples = new ExampleCategory("@Core"), this.#dom_examples = new ExampleCategory("@DOM"), //.disclosed(false),
            this.#components_examples = new ExampleCategory("@Components"));
            return this;
        }
    }

    /**
     * Container for an example.
     */
    class ExampleContainer extends AElementComponentWithInternalUI {
        constructor() {
            super();
            this.initialize();
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = new Div()
                .addClass("example-container");
            // Set target DOM for the `IChildren` mixin!!
            this.setChildrenDOMTarget(this.ui.DOM);
            return this;
        }
        static {
            /** Mixin the IChildren implementation (which targets `this.ui`). */
            mixin(false, this, AChildren);
        }
    }

    /**
     * Create the main section of the app.
     */
    class AppMain extends AElementComponentWithInternalUI {
        #exampleCategories;
        #exampleContainer;
        constructor() {
            super();
            this.initialize();
        }
        get ExampleCategories() {
            return this.#exampleCategories;
        }
        get ExampleContainer() {
            return this.#exampleContainer;
        }
        /** @inheritdoc */
        buildUI() {
            this.ui = new Main()
                .addClass("app-main")
                .append($.splitter({
                ActiveAreaSize: "18rem",
                EndMinSize: "30rem"
            }, [this.#exampleCategories = new ExampleCategories()], [this.#exampleContainer = new ExampleContainer()]));
            return this;
        }
    }

    /**
     * Global event bus class for the showcase app.
     */
    class ShowcaseEventBus extends AEventBus {
    }
    /**
     * Use the event bus from everywhere with:
     * @example
     * ```typescript
     * import { SHOWCASE_EVENTBUS as EventBus } from "./EventBus.js";
     * EventBus.on(...)
     * EventBus.emit(...)
     * ```
     */
    const SHOWCASE_EVENTBUS = new ShowcaseEventBus("OrgUnitUIEventBus");

    /**
     * Register all event handlers for the event bus used in the showcase app.
     */
    function registerEventBusEventHandlers() {
        SHOWCASE_EVENTBUS.on("NavigateTo", (ev) => {
            navigateTo(ev.Target, ev.Sender, ev.Focus);
        });
    }

    // Import to be used with application variant 1.
    //////////////////////////////////////////////////
    // #region Variant 1 /////////////////////////////
    // /*
    // Application class for the Vanilla.ts showcase application. Can be extended to add
    // application-wide features.
    class ShowcaseApp extends VTSApplication {
        #header;
        #footer;
        #main;
        #exampleCategories;
        #exampleContainer;
        constructor(rootElement) {
            super(rootElement);
            this.append(this.#header = new AppHeader, this.#main = new AppMain(), this.#footer = new AppFooter);
            this.#exampleCategories = this.#main.ExampleCategories;
            this.#exampleContainer = this.#main.ExampleContainer;
            // Handle navigation events.
            window.addEventListener("popstate", (_event) => {
                const target = decodeURIComponent(document.location.hash);
                const label = NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
                label && SHOWCASE_EVENTBUS.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
            });
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
        get ExampleCategories() {
            return this.#exampleCategories;
        }
        get ExampleContainer() {
            return this.#exampleContainer;
        }
    }
    // Global application component factory instance. Can be imported and used throughout the
    // application to create components with a consistent CSS class name prefix. To be extended with
    // additional component factories as needed.
    const $ = new (mixinComponentFactories(CSSClassNameFactory, BrFactory, BusyOverlayFactory, ButtonFactory, DisclosureContainerFactory, HrFactory, IconButtonFactory, LabeledAnchorFactory, LabeledCheckboxFactory, LabeledContainerFactory, LabeledEmailInputFactory, LabeledNumberInputFactory, LabeledParagraphFactory, LabeledPasswordInputFactory, LabeledRadioButtonFactory, LabeledRadioButtonGroupFactory, LabeledSearchInputFactory, LabeledSelectFactory, LabeledTextInputFactory, RadioButtonGroupFactory, ScrollContainerFactory, SplitterFactory))();
    // Global application instance. Can be used to access the application root and other
    // application-wide features.
    let APP;
    // Initialize the @Vanilla.ts showcase application.
    // @param rootElement The root element into which the application is mounted.
    const initializeApp = (rootElement) => {
        APP
            ? document.body.insertAdjacentText("afterbegin", "App is already initialized!")
            : APP = new ShowcaseApp(rootElement);
        // Register all event handlers for the event bus used in the showcase app.
        registerEventBusEventHandlers();
        // Navigate to the desired location or to the introduction page on startup.
        const target = decodeURIComponent(document.location.hash);
        const label = NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
        label && SHOWCASE_EVENTBUS.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
    };
    // */
    // #endregion ////////////////////////////////////
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // #region Variant 2 /////////////////////////////
    // The variant below is an alternative version which uses a similar approach as above but mixes in
    // all component factories _and_ the application class into a _single_ class and exports an instance
    // of this class as the variable `$`.
    /*
    // Application class for the Vanilla.ts showcase application. Can be extended to add
    // application-wide features.\
    // __Note:__ `VTS_App` already includes `CSSClassNameFactory` functionality, see below.
    class ShowcaseApp extends VTS_App {
        #header: AppHeader;
        #footer: AppFooter;
        #main: AppMain;
        #exampleCategories: ExampleCategories;
        #exampleContainer: ExampleContainer;

        constructor(rootElement: HTMLElement, cssPrefix: string = "") {
            super(rootElement, cssPrefix);
        }

        public initialize(): void {
            this.append(
                this.#header = new AppHeader,
                this.#main = new AppMain(),
                this.#footer = new AppFooter,
            );
            this.#exampleCategories = this.#main.ExampleCategories;
            this.#exampleContainer = this.#main.ExampleContainer;
            // Handle navigation events.
            window.addEventListener("popstate", (_event) => {
                const target = decodeURIComponent(document.location.hash) as NAVIGATION_TARGET;
                const label = <ExampleSelectorLabel>NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
                label && EventBus.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
            });
        }

        public get Header(): AppHeader {
            return this.#header;
        }

        get Main(): AppMain {
            return this.#main;
        }

        get Footer(): AppFooter {
            return this.#footer;
        }

        public get ExampleCategories(): ExampleCategories {
            return this.#exampleCategories;
        }

        public get ExampleContainer(): ExampleContainer {
            return this.#exampleContainer;
        }

        // Further features to be added as needed.
    }

    // Mixin additional component factories into the application class (`ShowcaseApp`). The result is a
    // class which contains all the functionality from `ShowCaseApp` _and_ all component factories. To
    // be extended with additional component factories as needed.
    const AppClass = mixinComponentFactories(
        ShowcaseApp,
        BrFactory,
        BusyOverlayFactory,
        ButtonFactory,
        DisclosureContainerFactory,
        HrFactory,
        IconButtonFactory,
        LabeledAnchorFactory,
        LabeledCheckboxFactory,
        LabeledContainerFactory,
        LabeledEmailInputFactory,
        LabeledNumberInputFactory,
        LabeledParagraphFactory,
        LabeledPasswordInputFactory,
        LabeledRadioButtonFactory,
        LabeledRadioButtonGroupFactory,
        LabeledSearchInputFactory,
        LabeledSelectFactory,
        LabeledTextInputFactory,
        RadioButtonGroupFactory,
        ScrollContainerFactory,
        SplitterFactory,
    );

    // Global application component factory instance. Can be imported and used throughout the
    // application to create components, for example, also with a consistent CSS class name prefix. To
    // be extended with additional component factories as needed.\
    // __Note:__ This variable also has all the features of the application class `ShowcaseApp`, so it
    // can be used to access the application root and other application-wide features.
    export let $: InstanceType<typeof AppClass>;

    // Initialize the Vanilla.ts showcase application.
    // @param rootElement The root element into which the application is mounted.
    export const initializeApp = (rootElement: HTMLElement): void => {
        if ($) {
            document.body.insertAdjacentText("afterbegin", "App is already initialized!");
        } else {
            // $ = new AppClass(rootElement, "vts");
            $ = new AppClass(rootElement);
            $.initialize();
        }
        // Register all event handlers for the event bus used in the showcase app.
        registerEventBusEventHandlers();
        // Navigate to the desired location or to the introduction page on startup.
        const target = decodeURIComponent(document.location.hash) as NAVIGATION_TARGET;
        const label = <ExampleSelectorLabel>NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
        label && EventBus.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
    };
    */
    // #endregion ////////////////////////////////////
    //////////////////////////////////////////////////

    const root = document.getElementById("app");
    root
        ? initializeApp(root)
        : document.body.appendChild(new Text("No root element with ID 'app' found!"));

})();
//# sourceMappingURL=index.js.map
