export function field({ label, name, value = "", type = "text", readonly = false, required = false, wide = false }) {
  return `<label class="form-field ${wide ? "wide" : ""}"><span>${label}${required ? " *" : ""}</span><input name="${name}" type="${type}" value="${value}" ${readonly ? "readonly data-auto" : ""} ${required ? "required" : ""}></label>`;
}

export function formActions(type) {
  return `<div class="form-actions"><button class="outline-button" type="button" data-save-draft>Save Draft</button><button class="primary-button" type="submit">Submit ${type}</button></div>`;
}

