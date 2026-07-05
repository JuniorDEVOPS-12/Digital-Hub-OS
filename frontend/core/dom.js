/* ========================================
   Digital Hub OS — DOM Helpers
   ======================================== */

export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);

export function el(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') element.className = v;
        else if (k === 'innerHTML') element.innerHTML = v;
        else if (k === 'textContent') element.textContent = v;
        else if (k.startsWith('on')) element.addEventListener(k.slice(2).toLowerCase(), v);
        else element.setAttribute(k, v);
    }
    for (const child of children) {
        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
        else if (child) element.appendChild(child);
    }
    return element;
}
