/**
 * @file laboratorium.ts
 * @description Kumpulan helper kecil dipakai lintas komponen "General"
 * (mis. FormModal). Namanya dipertahankan `laboratorium` supaya cocok
 * dengan import path yang sudah dipakai di komponen-komponen tersebut
 * (`@/Utils/laboratorium`) tanpa perlu mengubah file lain.
 */

/**
 * Gabungkan beberapa className menjadi satu string, otomatis buang
 * value yang falsy (undefined, null, false, "").
 *
 * @example
 * joinClassNames("btn", isActive && "btn-active", className)
 * // -> "btn btn-active custom-class" (kalau isActive true & className ada isinya)
 */
export function joinClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

// Alias umum, jaga-jaga kalau ada komponen lain yang mengimpor dengan nama ini.
export const cn = joinClassNames;

export default joinClassNames;
