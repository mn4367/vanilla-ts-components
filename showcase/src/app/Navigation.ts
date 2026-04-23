// Import to be used with application variant 1 (see `App.ts`).
import { APP } from "../App.js";

// Import to be used with application variant 2 (see `App.ts`).
// import { $ } from "../App.js";

import { IElementComponent } from "../../../../vanilla-ts-core/types/Interfaces.js";
import { BusyOverlayEx } from "../examples/@components/BusyOverlayEx.js";
import { DisclosureContainerEx } from "../examples/@components/DisclosureContainerEx.js";
import { IconButtonEx } from "../examples/@components/IconButtonEx.js";
import { ComponentsIntroductionEx } from "../examples/@components/IntroductionComponents.js";
import { LabeledAnchorEx } from "../examples/@components/LabeledAnchorEx.js";
import { LabeledCheckboxEx } from "../examples/@components/LabeledCheckboxEx.js";
import { LabeledContainerEx } from "../examples/@components/LabeledContainerEx.js";
import { LabeledEmailInputEx } from "../examples/@components/LabeledEmailInputEx.js";
import { LabeledNumberInputEx } from "../examples/@components/LabeledNumberInputEx.js";
import { LabeledParagraphEx } from "../examples/@components/LabeledParagraphEx.js";
import { LabeledPasswordInputEx } from "../examples/@components/LabeledPasswordInputEx.js";
import { LabeledRadioButtonEx } from "../examples/@components/LabeledRadioButtonEx.js";
import { LabeledRadioButtonGroupEx } from "../examples/@components/LabeledRadioButtonGroupEx.js";
import { LabeledSearchInputEx } from "../examples/@components/LabeledSearchInputEx.js";
import { LabeledTextInputEx } from "../examples/@components/LabeledTextInputEx.js";
import { RadioButtonGroupEx } from "../examples/@components/RadioButtonGroupEx.js";
import { ComponentFactoriesEx } from "../examples/@core/ComponentFactoriesEx.js";
import { ElementComponentVoidEx } from "../examples/@core/ElementComponentVoidEx.js";
import { ElementComponentWithChildrenEx } from "../examples/@core/ElementComponentWithChildrenEx.js";
import { EventBusEx } from "../examples/@core/EventBusEx.js";
import { AddressEx } from "../examples/@dom/AddressEx.js";
import { AEx } from "../examples/@dom/AEx.js";
import { BEx } from "../examples/@dom/BEx.js";
import { BrEx } from "../examples/@dom/BrEx.js";
import { ButtonEx } from "../examples/@dom/ButtonEx.js";
import { CanvasEx } from "../examples/@dom/CanvasEx.js";
import { CheckboxEx } from "../examples/@dom/CheckboxEx.js";
import { CodeEx } from "../examples/@dom/CodeEx.js";
import { CommentEx } from "../examples/@dom/CommentEx.js";
import { DialogEx } from "../examples/@dom/DialogEx.js";
import { DivEx } from "../examples/@dom/DivEx.js";
import { EmailInputEx } from "../examples/@dom/EmailInputEx.js";
import { EmEx } from "../examples/@dom/EmEx.js";
import { FooterEx } from "../examples/@dom/FooterEx.js";
import { FragmentEx } from "../examples/@dom/FragmentEx.js";
import { HeaderEx } from "../examples/@dom/HeaderEx.js";
import { HrEx } from "../examples/@dom/HrEx.js";
import { HxEx } from "../examples/@dom/HxEx.js";
import { IEx } from "../examples/@dom/IEx.js";
import { ImgEx } from "../examples/@dom/ImgEx.js";
import { LabelEx } from "../examples/@dom/LabelEx.js";
import { MainEx } from "../examples/@dom/MainEx.js";
import { NumberInputEx } from "../examples/@dom/NumberInputEx.js";
import { PasswordInputEx } from "../examples/@dom/PasswordInputEx.js";
import { PEx } from "../examples/@dom/PEx.js";
import { PreEx } from "../examples/@dom/PreEx.js";
import { RadioButtonEx } from "../examples/@dom/RadioButtonEx.js";
import { SearchInputEx } from "../examples/@dom/SearchInputEx.js";
import { SpanEx } from "../examples/@dom/SpanEx.js";
import { TextEx } from "../examples/@dom/TextEx.js";
import { TextInputEx } from "../examples/@dom/TextInputEx.js";
import { BaseExample } from "../examples/BaseExample.js";
import { IntroductionEx } from "../examples/introduction/IntroductionEx.js";


