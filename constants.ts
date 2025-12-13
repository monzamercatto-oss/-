import { CoC7Actor } from './types';

// INVESTIGATOR TEMPLATE
export const TEMPLATE_INVESTIGATOR: CoC7Actor = {
  "name": "CHARACTER_NAME_HERE",
  "type": "character",
  "img": "icons/svg/mystery-man.svg",
  "items": [],
  "folder": "",
  "flags": {
    "CoC7": {
      "skillListMode": false,
      "skillShowUncommon": true
    },
    "core": {},
    "exportSource": {
      "world": "coc",
      "system": "CoC7",
      "coreVersion": "11.306",
      "systemVersion": "0.10.5"
    }
  },
  "system": {
    "characteristics": {
      "str": { "value": 0, "tempValue": null, "short": "CHARAC.STR", "label": "CHARAC.Strength", "bonusDice": 0 },
      "con": { "value": 0, "tempValue": null, "short": "CHARAC.CON", "label": "CHARAC.Constitution", "bonusDice": 0 },
      "siz": { "value": 0, "tempValue": null, "short": "CHARAC.SIZ", "label": "CHARAC.Size", "bonusDice": 0 },
      "dex": { "value": 0, "tempValue": null, "short": "CHARAC.DEX", "label": "CHARAC.Dexterity", "bonusDice": 0 },
      "app": { "value": 0, "tempValue": null, "short": "CHARAC.APP", "label": "CHARAC.Appearance", "bonusDice": 0 },
      "int": { "value": 0, "tempValue": null, "short": "CHARAC.INT", "label": "CHARAC.Intelligence", "bonusDice": 0 },
      "pow": { "value": 0, "tempValue": null, "short": "CHARAC.POW", "label": "CHARAC.Power", "bonusDice": 0 },
      "edu": { "value": 0, "tempValue": null, "short": "CHARAC.EDU", "label": "CHARAC.Education", "bonusDice": 0 }
    },
    "attribs": {
      "hp": { "value": 0, "max": 0, "short": "HP", "label": "Hit points", "auto": true },
      "mp": { "value": 0, "max": 0, "short": "HP", "label": "Magic points", "auto": true },
      "lck": { "value": 0, "short": "LCK", "label": "Luck", "max": 99, "bonusDice": 0 },
      "san": { "value": 0, "max": 99, "short": "SAN", "label": "Sanity", "auto": true },
      "mov": { "value": 0, "max": 0, "short": "MOV", "label": "Movement rate", "auto": true },
      "db": { "value": 0, "short": "DB", "label": "Damage bonus", "auto": true },
      "build": { "current": 0, "value": 0, "short": "BLD", "label": "Build", "auto": true }
    },
    "infos": {
      "occupation": "",
      "age": "",
      "sex": "",
      "residence": "",
      "birthplace": "",
      "archetype": "",
      "organization": "",
      "playername": ""
    },
    "biography": ""
  },
  "prototypeToken": {
    "name": "CHARACTER_NAME_HERE",
    "displayName": 0,
    "actorLink": true
  }
};

