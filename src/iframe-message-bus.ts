import { MessageBus, Events, Parameters } from 'protocol';

type AnyEventCallback<Ev> = <E extends keyof Ev>(topic: E, args: Parameters<Ev[E]>) => void;

export class IFrameMessageBus extends MessageBus<Events> {
  private _listeners: any[] = [];

  constructor(private _source: string, private _destination: string, private _docWindow: Window) {
    super();
  }

  onAny(cb: AnyEventCallback<Events>) {
    const listener = (e: MessageEvent) => {
      if (!e.data || !e.data.topic || e.data.source !== this._destination) {
        return;
      }
      cb(e.data.topic, e.data.args);
    };
    window.addEventListener('message', listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      window.removeEventListener('message', listener);
    };
  }

  on<E extends keyof Events>(topic: E, cb: Events[E]) {
    const listener = (e: MessageEvent) => {
      if (!e.data || e.data.source !== this._destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        cb.apply(null, e.data.args);
      }
    };
    window.addEventListener('message', listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      window.removeEventListener('message', listener);
    };
  }

  once<E extends keyof Events>(topic: E, cb: Events[E]) {
    const listener = (e: MessageEvent) => {
      if (!e.data || e.data.source !== this._destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        cb.apply(null, e.data.args);
        window.addEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  }

  emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): void {
    console.log('@@ Sending message', topic, args);
    this._docWindow.postMessage(
      {
        source: this._source,
        topic,
        args
      },
      '*'
    );
  }

  destroy(): void {
    this._listeners.forEach(l => window.removeEventListener('message', l));
    this._listeners = [];
  }
}