/**
 * @param ms - Number of milliseconds to delay.
 * @param fn - Optional function to execute BEFORE the delay.
 */
export function delay(ms: number, fn?: () => void): Promise<void> {
  if (fn) fn();
  return new Promise((executor: () => void) => setTimeout(() => executor(), ms));
}

export function simulateTyping(input: HTMLInputElement, text: string): void {
  const nativeInputValueSetter = Object?.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  if (!nativeInputValueSetter) return;

  nativeInputValueSetter.call(input, "");

  input.focus();

  for (const char of text) {
    const currentValue = input.value + char;

    nativeInputValueSetter.call(input, currentValue);

    input.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keypress", { key: char, bubbles: true }));
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }));
  }

  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function findNode(children: NodeListOf<ChildNode>, check: (node: Element) => boolean): Element | undefined;
export function findNode<T>(children: NodeListOf<ChildNode>, check: (node: Element) => boolean): T | undefined;
export function findNode<T>(children: NodeListOf<ChildNode>, check: (node: Element) => boolean): T | Element | undefined {
  for (const child of Array.from(children)) {
    if (child.nodeType === Node.ELEMENT_NODE && check(child as Element)) return child as T;

    if (child.childNodes.length) {
      const found = findNode(child.childNodes, check);
      if (found) return found;
    }
  }
}

export function findAllNodes(children: NodeListOf<ChildNode>, check: (node: Element) => boolean, foundNodes?: Element[]): Element[];
export function findAllNodes<T>(children: NodeListOf<ChildNode>, check: (node: Element) => boolean, foundNodes?: T[]): T[];
export function findAllNodes<T>(children: NodeListOf<ChildNode>, check: (node: Element) => boolean, foundNodes: T[] = []): T[] {
  children.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE && check(child as Element)) foundNodes.push(child as T);
    if (child.childNodes.length) findAllNodes(child.childNodes, check, foundNodes);
  });

  return foundNodes;
}
