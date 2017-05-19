const assert = require('assert');
const readFile = require('fs').readFile;
const bundler = require('./../lib/backed-bundler-node');

const read = path => {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf-8', (error, contents) => {
      if (error) {
        return reject(error);
      }
      resolve(contents);
    });
  });
}

const promises = [
  read('test/templates/index.html'),
  read('test/templates/app.html'),
  read('test/templates/app.js'),
  read('test/templates/app.css')
];

describe('backed-bundler test suite', () => {
  it('Tests defaults', (done) => {
    Promise.all(promises).then(files => {
      const result = bundler({entry: files[0], html: files[1], js: files[2], css: files[3]});
      if (!result.match(/&gt;/g) && !result.match(/&lt;/g)) {
        done();
      }
    })
  });

  it('Tests element', (done) => {
    Promise.all(promises).then(files => {
      const result = bundler({entry: null, html: files[1], js: files[2], css: files[3], element: true});
      if (!result.match(/&gt;/g) && !result.match(/&lt;/g)) {
        done();
      }
    })
  });
});

describe('backed-bundler test errors', () => {
  it('Tests fails when element is not defined correctly', () => {
    const result = bundler({element: 'false'});;
    return assert.equal(result, 'Error: element is not a typeof Boolean')
  });
});