/** All navigation targets. */
export const NAVIGATION_TARGETS = [
    // Introduction
    "#Introduction",
    // Core
    "#@core/ElementComponentVoid",
    "#@core/ElementComponentWithChildren",
    "#@core/EventBus",
    "#@core/Component factories",
    // DOM
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
    "#@dom/Label",
    "#@dom/Main",
    "#@dom/NumberInput",
    "#@dom/P",
    "#@dom/PasswordInput",
    "#@dom/Pre",
    "#@dom/RadioButton",
    "#@dom/SearchInput",
    "#@dom/Span",
    "#@dom/Text",
    "#@dom/TextInput",
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
] as const;
export type NAVIGATION_TARGET = typeof NAVIGATION_TARGETS[number];

/** A map containing component instances that can issue a navigation to a target. */
export const NAVIGATION_ISSUER_COMPONENTS: Map<NAVIGATION_TARGET, IElementComponent<HTMLElement>> = new Map();

/** All example renderers. */
// Introduction
let indroductionEx: IntroductionEx;
// Core
let elementComponentVoidEx: ElementComponentVoidEx;
let elementComponentWithChildrenEx: ElementComponentWithChildrenEx;
let eventBusEx: EventBusEx;
let componentFactoriesEx: ComponentFactoriesEx;
// DOM
let aEx: AEx;
let addressEx: AddressEx;
let bEx: BEx;
let brEx: BrEx;
let buttonEx: ButtonEx;
let canvasEx: CanvasEx;
let checkboxEx: CheckboxEx;
let commentEx: CommentEx;
let codeEx: CodeEx;
let dialogEx: DialogEx;
let divEx: DivEx;
let emEx: EmEx;
let emailInputEx: EmailInputEx;
let footerEx: FooterEx;
let fragmentEx: FragmentEx;
let headerEx: HeaderEx;
let hrEx: HrEx;
let hxEx: HxEx;
let iEx: IEx;
let imgEx: ImgEx;
let labelEx: LabelEx;
let mainEx: MainEx;
let numberInputEx: NumberInputEx;
let pEx: PEx;
let passwordInputEx: PasswordInputEx;
let preEx: PreEx;
let radioButtonEx: RadioButtonEx;
let searchInputEx: SearchInputEx;
let spanEx: SpanEx;
let textEx: TextEx;
let textInputEx: TextInputEx;
// Components
let componentsIntroductionEx: ComponentsIntroductionEx;
let busyOverlayEx: BusyOverlayEx;
let iconButtonEx: IconButtonEx;
let disclosureContainerEx: DisclosureContainerEx;
let labeledAnchorEx: LabeledAnchorEx;
let labeledCheckboxEx: LabeledCheckboxEx;
let labeledContainerEx: LabeledContainerEx;
let labeledEmailInputEx: LabeledEmailInputEx;
let labeledNumberInputEx: LabeledNumberInputEx;
let labeledParagraphEx: LabeledParagraphEx;
let labeledPasswordInputEx: LabeledPasswordInputEx;
let labeledRadioButtonEx: LabeledRadioButtonEx;
let labeledRadioButtonGroupEx: LabeledRadioButtonGroupEx;
let labeledSearchInputEx: LabeledSearchInputEx;
let labeledTextInputEx: LabeledTextInputEx;
let radioButtonGroupEx: RadioButtonGroupEx;

/** Previous sender of a `NavigateTo` event. */
let prevSenderOfNavigateTo: IElementComponent<HTMLElement> | undefined = undefined;

/**
 * Navigate to an example.
 */
export function navigateTo(target: NAVIGATION_TARGET, sender?: IElementComponent<HTMLElement>, focus?: IElementComponent<HTMLElement>): void {
    // console.log(target, sender);
    console.time();
    prevSenderOfNavigateTo?.removeClass("selected");
    prevSenderOfNavigateTo = sender;
    focus
        ? focus.focus().addClass("selected")
        : NAVIGATION_ISSUER_COMPONENTS.get(target)?.focus().addClass("selected");
    let example: BaseExample | undefined;
    switch (target) {
        // Introduction
        case "#Introduction":
            example = indroductionEx ??= new IntroductionEx();
            break;
        // Core
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
        case "#@dom/Img":
            example = imgEx ??= new ImgEx();
            break;
        case "#@dom/Label":
            example = labelEx ??= new LabelEx();
            break;
        case "#@dom/Main":
            example = mainEx ??= new MainEx();
            break;
        case "#@dom/NumberInput":
            example = numberInputEx ??= new NumberInputEx();
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
        case "#@dom/RadioButton":
            example = radioButtonEx ??= new RadioButtonEx();
            break;
        case "#@dom/Span":
            example = spanEx ??= new SpanEx();
            break;
        case "#@dom/SearchInput":
            example = searchInputEx ??= new SearchInputEx();
            break;
        case "#@dom/Text":
            example = textEx ??= new TextEx();
            break;
        case "#@dom/TextInput":
            example = textInputEx ??= new TextInputEx();
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
};
