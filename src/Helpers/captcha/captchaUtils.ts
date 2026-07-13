const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const rand = (min : number, max : number) => Math.random() * (max - min) + min;
export const randInt = (min : number, max : number) => Math.floor(rand(min, max));

export function generateCode(len = 6) {
  return Array.from({ length: len }, () => CHARS[randInt(0, CHARS.length)]).join("");
}