// NPC / KEEPER CHARACTER TEMPLATE
export const TEMPLATE_NPC: CoC7Actor = {
  "name": "NPC_NAME_HERE",
  "type": "npc",
  "img": "systems/CoC7/assets/icons/cultist.svg",
  "system": {
    "characteristics": {
      "str": { "value": 0, "tempValue": null, "short": "CHARAC.STR", "label": "CHARAC.Strength", "bonusDice": 0 },
      "con": { "value": 0, "tempValue": null, "short": "CHARAC.CON", "label": "CHARAC.Constitution", "bonusDice": 0 },
      "siz": { "value": 0, "tempValue": null, "short": "CHARAC.SIZ", "label": "CHARAC.Size", "bonusDice": 0 },
      "dex": { "value": 0, "tempValue": null, "short": "CHARAC.DEX", "label": "CHARAC.Dexterity", "bonusDice": 0 },
      "app": { "value": 0, "tempValue": null, "short": "CHARAC.APP", "label": "CHARAC.Appearance", "bonusDice": 0 },
      "int": { "value": 0, "tempValue": null, "short": "CHARAC.INT", "label": "CHARAC.Intelligence", "bonusDice": 0 },
      "pow": { "value": 0, "tempValue": null, "short": "CHARAC.POW", "label": "CHARAC.Power", "bonusDice": 0 },
      "edu": { "value": 0, "tempValue": null, "short": "CHARAC.EDU", "label": "CHARAC.Education", "bonusDice": 0 }
    },
    "attribs": {
      "hp": { "value": 0, "max": 0, "short": "HP", "label": "Hit points", "auto": true },
      "mp": { "value": 0, "max": 0, "short": "HP", "label": "Magic points", "auto": true },
      "lck": { "value": 0, "short": "LCK", "label": "Luck", "max": 99, "bonusDice": 0 },
      "san": { "value": 0, "max": 99, "short": "SAN", "label": "Sanity", "auto": true, "dailyLoss": 0, "oneFifthSanity": " / 0", "bonusDice": 0 },
      "mov": { "value": 0, "max": 0, "short": "MOV", "label": "Movement rate", "auto": true },
      "db": { "value": 0, "short": "DB", "label": "Damage bonus", "auto": true },
      "build": { "current": 0, "value": 0, "short": "BLD", "label": "Build", "auto": true },
      "armor": { "value": 0, "localized": false, "locations": [], "auto": false }
    },
    "infos": {
      "occupation": "",
      "age": "",
      "sex": ""
    },
    "biography": ""
  },
  "prototypeToken": {
    "name": "NPC_NAME_HERE",
    "displayName": 0,
    "actorLink": false
  },
  "items": [],
  "flags": {
    "exportSource": {
      "world": "coc",
      "system": "CoC7",
      "coreVersion": "11.306",
      "systemVersion": "0.10.5"
    }
  }
} as any; 

// CREATURE TEMPLATE
export const TEMPLATE_CREATURE: CoC7Actor = {
  "name": "CREATURE_NAME_HERE",
  "type": "creature",
  "img": "systems/CoC7/assets/icons/floating-tentacles.svg",
  "system": {
    "characteristics": {
      "str": { "value": 0, "tempValue": null, "short": "CHARAC.STR", "label": "CHARAC.Strength", "bonusDice": 0 },
      "con": { "value": 0, "tempValue": null, "short": "CHARAC.CON", "label": "CHARAC.Constitution", "bonusDice": 0 },
      "siz": { "value": 0, "tempValue": null, "short": "CHARAC.SIZ", "label": "CHARAC.Size", "bonusDice": 0 },
      "dex": { "value": 0, "tempValue": null, "short": "CHARAC.DEX", "label": "CHARAC.Dexterity", "bonusDice": 0 },
      "app": { "value": 0, "tempValue": null, "short": "CHARAC.APP", "label": "CHARAC.Appearance", "bonusDice": 0 },
      "int": { "value": 0, "tempValue": null, "short": "CHARAC.INT", "label": "CHARAC.Intelligence", "bonusDice": 0 },
      "pow": { "value": 0, "tempValue": null, "short": "CHARAC.POW", "label": "CHARAC.Power", "bonusDice": 0 },
      "edu": { "value": 0, "tempValue": null, "short": "CHARAC.EDU", "label": "CHARAC.Education", "bonusDice": 0 }
    },
    "attribs": {
      "hp": { "value": 0, "max": 0, "short": "HP", "label": "Hit points", "auto": true },
      "mp": { "value": 0, "max": 0, "short": "HP", "label": "Magic points", "auto": true },
      "lck": { "value": 0, "short": "LCK", "label": "Luck", "max": 99, "bonusDice": 0 },
      "san": { "value": 0, "max": 99, "short": "SAN", "label": "Sanity", "auto": true, "dailyLoss": 0, "oneFifthSanity": " / 0", "bonusDice": 0 },
      "mov": { "value": 0, "max": 0, "short": "MOV", "label": "Movement rate", "auto": true },
      "db": { "value": 0, "short": "DB", "label": "Damage bonus", "auto": true },
      "build": { "current": 0, "value": 0, "short": "BLD", "label": "Build", "auto": true },
      "armor": { "value": 0, "localized": false, "locations": [], "auto": false }
    },
    "infos": {
      "type": "" 
    },
    "special": {
      "attacksPerRound": 1
    },
    "biography": ""
  },
  "prototypeToken": {
    "name": "CREATURE_NAME_HERE",
    "displayName": 0,
    "actorLink": false
  },
  "items": [],
  "flags": {
    "exportSource": {
      "world": "coc",
      "system": "CoC7",
      "coreVersion": "11.306",
      "systemVersion": "0.10.5"
    }
  }
} as any;