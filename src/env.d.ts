/* Puente entre app.js y el kit de demos: desplaza el scroll interno hasta un elemento. */
interface Window {
  __scrollToEl?: (el: Element, extra?: number) => void;
}
