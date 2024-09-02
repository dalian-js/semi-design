import BaseFoundation, { DefaultAdapter } from '../base/foundation';
import { keyToCode, Keys } from './constants';

export interface HotKeysAdapter<P = Record<string, any>, S = Record<string, any>> extends DefaultAdapter<P, S> {
    notifyClick: () => void;
    getListenerTarget: () => HTMLElement
}

export default class HotKeysFoundation<P = Record<string, any>, S = Record<string, any>> extends BaseFoundation<HotKeysAdapter<P, S>, P, S> {
    constructor(adapter: HotKeysAdapter<P, S>) {
        super({ ...adapter });
    }

    init(): void {
        // init Listener
        const target = this._adapter.getListenerTarget();
        target?.addEventListener('keydown', this.handleKeyDown);
        const hotKeys = this.getProps().hotKeys;
        if (!this.isValidHotKeys(hotKeys)) {
            throw new Error('HotKeys must have one common key and 0/some modifier key');
        }   
    }

    isValidHotKeys = (hotKeys: string[]): boolean => {
        let commonKeyCnt = 0;
        const modifierKeys: string[] = [Keys.Meta, Keys.Alt, Keys.Shift, Keys.Control];

        hotKeys.forEach(key => {
            key = key.toLowerCase();
            if (!Object.values(Keys).some((value) => value === key)) {
                throw new Error(`${key} is not a valid key`);
            }
            if (!modifierKeys.includes(key)) {
                commonKeyCnt += 1;
            }
        });

        return commonKeyCnt === 1;
    }

    handleKeyDown = (event: KeyboardEvent): void => {
        console.log(event);
        const disabled = this.getProps().disabled;
        if (disabled) {
            return;
        }
        const hotKeys = this.getProps().hotKeys;
        let allModifier = new Array(4).fill(false); // Meta Shift Alt Ctrl
        let clickedModifier = [event.metaKey, event.shiftKey, event.altKey, event.ctrlKey];
        const keysPressed = hotKeys?.map((key: KeyboardEvent["key"])=> {
            key = key.toLowerCase();
            if (key === "meta") {
                allModifier[0] = true;
                return event.metaKey; 
            } else if (key === "shift") {
                allModifier[1] = true;
                return event.shiftKey;
            } else if (key === "alt") {
                allModifier[2] = true;
                return event.altKey;
            } else if (key === "control") {
                allModifier[3] = true;
                return event.ctrlKey;
            }
            return event.code === keyToCode(key); 
        });

        if (!allModifier.every((value, index) => value === clickedModifier[index])) {
            return;
        }
        if (keysPressed.every(Boolean)) {
            event.preventDefault();
            this.handleClick();
            return;
        }
        
    }

    handleClick(): void {
        this._adapter.notifyClick();
    }

    destroy(): void {
        // remove Listener
        const target = this._adapter.getListenerTarget();
        target?.removeEventListener('keydown', this.handleKeyDown);
    }
}
