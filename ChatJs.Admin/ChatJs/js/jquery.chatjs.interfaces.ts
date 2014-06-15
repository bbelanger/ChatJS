// represents an object that has state
interface IStateObject<TState> {
    getState(): TState;
    setState(state: TState, triggerStateChangedEvent: boolean): void;
}

interface IWindow<TState> extends IStateObject<TState> {
    getWidth():number;
}