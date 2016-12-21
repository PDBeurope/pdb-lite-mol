/*
 * pdb-lite-mol
 * https://github.com/mandarsd/pdb-lite-mol
 *
 * Copyright (c) 2016 Mandar Deshpande
 * Licensed under the Apache-2.0 license.
 */

/**
@class pdblitemol
 */


var  pdblitemol;
module.exports = pdblitemol = function(opts){
  this.el = opts.el;
  this.el.textContent = pdblitemol.hello(opts.text);
};

/**
 * Private Methods
 */

/*
 * Public Methods
 */

/**
 * Method responsible to say Hello
 *
 * @example
 *
 *     pdblitemol.hello('biojs');
 *
 * @method hello
 * @param {String} name Name of a person
 * @return {String} Returns hello name
 */


pdblitemol.hello = function (name) {

  return 'hello ' + name;
};

