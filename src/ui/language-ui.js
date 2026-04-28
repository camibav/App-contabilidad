import {
  APP_LOCALE,
  translateAttributeToSpanish,
  translateTextToSpanish,
} from "../config/i18n.js";

const TRANSLATABLE_ATTRIBUTES = ["title", "aria-label", "placeholder"];
const SKIPPED_NODE_NAMES = new Set(["SCRIPT", "STYLE", "PRE", "CODE"]);

export function translateDashboardToSpanish(root = document) {
  document.documentElement.lang = APP_LOCALE.split("-")[0];

  translateTextNodes(root);
  translateAttributes(root);
}

function translateTextNodes(root) {
  const treeWalker = document.createTreeWalker(
    root.body ?? root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parentElement = node.parentElement;

        if (!parentElement || SKIPPED_NODE_NAMES.has(parentElement.nodeName)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (!node.nodeValue?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const textNodes = [];

  while (treeWalker.nextNode()) {
    textNodes.push(treeWalker.currentNode);
  }

  for (const textNode of textNodes) {
    textNode.nodeValue = translateTextToSpanish(textNode.nodeValue);
  }
}

function translateAttributes(root) {
  const elements = root.querySelectorAll?.("*") ?? [];

  for (const element of elements) {
    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      if (!element.hasAttribute(attribute)) {
        continue;
      }

      element.setAttribute(
        attribute,
        translateAttributeToSpanish(element.getAttribute(attribute))
      );
    }
  }
}
