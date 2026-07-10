// jsdom não implementa Blob URLs (URL.createObjectURL/revokeObjectURL) — polyfill
// mínimo para permitir vi.spyOn nesses métodos em testes (ex.: exportarSave).
// https://github.com/jsdom/jsdom/issues/1721
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:polyfill";
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => {};
}
