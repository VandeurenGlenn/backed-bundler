import { query } from 'dom5';
import { parse, serialize } from 'parse5';
import { AllHtmlEntities } from 'html-entities';

const decode = AllHtmlEntities.decode;
const validateOptions = (entry, html, js, css) => {
  if (entry === null) {
    return console.warn('entry::undefined, please defined on in bundler.options.');
  } else if (!html && !js && !css) {
    return console.warn('Nothing to bundle, checkout the README to get started');
  }
};
const isObject = object => {
  return typeof object === 'object';
};
const isNode = object => {
  return isObject(object) ? object instanceof Node : false;
};
const isElement = object => {
  return isObject(object) ? object instanceof HTMLElement : false;
};
const needsParse = source => {
  if (!isNode(source) || !isElement(source)) return true;
  return false;
};
const replaceChild = (target, node) => {
  const childNodes = target.childNodes[1].childNodes;
  let index;
  for (let child of childNodes) {
    if (child.nodeName && child.nodeName === node.nodeName) {
      index = childNodes.indexOf(child);
    }
  }
  childNodes[index] = node;
  target.childNodes = childNodes;
};
const appendChild = (target, node) => {
  target.childNodes.push(node);
};
const removeChild = node => {
  const childNodes = node.parentNode.childNodes;
  const index = childNodes.indexOf(node);
  delete childNodes.splice(index, 1);
  node.parentNode.childNodes = childNodes;
};
const nodeNameRule = (node, nodeName) => {
  if (node.nodeName && node.nodeName === nodeName) {
    return node;
  }
};
const queryBody = el => {
  return nodeNameRule(el, 'body');
};
const queryScript = el => {
  return nodeNameRule(el, 'script');
};
const prepareEach = (value = {}, tag = null) => {
  const node = {
    nodeName: null,
    value: null,
    childNodes: [],
    attrs: []
  };
  if (value && !value.includes(`<${tag}>`)) {
    node.nodeName = tag;
    node.tagName = tag;
    if (tag === 'script') {
      node.childNodes = [{
        nodeName: '#text',
        childNodes: [],
        attrs: [],
        value: value
      }];
    } else if (tag === 'html') {
      node.nodeName = 'template';
      node.tagName = undefined;
      node.content = value.toString();
    } else if (tag === 'style') {
      node.childNodes = [{
        nodeName: '#text',
        childNodes: [],
        attrs: [],
        value: value
      }];
    }
    node.value = value;
    return node;
  }
};
const prepare = ({ entry, html, js, css }) => {
  if (needsParse(entry)) entry = parse(entry);
  const script = query(entry, queryScript);
  const body = query(entry, queryBody);
  css = prepareEach(css, 'style');
  js = prepareEach(js, 'script');
  html = prepareEach(html, 'html');
  return {
    entry: entry,
    html: html,
    js: js,
    css: css,
    script: script,
    body: body
  };
};
const bundle = ({ entry, html, js, css, script, body }, removeExternalScript) => {
  if (css) appendChild(body, css);
  if (html) appendChild(body, html);
  if (js) appendChild(body, js);
  if (script && removeExternalScript && script.attrs[0].name === 'src') {
    removeChild(script);
  }
  replaceChild(entry, body);
  return decode(serialize(entry));
};
var backedBundler = (({ entry = null, html = null, js = null, css = null, removeExternalScript = true }) => {
  validateOptions(entry, html, js, css);
  return bundle(prepare({ entry: entry, html: html, js: js, css: css }), { removeExternalScript: removeExternalScript });
});

export default backedBundler;
//# sourceMappingURL=backed-bundler-es.js.map
