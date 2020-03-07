/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(5);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
__webpack_require__(6);
__webpack_require__(8);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--3-1!../../node_modules/postcss-loader/lib/index.js!./normalize.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--3-1!../../node_modules/postcss-loader/lib/index.js!./normalize.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(false);
// imports


// module
exports.push([module.i, "/*! normalize.css v3.0.2 | MIT License | git.io/normalize */\r\n\r\n/**\r\n * 1. Set default font family to sans-serif.\r\n * 2. Prevent iOS text size adjust after orientation change, without disabling\r\n *    user zoom.\r\n */\r\n\r\nhtml {\r\n  font-family: sans-serif; /* 1 */\r\n  -ms-text-size-adjust: 100%; /* 2 */\r\n  -webkit-text-size-adjust: 100%; /* 2 */\r\n}\r\n\r\n/**\r\n * Remove default margin.\r\n */\r\n\r\nbody {\r\n  margin: 0;\r\n}\r\n\r\n/* HTML5 display definitions\r\n   ========================================================================== */\r\n\r\n/**\r\n * Correct `block` display not defined for any HTML5 element in IE 8/9.\r\n * Correct `block` display not defined for `details` or `summary` in IE 10/11\r\n * and Firefox.\r\n * Correct `block` display not defined for `main` in IE 11.\r\n */\r\n\r\narticle, aside, details, figcaption, figure, footer, header, hgroup, main, menu, nav, section, summary {\r\n  display: block;\r\n}\r\n\r\n/**\r\n * 1. Correct `inline-block` display not defined in IE 8/9.\r\n * 2. Normalize vertical alignment of `progress` in Chrome, Firefox, and Opera.\r\n */\r\n\r\naudio, canvas, progress, video {\r\n  display: inline-block; /* 1 */\r\n  vertical-align: baseline; /* 2 */\r\n}\r\n\r\n/**\r\n * Prevent modern browsers from displaying `audio` without controls.\r\n * Remove excess height in iOS 5 devices.\r\n */\r\n\r\naudio:not([controls]) {\r\n  display: none;\r\n  height: 0;\r\n}\r\n\r\n/**\r\n * Address `[hidden]` styling not present in IE 8/9/10.\r\n * Hide the `template` element in IE 8/9/11, Safari, and Firefox < 22.\r\n */\r\n\r\n[hidden], template {\r\n  display: none;\r\n}\r\n\r\n/* Links\r\n   ========================================================================== */\r\n\r\n/**\r\n * Remove the gray background color from active links in IE 10.\r\n */\r\n\r\na {\r\n  background-color: transparent;\r\n}\r\n\r\n/**\r\n * Improve readability when focused and also mouse hovered in all browsers.\r\n */\r\n\r\na:active, a:hover {\r\n  outline: 0;\r\n}\r\n\r\n/* Text-level semantics\r\n   ========================================================================== */\r\n\r\n/**\r\n * Address styling not present in IE 8/9/10/11, Safari, and Chrome.\r\n */\r\n\r\nabbr[title] {\r\n  border-bottom: 1px dotted;\r\n}\r\n\r\n/**\r\n * Address style set to `bolder` in Firefox 4+, Safari, and Chrome.\r\n */\r\n\r\nb, strong {\r\n  font-weight: bold;\r\n}\r\n\r\n/**\r\n * Address styling not present in Safari and Chrome.\r\n */\r\n\r\ndfn {\r\n  font-style: italic;\r\n}\r\n\r\n/**\r\n * Address variable `h1` font-size and margin within `section` and `article`\r\n * contexts in Firefox 4+, Safari, and Chrome.\r\n */\r\n\r\nh1 {\r\n  font-size: 2em;\r\n  margin: 0.67em 0;\r\n}\r\n\r\n/**\r\n * Address styling not present in IE 8/9.\r\n */\r\n\r\nmark {\r\n  background: #ff0;\r\n  color: #000;\r\n}\r\n\r\n/**\r\n * Address inconsistent and variable font size in all browsers.\r\n */\r\n\r\nsmall {\r\n  font-size: 80%;\r\n}\r\n\r\n/**\r\n * Prevent `sub` and `sup` affecting `line-height` in all browsers.\r\n */\r\n\r\nsub, sup {\r\n  font-size: 75%;\r\n  line-height: 0;\r\n  position: relative;\r\n  vertical-align: baseline;\r\n}\r\n\r\nsup {\r\n  top: -0.5em;\r\n}\r\n\r\nsub {\r\n  bottom: -0.25em;\r\n}\r\n\r\n/* Embedded content\r\n   ========================================================================== */\r\n\r\n/**\r\n * Remove border when inside `a` element in IE 8/9/10.\r\n */\r\n\r\nimg {\r\n  border: 0;\r\n}\r\n\r\n/**\r\n * Correct overflow not hidden in IE 9/10/11.\r\n */\r\n\r\nsvg:not(:root) {\r\n  overflow: hidden;\r\n}\r\n\r\n/* Grouping content\r\n   ========================================================================== */\r\n\r\n/**\r\n * Address margin not present in IE 8/9 and Safari.\r\n */\r\n\r\nfigure {\r\n  margin: 1em 40px;\r\n}\r\n\r\n/**\r\n * Address differences between Firefox and other browsers.\r\n */\r\n\r\nhr {\r\n  box-sizing: content-box;\r\n  height: 0;\r\n}\r\n\r\n/**\r\n * Contain overflow in all browsers.\r\n */\r\n\r\npre {\r\n  overflow: auto;\r\n}\r\n\r\n/**\r\n * Address odd `em`-unit font size rendering in all browsers.\r\n */\r\n\r\ncode, kbd, pre, samp {\r\n  font-family: monospace, monospace;\r\n  font-size: 1em;\r\n}\r\n\r\n/* Forms\r\n   ========================================================================== */\r\n\r\n/**\r\n * Known limitation: by default, Chrome and Safari on OS X allow very limited\r\n * styling of `select`, unless a `border` property is set.\r\n */\r\n\r\n/**\r\n * 1. Correct color not being inherited.\r\n *    Known issue: affects color of disabled elements.\r\n * 2. Correct font properties not being inherited.\r\n * 3. Address margins set differently in Firefox 4+, Safari, and Chrome.\r\n */\r\n\r\nbutton, input, optgroup, select, textarea {\r\n  color: inherit; /* 1 */\r\n  font: inherit; /* 2 */\r\n  margin: 0; /* 3 */\r\n}\r\n\r\n/**\r\n * Address `overflow` set to `hidden` in IE 8/9/10/11.\r\n */\r\n\r\nbutton {\r\n  overflow: visible;\r\n}\r\n\r\n/**\r\n * Address inconsistent `text-transform` inheritance for `button` and `select`.\r\n * All other form control elements do not inherit `text-transform` values.\r\n * Correct `button` style inheritance in Firefox, IE 8/9/10/11, and Opera.\r\n * Correct `select` style inheritance in Firefox.\r\n */\r\n\r\nbutton, select {\r\n  text-transform: none;\r\n}\r\n\r\n/**\r\n * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native `audio`\r\n *    and `video` controls.\r\n * 2. Correct inability to style clickable `input` types in iOS.\r\n * 3. Improve usability and consistency of cursor style between image-type\r\n *    `input` and others.\r\n */\r\n\r\nbutton, html input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"] {\r\n  -webkit-appearance: button; /* 2 */\r\n  cursor: pointer; /* 3 */\r\n}\r\n\r\n/**\r\n * Re-set default cursor for disabled elements.\r\n */\r\n\r\nbutton[disabled], html input[disabled] {\r\n  cursor: default;\r\n}\r\n\r\n/**\r\n * Remove inner padding and border in Firefox 4+.\r\n */\r\n\r\nbutton::-moz-focus-inner, input::-moz-focus-inner {\r\n  border: 0;\r\n  padding: 0;\r\n}\r\n\r\n/**\r\n * Address Firefox 4+ setting `line-height` on `input` using `!important` in\r\n * the UA stylesheet.\r\n */\r\n\r\ninput {\r\n  line-height: normal;\r\n}\r\n\r\n/**\r\n * It's recommended that you don't attempt to style these elements.\r\n * Firefox's implementation doesn't respect box-sizing, padding, or width.\r\n *\r\n * 1. Address box sizing set to `content-box` in IE 8/9/10.\r\n * 2. Remove excess padding in IE 8/9/10.\r\n */\r\n\r\ninput[type='checkbox'], input[type='radio'] {\r\n  box-sizing: border-box; /* 1 */\r\n  padding: 0; /* 2 */\r\n}\r\n\r\n/**\r\n * Fix the cursor style for Chrome's increment/decrement buttons. For certain\r\n * `font-size` values of the `input`, it causes the cursor style of the\r\n * decrement button to change from `default` to `text`.\r\n */\r\n\r\ninput[type='number']::-webkit-inner-spin-button, input[type='number']::-webkit-outer-spin-button {\r\n  height: auto;\r\n}\r\n\r\n/**\r\n * 1. Address `appearance` set to `searchfield` in Safari and Chrome.\r\n * 2. Address `box-sizing` set to `border-box` in Safari and Chrome\r\n *    (include `-moz` to future-proof).\r\n */\r\n\r\ninput[type='search'] {\r\n  -webkit-appearance: textfield; /* 1 */ /* 2 */\r\n  box-sizing: content-box;\r\n}\r\n\r\n/**\r\n * Remove inner padding and search cancel button in Safari and Chrome on OS X.\r\n * Safari (but not Chrome) clips the cancel button when the search input has\r\n * padding (and `textfield` appearance).\r\n */\r\n\r\ninput[type='search']::-webkit-search-cancel-button, input[type='search']::-webkit-search-decoration {\r\n  -webkit-appearance: none;\r\n}\r\n\r\n/**\r\n * Define consistent border, margin, and padding.\r\n */\r\n\r\nfieldset {\r\n  border: 1px solid #c0c0c0;\r\n  margin: 0 2px;\r\n  padding: 0.35em 0.625em 0.75em;\r\n}\r\n\r\n/**\r\n * 1. Correct `color` not being inherited in IE 8/9/10/11.\r\n * 2. Remove padding so people aren't caught out if they zero out fieldsets.\r\n */\r\n\r\nlegend {\r\n  border: 0; /* 1 */\r\n  padding: 0; /* 2 */\r\n}\r\n\r\n/**\r\n * Remove default vertical scrollbar in IE 8/9/10/11.\r\n */\r\n\r\ntextarea {\r\n  overflow: auto;\r\n}\r\n\r\n/**\r\n * Don't inherit the `font-weight` (applied by a rule above).\r\n * NOTE: the default cannot safely be changed in Chrome and Safari on OS X.\r\n */\r\n\r\noptgroup {\r\n  font-weight: bold;\r\n}\r\n\r\n/* Tables\r\n   ========================================================================== */\r\n\r\n/**\r\n * Remove most spacing between table cells.\r\n */\r\n\r\ntable {\r\n  border-collapse: collapse;\r\n  border-spacing: 0;\r\n}\r\n\r\ntd, th {\r\n  padding: 0;\r\n}\r\n", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--3-1!../../node_modules/postcss-loader/lib/index.js!./skeleton.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--3-1!../../node_modules/postcss-loader/lib/index.js!./skeleton.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(false);
// imports


// module
exports.push([module.i, "/*\r\n* Skeleton V2.0.4\r\n* Copyright 2014, Dave Gamache\r\n* www.getskeleton.com\r\n* Free to use under the MIT license.\r\n* http://www.opensource.org/licenses/mit-license.php\r\n* 12/29/2014\r\n*/\r\n\r\n/* Table of contents\r\n––––––––––––––––––––––––––––––––––––––––––––––––––\r\n- Grid\r\n- Base Styles\r\n- Typography\r\n- Links\r\n- Buttons\r\n- Forms\r\n- Lists\r\n- Code\r\n- Tables\r\n- Spacing\r\n- Utilities\r\n- Clearing\r\n- Media Queries\r\n*/\r\n\r\n/* Grid\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\n.container {\r\n  position: relative;\r\n  width: 100%;\r\n  /* max-width: 960px; */\r\n  max-width: 1024px;\r\n  margin: 0 auto;\r\n  padding: 0 20px;\r\n  box-sizing: border-box;\r\n}\r\n\r\n.column, .columns {\r\n  width: 100%;\r\n  float: left;\r\n  box-sizing: border-box;\r\n}\r\n\r\n/* For devices larger than 400px */\r\n\r\n@media (min-width: 400px) {\r\n  .container {\r\n    width: 85%;\r\n    padding: 0;\r\n  }\r\n}\r\n\r\n/* For devices larger than 550px */\r\n\r\n@media (min-width: 550px) {\r\n  .container {\r\n    width: 80%;\r\n  }\r\n  .column, .columns {\r\n    margin-left: 4%;\r\n  }\r\n  .column:first-child, .columns:first-child {\r\n    margin-left: 0;\r\n  }\r\n\r\n  .one.column, .one.columns {\r\n    width: 4.66666666667%;\r\n  }\r\n  .two.columns {\r\n    width: 13.3333333333%;\r\n  }\r\n  .three.columns {\r\n    width: 22%;\r\n  }\r\n  .four.columns {\r\n    width: 30.6666666667%;\r\n  }\r\n  .five.columns {\r\n    width: 39.3333333333%;\r\n  }\r\n  .six.columns {\r\n    width: 48%;\r\n  }\r\n  .seven.columns {\r\n    width: 56.6666666667%;\r\n  }\r\n  .eight.columns {\r\n    width: 65.3333333333%;\r\n  }\r\n  .nine.columns {\r\n    width: 74%;\r\n  }\r\n  .ten.columns {\r\n    width: 82.6666666667%;\r\n  }\r\n  .eleven.columns {\r\n    width: 91.3333333333%;\r\n  }\r\n  .twelve.columns {\r\n    width: 100%;\r\n    margin-left: 0;\r\n  }\r\n\r\n  .one-third.column {\r\n    width: 30.6666666667%;\r\n  }\r\n  .two-thirds.column {\r\n    width: 65.3333333333%;\r\n  }\r\n\r\n  .one-half.column {\r\n    width: 48%;\r\n  }\r\n\r\n  /* Offsets */\r\n  .offset-by-one.column, .offset-by-one.columns {\r\n    margin-left: 8.66666666667%;\r\n  }\r\n  .offset-by-two.column, .offset-by-two.columns {\r\n    margin-left: 17.3333333333%;\r\n  }\r\n  .offset-by-three.column, .offset-by-three.columns {\r\n    margin-left: 26%;\r\n  }\r\n  .offset-by-four.column, .offset-by-four.columns {\r\n    margin-left: 34.6666666667%;\r\n  }\r\n  .offset-by-five.column, .offset-by-five.columns {\r\n    margin-left: 43.3333333333%;\r\n  }\r\n  .offset-by-six.column, .offset-by-six.columns {\r\n    margin-left: 52%;\r\n  }\r\n  .offset-by-seven.column, .offset-by-seven.columns {\r\n    margin-left: 60.6666666667%;\r\n  }\r\n  .offset-by-eight.column, .offset-by-eight.columns {\r\n    margin-left: 69.3333333333%;\r\n  }\r\n  .offset-by-nine.column, .offset-by-nine.columns {\r\n    margin-left: 78%;\r\n  }\r\n  .offset-by-ten.column, .offset-by-ten.columns {\r\n    margin-left: 86.6666666667%;\r\n  }\r\n  .offset-by-eleven.column, .offset-by-eleven.columns {\r\n    margin-left: 95.3333333333%;\r\n  }\r\n\r\n  .offset-by-one-third.column, .offset-by-one-third.columns {\r\n    margin-left: 34.6666666667%;\r\n  }\r\n  .offset-by-two-thirds.column, .offset-by-two-thirds.columns {\r\n    margin-left: 69.3333333333%;\r\n  }\r\n\r\n  .offset-by-one-half.column, .offset-by-one-half.columns {\r\n    margin-left: 52%;\r\n  }\r\n}\r\n\r\n/* Base Styles\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\n/* NOTE\r\nhtml is set to 62.5% so that all the REM measurements throughout Skeleton\r\nare based on 10px sizing. So basically 1.5rem = 15px :) */\r\n\r\nhtml {\r\n  font-size: 62.5%;\r\n}\r\n\r\nbody {\r\n  font-size: 1.5em; /* currently ems cause chrome bug misinterpreting rems on body element */\r\n  line-height: 1.6;\r\n  font-weight: 400;\r\n  font-family: 'Raleway', 'HelveticaNeue', 'Helvetica Neue', Helvetica, Arial, sans-serif;\r\n  color: #222;\r\n}\r\n\r\n/* Typography\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\nh1, h2, h3, h4, h5, h6 {\r\n  margin-top: 0;\r\n  margin-bottom: 2rem;\r\n  font-weight: 300;\r\n}\r\n\r\nh1 {\r\n  font-size: 4rem;\r\n  line-height: 1.2;\r\n  letter-spacing: -0.1rem;\r\n}\r\n\r\nh2 {\r\n  font-size: 3.6rem;\r\n  line-height: 1.25;\r\n  letter-spacing: -0.1rem;\r\n}\r\n\r\nh3 {\r\n  font-size: 3rem;\r\n  line-height: 1.3;\r\n  letter-spacing: -0.1rem;\r\n}\r\n\r\nh4 {\r\n  font-size: 2.4rem;\r\n  line-height: 1.35;\r\n  letter-spacing: -0.08rem;\r\n}\r\n\r\nh5 {\r\n  font-size: 1.8rem;\r\n  line-height: 1.5;\r\n  letter-spacing: -0.05rem;\r\n}\r\n\r\nh6 {\r\n  font-size: 1.5rem;\r\n  line-height: 1.6;\r\n  letter-spacing: 0;\r\n}\r\n\r\n/* Larger than phablet */\r\n\r\n@media (min-width: 550px) {\r\n  h1 {\r\n    font-size: 5rem;\r\n  }\r\n  h2 {\r\n    font-size: 4.2rem;\r\n  }\r\n  h3 {\r\n    font-size: 3.6rem;\r\n  }\r\n  h4 {\r\n    font-size: 3rem;\r\n  }\r\n  h5 {\r\n    font-size: 2.4rem;\r\n  }\r\n  h6 {\r\n    font-size: 1.5rem;\r\n  }\r\n}\r\n\r\np {\r\n  margin-top: 0;\r\n}\r\n\r\n/* Links\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\na {\r\n  color: #1eaedb;\r\n}\r\n\r\na:hover {\r\n  color: #0fa0ce;\r\n}\r\n\r\n/* Buttons\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\n.button, button, input[type='submit'], input[type='reset'], input[type='button'] {\r\n  display: inline-block;\r\n  height: 38px;\r\n  padding: 0 30px;\r\n  color: #555;\r\n  text-align: center;\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  line-height: 38px;\r\n  letter-spacing: 0.1rem;\r\n  text-transform: uppercase;\r\n  text-decoration: none;\r\n  white-space: nowrap;\r\n  background-color: transparent;\r\n  border-radius: 4px;\r\n  border: 1px solid #bbb;\r\n  cursor: pointer;\r\n  box-sizing: border-box;\r\n}\r\n\r\n.button:hover, button:hover, input[type='submit']:hover, input[type='reset']:hover, input[type='button']:hover, .button:focus, button:focus, input[type='submit']:focus, input[type='reset']:focus, input[type='button']:focus {\r\n  color: #333;\r\n  border-color: #888;\r\n  outline: 0;\r\n}\r\n\r\n.button.button-primary, button.button-primary, input[type='submit'].button-primary, input[type='reset'].button-primary, input[type='button'].button-primary {\r\n  color: #fff;\r\n  background-color: #33c3f0;\r\n  border-color: #33c3f0;\r\n}\r\n\r\n.button.button-primary:hover, button.button-primary:hover, input[type='submit'].button-primary:hover, input[type='reset'].button-primary:hover, input[type='button'].button-primary:hover, .button.button-primary:focus, button.button-primary:focus, input[type='submit'].button-primary:focus, input[type='reset'].button-primary:focus, input[type='button'].button-primary:focus {\r\n  color: #fff;\r\n  background-color: #1eaedb;\r\n  border-color: #1eaedb;\r\n}\r\n\r\n/* Forms\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\ninput[type='email'], input[type='number'], input[type='search'], input[type='text'], input[type='tel'], input[type='url'], input[type='password'], textarea, select {\r\n  height: 38px;\r\n  padding: 6px 10px; /* The 6px vertically centers text on FF, ignored by Webkit */\r\n  background-color: #fff;\r\n  border: 1px solid #d1d1d1;\r\n  border-radius: 4px;\r\n  box-shadow: none;\r\n  box-sizing: border-box;\r\n}\r\n\r\n/* Removes awkward default styles on some inputs for iOS */\r\n\r\ninput[type='email'], input[type='number'], input[type='search'], input[type='text'], input[type='tel'], input[type='url'], input[type='password'], textarea {\r\n  -webkit-appearance: none;\r\n  -moz-appearance: none;\r\n  appearance: none;\r\n}\r\n\r\ntextarea {\r\n  min-height: 65px;\r\n  padding-top: 6px;\r\n  padding-bottom: 6px;\r\n}\r\n\r\ninput[type='email']:focus, input[type='number']:focus, input[type='search']:focus, input[type='text']:focus, input[type='tel']:focus, input[type='url']:focus, input[type='password']:focus, textarea:focus, select:focus {\r\n  border: 1px solid #33c3f0;\r\n  outline: 0;\r\n}\r\n\r\nlabel, legend {\r\n  display: block;\r\n  margin-bottom: 0.5rem;\r\n  font-weight: 600;\r\n}\r\n\r\nfieldset {\r\n  padding: 0;\r\n  border-width: 0;\r\n}\r\n\r\ninput[type='checkbox'], input[type='radio'] {\r\n  display: inline;\r\n}\r\n\r\nlabel > .label-body {\r\n  display: inline-block;\r\n  margin-left: 0.5rem;\r\n  font-weight: normal;\r\n}\r\n\r\n/* Lists\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\nul {\r\n  list-style: circle inside;\r\n}\r\n\r\nol {\r\n  list-style: decimal inside;\r\n}\r\n\r\nol, ul {\r\n  padding-left: 0;\r\n  margin-top: 0;\r\n}\r\n\r\nul ul, ul ol, ol ol, ol ul {\r\n  margin: 1.5rem 0 1.5rem 3rem;\r\n  font-size: 90%;\r\n}\r\n\r\nli {\r\n  margin-bottom: 1rem;\r\n}\r\n\r\n/* Code\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\ncode {\r\n  padding: 0.2rem 0.5rem;\r\n  margin: 0 0.2rem;\r\n  font-size: 90%;\r\n  white-space: nowrap;\r\n  background: #f1f1f1;\r\n  border: 1px solid #e1e1e1;\r\n  border-radius: 4px;\r\n}\r\n\r\npre > code {\r\n  display: block;\r\n  padding: 1rem 1.5rem;\r\n  white-space: pre;\r\n}\r\n\r\n/* Tables\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\nth, td {\r\n  padding: 12px 15px;\r\n  text-align: left;\r\n  border-bottom: 1px solid #e1e1e1;\r\n}\r\n\r\nth:first-child, td:first-child {\r\n  padding-left: 0;\r\n}\r\n\r\nth:last-child, td:last-child {\r\n  padding-right: 0;\r\n}\r\n\r\n/* Spacing\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\nbutton, .button {\r\n  margin-bottom: 1rem;\r\n}\r\n\r\ninput, textarea, select, fieldset {\r\n  margin-bottom: 1.5rem;\r\n}\r\n\r\npre, blockquote, dl, figure, table, p, ul, ol, form {\r\n  margin-bottom: 2.5rem;\r\n}\r\n\r\n/* Utilities\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\n.u-full-width {\r\n  width: 100%;\r\n  box-sizing: border-box;\r\n}\r\n\r\n.u-max-full-width {\r\n  max-width: 100%;\r\n  box-sizing: border-box;\r\n}\r\n\r\n.u-pull-right {\r\n  float: right;\r\n}\r\n\r\n.u-pull-left {\r\n  float: left;\r\n}\r\n\r\n/* Misc\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\nhr {\r\n  margin-top: 3rem;\r\n  margin-bottom: 3.5rem;\r\n  border-width: 0;\r\n  border-top: 1px solid #e1e1e1;\r\n}\r\n\r\n/* Clearing\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\n/* Self Clearing Goodness */\r\n\r\n.container:after, .row:after, .u-cf {\r\n  content: '';\r\n  display: table;\r\n  clear: both;\r\n}\r\n\r\n/* Media Queries\r\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\r\n\r\n/*\r\nNote: The best way to structure the use of media queries is to create the queries\r\nnear the relevant code. For example, if you wanted to change the styles for buttons\r\non small devices, paste the mobile query code up in the buttons section and style it\r\nthere.\r\n*/\r\n\r\n/* Larger than mobile */\r\n\r\n@media (min-width: 400px) {\r\n}\r\n\r\n/* Larger than phablet (also point when grid becomes active) */\r\n\r\n@media (min-width: 550px) {\r\n}\r\n\r\n/* Larger than tablet */\r\n\r\n@media (min-width: 750px) {\r\n}\r\n\r\n/* Larger than desktop */\r\n\r\n@media (min-width: 1000px) {\r\n}\r\n\r\n/* Larger than Desktop HD */\r\n\r\n@media (min-width: 1200px) {\r\n}\r\n", ""]);

// exports


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--3-1!../../node_modules/postcss-loader/lib/index.js!./app.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--3-1!../../node_modules/postcss-loader/lib/index.js!./app.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(false);
// imports


// module
exports.push([module.i, "body {\r\n  font-family: 'Khula', Arial, sans-serif;\r\n  background: #eee;\r\n}\r\n\r\n@media print {\r\n\r\n  body {\r\n    background: #fff;\r\n  }\r\n}\r\n\r\nbody {\r\n  font-size: 12px;\r\n}\r\n\r\nbody * {\r\n  margin-bottom: 0.5px;\r\n}\r\n\r\nli {\r\n  text-indent: -1em;\r\n  padding-left: 1em;\r\n}\r\n\r\n.resume-container {\r\n  background: #fff;\r\n  width: 800px;\r\n  margin: 20px auto 20px auto;\r\n}\r\n\r\n@media print {\r\n\r\n  .resume-container {\r\n    margin: 0;\r\n  }\r\n}\r\n\r\n.resume-container { /* border-bottom: solid 20px $info; */\r\n}\r\n\r\n.eyecatch-title {\r\n  color: #555;\r\n  font-size: 30px;\r\n  margin: 12px 0 0 0;\r\n}\r\n\r\n.eyecatch-subtitle {\r\n  color: #40cec0;\r\n  font-size: 17px;\r\n}\r\n\r\n.contact {\r\n  background: #40cec0;\r\n  color: #fff;\r\n  padding: 20px;\r\n  text-align: center;\r\n}\r\n\r\n.contact-each-first, .contact-each-second {\r\n  border-right: solid 1px #888;\r\n  margin-left: 0;\r\n  width: 32% !important;\r\n}\r\n\r\n.contact-each-third {\r\n  border-right: solid 1px #888;\r\n  margin-left: 1%;\r\n  width: 32% !important;\r\n}\r\n\r\n.contact-each-last {\r\n  margin-left: 1%;\r\n  width: 32% !important;\r\n}\r\n\r\n.contact-content {\r\n  font-size: 14px;\r\n  font-weight: bold;\r\n}\r\n\r\n.work-each {\r\n  margin-bottom: 30px;\r\n}\r\n\r\n.oss-title {\r\n  font-weight: bold;\r\n}\r\n\r\n.oss-url {\r\n  margin-left: 10px;\r\n}\r\n\r\n.oss-description {\r\n  margin-left: 20px;\r\n}\r\n\r\n.education {\r\n  margin-bottom: 24px;\r\n}\r\n\r\n.u-section-title {\r\n  font-size: 17px;\r\n  color: #40cec0;\r\n  letter-spacing: 0.3px;\r\n  margin-bottom: 8px;\r\n}\r\n\r\n.u-each-title {\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.u-each-organization {\r\n  font-weight: bold;\r\n}\r\n\r\n.u-each-subtitle {\r\n  margin-bottom: 6px;\r\n  color: #888;\r\n}\r\n\r\n.u-each-period {\r\n  margin-left: 6%;\r\n  padding-left: 6%;\r\n  border-left: solid 1px #ccc;\r\n}\r\n\r\n.u-doc-container {\r\n  padding: 16px 20px;\r\n}\r\n\r\n@media print {\r\n  @page {\r\n    margin: 0;\r\n  }\r\n  body {\r\n    margin: 0;\r\n  }\r\n  header h1, header nav, footer, img {\r\n    display: none;\r\n  }\r\n}\r\n\r\n@page {\r\n  size: auto; /* auto is the initial value */\r\n  margin: 0mm; /* this affects the margin in the printer settings */\r\n}\r\n", ""]);

// exports


/***/ })
/******/ ]);