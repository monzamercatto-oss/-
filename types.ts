export interface CoC7Item {
  _id: string;
  name: string;
  type: string;
  img: string;
  system: {
    skillName?: string;
    specialization?: string;
    base?: string | number;
    value?: number | null;
    description?: { value: string };
    properties?: any;
    eras?: any;
    [key: string]: any;
  };
  flags?: any;
}

export interface CoC7Characteristics {
  [key: string]: {
    value: number;
    tempValue?: number | null;
    short?: string;
    label?: string;
    bonusDice?: number;
  };
}

export interface CoC7Attributes {
  hp: { value: number; max: number; short: string; label: string; auto: boolean };
  mp: { value: number; max: number; short: string; label: string; auto: boolean };
  lck: { value: number; short: string; label: string; max: number; bonusDice: number };
  san: { value: number; max: number; short: string; label: string; auto: boolean };
  mov: { value: number; max: number; short: string; label: string; auto: boolean };
  db: { value: number | string; short: string; label: string; auto: boolean };
  build: { current: number; value: number; short: string; label: string; auto: boolean };
  armor?: { value: number; localized: boolean; locations: any[]; auto: boolean };
}

export interface CoC7Infos {
  occupation?: string;
  age?: string;
  sex?: string;
  residence?: string;
  birthplace?: string;
  archetype?: string;
  organization?: string;
  playername?: string;
  type?: string;
  [key: string]: any;
}

export interface CoC7Actor {
  name: string;
  type: string;
  img: string;
  items: CoC7Item[];
  folder?: string;
  flags: any;
  system: {
    characteristics: CoC7Characteristics;
    attribs: CoC7Attributes;
    infos: CoC7Infos;
    biography: string; // Added field for flavor text
  };
  prototypeToken: {
    name: string;
    displayName: number;
    actorLink: boolean;
  };
}