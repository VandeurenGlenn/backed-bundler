const assert = require('assert');
const readFile = require('fs').readFile;
const bundler = require('./../dist/backed-bundler-node');

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

describe('backed-bundler test suite', () => {
  it('Tests defaults', (done) => {
    const promises = [
      read('test/templates/index.html'),
      read('test/templates/app.html'),
      read('test/templates/app.js'),
      read('test/templates/app.css')
    ];

    Promise.all(promises).then(files => {
      bundler({entry: files[0], html: files[1], js: files[2], css: files[3]});

      done();
    })
  });
});
