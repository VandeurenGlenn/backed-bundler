'use strict;'
import { query } from 'dom5';
import { parse, serialize } from 'parse5';
import { AllHtmlEntities } from 'html-entities';

const decode = AllHtmlEntities.decode

const validateOptions = (entry, html, js, css, element) => {
  if (typeof element !== 'boolean') {
    throw 'element is not a typeof Boolean';
  } else if (entry === null && !element) {
    throw 'entry::undefined, please defined on in bundler.options.';
  } else if (!html && !js && !css) {
    throw 'Nothing to bundle, checkout the README to get started';
  }

}

/**
 * @return {boolean}
 */
const isObject = object => {
  return typeof object === 'object';
}

/**
 * @return {boolean}
 */
const isNode = object => {
  return isObject(object) ? object instanceof Node : false;
}

/**
 * @return {boolean}
 */
const isElement = object => {
  return isObject(object) ? object instanceof HTMLElement : false;
}

/**
 * @param {string|HTMLElement|node} source Input to check
 * @return {boolean}
 */
const needsParse = source => {
  // when not a node or HTMLElement, code should be parsed so return true
  if (!isNode(source) || !isElement(source)) return true;
  return false;
}

const replaceChild = (target, node) => {
  const targetNodes = target.childNodes[1] || target.childNodes[0];
  const childNodes = targetNodes.childNodes;
  let index;
  for (let child of childNodes) {
    if (child.nodeName && child.nodeName === node.nodeName) {
      index = childNodes.indexOf(child);
    }
  }
  childNodes[index] = node;
  target.childNodes = childNodes;
}

const appendChild = (target, node) => {
  target.childNodes.push(node);
}

const removeChild = node => {
  const childNodes = node.parentNode.childNodes;
  const index = childNodes.indexOf(node);
  delete childNodes.splice(index, 1);
  node.parentNode.childNodes = childNodes;
}

const nodeNameRule = (node, nodeName) => {
  if (node.nodeName && node.nodeName === nodeName) {
    return node;
  }
}

/**
 * Simple querySelector rules for querying 'body'
 * @param {object|node} el The element to run the rules over
 */
const queryBody = el => {
  return nodeNameRule(el, 'body');
}

/**
 * Simple querySelector rules for querying 'script'
 * @param {object|node} el The element to run the rules over
 */
const queryScript = el => {
  return nodeNameRule(el, 'script');
}

const prepareEach = (value = {}, tag = null) => {
  const node = {
    nodeName: null,
    value: null,
    childNodes: [],
    attrs: []
  }
  if (value && !value.includes(`<${tag}>`)) {
    node.nodeName = tag;
    node.tagName = tag;
    if (tag === 'script') {
      node.childNodes = [{
        nodeName: '#text',
        childNodes: [],
        attrs: [],
        value: value
      }]
    } else if (tag === 'template') {
      node.nodeName = '#text';
      delete node.tagName;
    } else if (tag === 'style') {
      node.childNodes = [{
        nodeName: '#text',
        childNodes: [],
        attrs: [],
        value: value
      }]
    }
    node.value = value;
    return node;
  }
}

const prepareDocument = ({entry, html, js, css}) => {
  if (needsParse(entry)) entry = parse(entry);
  const script = query(entry, queryScript);
  const body = query(entry, queryBody);

  css = prepareEach(css, 'style');
  js = prepareEach(js, 'script');
  html = prepareEach(html, 'template');

  return {
    entry: entry,
    html: html,
    js: js,
    css: css,
    script: script,
    body: body
  }
}

const bundleElement = ({html = '', js = '', css = ''}) => {
  css += html;
  css += js;

  return css
}

const bundle = ({entry, html, js, css, script, body}, externalScripts) => {
  if (css) appendChild(body, css);
  if (html) appendChild(body, html);
  if (js) appendChild(body, js);
  if (script && externalScripts && script.attrs && script.attrs.length > 0 &&
      script.attrs[0].name === 'src') {
    removeChild(script);
  }
  replaceChild(entry, body);
  return decode(serialize(entry));
}
/**
 * @param {string} entry The file to bundle everything in
 * @param {string} html An html or set of html's to include
 * @param {string} js An script or set of scripts to include
 * @param {string} css An stylesheet or set of stylesheets to include
 * @param {string} externalScripts Wether or not to include external js
 */
export default ({entry = null, html = null, js = null, css = null, externalScripts = true, element = false}) => {

  try {
    validateOptions(entry, html, js, css, element);
    if (element) {
      return bundleElement({html: html, js: js, css});
    }
    return bundle(prepareDocument({entry: entry, html: html, js: js, css: css}), {externalScripts: externalScripts});
  } catch (error) {
    return new Error(error);
  }
}
