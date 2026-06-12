export type ClassDictionary = Record<string, boolean | null | undefined>;
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassDictionary
  | ClassValue[];
