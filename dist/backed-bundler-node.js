'use strict';

var dom5 = require('dom5');
var parse5 = require('parse5');
var htmlEntities = require('html-entities');

const decode = htmlEntities.AllHtmlEntities.decode;
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
  if (needsParse(entry)) entry = parse5.parse(entry);
  const script = dom5.query(entry, queryScript);
  const body = dom5.query(entry, queryBody);
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
  return decode(parse5.serialize(entry));
};
var backedBundler = (({ entry = null, html = null, js = null, css = null, removeExternalScript = true }) => {
  validateOptions(entry, html, js, css);
  return bundle(prepare({ entry: entry, html: html, js: js, css: css }), { removeExternalScript: removeExternalScript });
});

module.exports = backedBundler;
//# sourceMappingURL=backed-bundler-node.js.map
