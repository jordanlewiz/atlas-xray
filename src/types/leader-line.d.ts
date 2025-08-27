declare module 'leader-line-new' {
  export = LeaderLine;
}

declare namespace LeaderLine {
  export type Element = HTMLElement | SVGElement;
  export type PlugType = 'disc' | 'square' | 'arrow1' | 'arrow2' | 'arrow3' | 'hand' | 'crosshair' | 'behind';
  export type PathType = 'straight' | 'arc' | 'fluid' | 'magnet' | 'grid';
  export type SocketType = 'top' | 'right' | 'bottom' | 'left' | 'auto';
  
  export interface Options {
    end?: Element | any;
    start?: Element | any;
    size?: number;
    color?: string;
    path?: PathType;
    startSocket?: SocketType;
    endSocket?: SocketType;
    startPlug?: PlugType;
    endPlug?: PlugType;
    startPlugColor?: string;
    endPlugColor?: string;
    startPlugSize?: number;
    endPlugSize?: number;
    outline?: boolean;
    outlineColor?: string;
    outlineSize?: number;
    dropShadow?: boolean;
  }
}

declare class LeaderLine {
  constructor(start: Element | any, end: Element | any, options?: LeaderLine.Options);
  remove(): void;
  show(): void;
  hide(): void;
  setOptions(options: LeaderLine.Options): void;
  position(): void;
}
