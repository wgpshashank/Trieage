/*
| -------------------------------------------------------------------
| Trieage
| -------------------------------------------------------------------
|
| An easy to use class for efficiently handling of dictionary-type data.
|
| @software    Trieage
| @version     0.1.1-dev
| @author      James Brumond
| @copyright   Copyright 2011 James Brumond
| @license     Dual licensed under MIT and GPL
|
*/

(function(window, undefined) {

var Trie = function(data) {
	
	var
	self        = this,
	dictionary  = { };
	
	/**
	 * Add new words to the dictionary
	 *
	 * @access  public
	 * @param   array     the words to add
	 * @return  void
	 */
	self.addWords = function(data) {
		if (typeof data === 'object' && typeof data.length === 'number') {
			for (var i = 0, c = data.length; i < c; i++) {
				self.addWord(data[i]);
			}
		}
	};
	
	/**
	 * Add a new word to the dictionary
	 *
	 * @access  public
	 * @param   string    the word to add
	 * @return  void
	 */
	self.addWord = function(word) {
		if (typeof word !== 'string' || ! word.length) { return false; }
		// Make lowercase (for case-insensitive matching)
		word = word.toLowerCase();
		// Get a reference to the top level of the dictionary
		current = dictionary;
		for (var i = 0, c = word.length; i < c; i++) {
			// Check if there is a branch for the current character
			if (typeof current[word[i]] !== 'object') {
				current[word[i]] = { };
			}
			// Move down to the next level
			current = current[word[i]];
		}
		current[0] = true;
	};
	
	/**
	 * Removes words from the dictionary
	 *
	 * @access  public
	 * @param   array     the words to remove
	 * @return  void
	 */
	self.removeWords = function(data) {
		if (typeof data === 'object' && typeof data.length === 'number') {
			for (var i = 0, c = data.length; i < c; i++) {
				self.removeWord(data[i]);
			}
		}
	};
	
	/**
	 * Remove a word from the dictionary
	 *
	 * @access  public
	 * @param   string    the word to remove
	 * @return  void
	 */
	self.removeWord = function(word) {
		if (self.isValidWord(word || '')) {
			// Get a reference to the top level of the dictionary
			var
			chain    = [ ],
			current  = dictionary;
			chain.push(dictionary);
			for (var i = 0, c = word.length; i < c; i++) {
				// Move down to the next level
				current = current[word[i]];
				chain.push(current);
			}
			// Mark the current level as invalid
			current[0] = false;
			// Remove any newly unneeded sections
			var lastEmpty = null;
			for (var i = chain.length - 1; i >= 0; i--) {
				if (containsWords(chain[i])) {
					if (lastEmpty) {
						for (var j = 0, c = lastEmpty.length; i < c; j++) {
							lastEmpty = false;
						}
					}
					break;
				}
				last_empty = chain[i];
			}
		}
	};
	
	/**
	 * Search the dictionary for a given word
	 *
	 * @access  public
	 * @param   string    the word
	 * @return  bool
	 */
	self.isValidWord = function(word) {
		if (typeof word !== 'string' || ! word.length) { return false; }
		// Make lowercase (for case-insensitive matching)
		word = word.toLowerCase();
		// Get a reference to the top level of the dictionary
		current = dictionary;
		for (var i = 0, c = word.length; i < c; i++) {
			char = word[i];
			// Check if there is a branch for the current character
			if (typeof current[char] !== 'object') { return false; }
			// Move down to the next level
			current = current[char];
		}
		// Check if the current level is a valid word
		return (!! current[0]);
	}
	
	/**
	 * Check if a string is a valid word prefix
	 *
	 * @access  public
	 * @param   string    the prefix to test
	 * @param   bool      if not a prefix, but it is a word, return true
	 * @return  bool
	 */
	self.isValidPrefix = function(prefix, ignoreWholeWord) {
		if (typeof prefix !== 'string' || ! prefix.length) { return false; }
		// Make lowercase (for case-insensitive matching)
		prefix = prefix.toLowerCase();
		// Get a reference to the top level of the dictionary
		current = dictionary;
		for (var i = 0, c = prefix.length; i < c; i++) {
			char = prefix[i];
			// Check if there is a branch for the current character
			if (typeof current[char] !== 'object') { return false; }
			// Move down to the next level
			current = current[char];
		}
		return containsWords(current, ignoreWholeWord);
	};
	
	/**
	 * Dump a string representation of the dictionary
	 *
	 * @access  public
	 * @param   int       the formatting constant
	 * @param   bool      return the result?
	 * @return  string
	 */
	self.dump = function(format, shouldReturn) {
		var
		content       = null,
		format        = (typeof format === 'number') ? format : Trie.EXPORT,
		shouldReturn  = shouldReturn || false;
		// Dump according to the correct format
		switch (format) {
			case Trie.SERIAL:
				content = phpjs.serialize(dictionary);
			break;
			case Trie.JSON:
				content = JSON.stringify(dictionary);
			break;
			case Trie.EXPORT:
				shouldReturn = true;
				content = basicClone(dictionary);
			break;
			case Trie.WORDS:
				content = getWords(dictionary);
			break;
			default:
				return false;
			break;
		}
		// Handle (return/output) content
		if (shouldReturn) {
			return content;
		} else {
			Trie._output(content);
		}
	};
	
	// Initialize
	self.addWords(data);
	
},
	
// ----------------------------------------------------------------------------
//  Internal helper functions

/**
 * Check if an array contains any valid words
 *
 * @access  protected
 * @param   arary     the array to test
 * @param   bool      ignore words that aren't prefixes
 * @return  bool
 */
containsWords = function(arr, ignoreWholeWord) {
	// Check for a word
	var ignoreWholeWord = ignoreWholeWord || false;
	if (! ignoreWholeWord && arr[0]) { return true; }
	// Check sub-levels
	var sublevel;
	for (var i = 0, c = arr.length; i < c; i++) {
		if (i === 0) { continue; }
		if (containsWords(arr[i])) { return true; }
	}
	return false;
},
	
/**
 * Build a list of all words in a dictionary array
 *
 * @access  public
 * @param   array     the words dictionary
 * @param   string    a prefix to add to all words
 * @return  array
 */
getWords = function(dict, prefix, result) {
	var
	result = result || [ ],
	prefix = prefix || '';
	for (var i in dict) {
		if (dict.hasOwnProperty(i)) {
			if (i === '0' && dict[i]) {
				result.push(prefix);
			} else {
				getWords(dict[i], prefix + i, result);
			}
		}
	}
	return result;
},

/**
 * A basic clone function for Object literals
 *
 * @access  private
 * @param   object    the object to clone
 * @return  object
 */
basicClone = function(obj) {
	if (typeof obj !== 'object' || obj === null) { return obj; }
	var obj2 = { };
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			obj2[i] = basicClone(obj[i]);
		}
	}
	return obj2;
};

// ----------------------------------------------------------------------------
//  Formatting constants

Trie.SERIAL   = 0;
Trie.JSON     = 1;
Trie.EXPORT   = 2;
Trie.WORDS    = 3;
Trie._output  = function(obj) {
	return console.log(obj);
};

// ----------------------------------------------------------------------------
//  Expose

window.Trie = Trie;



// ----------------------------------------------------------------------------
//  END OF TRIEAGE CODE. CODE BELOW THIS POINT IS BORROWED FROM THE MENTIONED
//  LOCATIONS AND LICENSED ACCORDING TO LICENSES MENTIONED BELOW.
// ----------------------------------------------------------------------------




/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (! JSON) {
    var JSON = { };
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

// ----------------------------------------------------------------------------
//  BEGIN PHPJS CODE (PHP SERIALIZE/UNSERIALIZE EMULATION)
// ----------------------------------------------------------------------------

var phpjs = {

	utf8_decode: function(str_data) {
		// Converts a UTF-8 encoded string to ISO-8859-1  
		// 
		// version: 1103.1210
		// discuss at: http://phpjs.org/functions/utf8_decode
		// +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
		// +      input by: Aman Gupta
		// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   improved by: Norman "zEh" Fuchs
		// +   bugfixed by: hitwork
		// +   bugfixed by: Onno Marsman
		// +      input by: Brett Zamir (http://brett-zamir.me)
		// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// *     example 1: utf8_decode('Kevin van Zonneveld');
		// *     returns 1: 'Kevin van Zonneveld'
		var tmp_arr = [],
			i = 0,
			ac = 0,
			c1 = 0,
			c2 = 0,
			c3 = 0;
	 
		str_data += '';
	 
		while (i < str_data.length) {
			c1 = str_data.charCodeAt(i);
			if (c1 < 128) {
				tmp_arr[ac++] = String.fromCharCode(c1);
				i++;
			} else if (c1 > 191 && c1 < 224) {
				c2 = str_data.charCodeAt(i + 1);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = str_data.charCodeAt(i + 1);
				c3 = str_data.charCodeAt(i + 2);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
	 
		return tmp_arr.join('');
	},

	utf8_encode: function(argString) {
		// Encodes an ISO-8859-1 string to UTF-8  
		// 
		// version: 1103.1210
		// discuss at: http://phpjs.org/functions/utf8_encode
		// +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
		// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   improved by: sowberry
		// +    tweaked by: Jack
		// +   bugfixed by: Onno Marsman
		// +   improved by: Yves Sucaet
		// +   bugfixed by: Onno Marsman
		// +   bugfixed by: Ulrich
		// *     example 1: utf8_encode('Kevin van Zonneveld');
		// *     returns 1: 'Kevin van Zonneveld'
		var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		var utftext = "",
			start, end, stringl = 0;
	 
		start = end = 0;
		stringl = string.length;
		for (var n = 0; n < stringl; n++) {
			var c1 = string.charCodeAt(n);
			var enc = null;
	 
			if (c1 < 128) {
				end++;
			} else if (c1 > 127 && c1 < 2048) {
				enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
			} else {
				enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
			}
			if (enc !== null) {
				if (end > start) {
					utftext += string.slice(start, end);
				}
				utftext += enc;
				start = end = n + 1;
			}
		}
	 
		if (end > start) {
			utftext += string.slice(start, stringl);
		}
	 
		return utftext;
	},
	
	serialize: function(mixed_value) {
		// Returns a string representation of variable (which can later be unserialized)  
		// 
		// version: 1103.1210
		// discuss at: http://phpjs.org/functions/serialize
		// +   original by: Arpad Ray (mailto:arpad@php.net)
		// +   improved by: Dino
		// +   bugfixed by: Andrej Pavlovic
		// +   bugfixed by: Garagoth
		// +      input by: DtTvB (http://dt.in.th/2008-09-16.string-length-in-bytes.html)
		// +   bugfixed by: Russell Walker (http://www.nbill.co.uk/)
		// +   bugfixed by: Jamie Beck (http://www.terabit.ca/)
		// +      input by: Martin (http://www.erlenwiese.de/)
		// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
		// +   improved by: Le Torbi (http://www.letorbi.de/)
		// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
		// +   bugfixed by: Ben (http://benblume.co.uk/)
		// -	depends on: utf8_encode
		// %          note: We feel the main purpose of this function should be to ease the transport of data between php & js
		// %          note: Aiming for PHP-compatibility, we have to translate objects to arrays
		// *	 example 1: serialize(['Kevin', 'van', 'Zonneveld']);
		// *	 returns 1: 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
		// *	 example 2: serialize({firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'});
		// *	 returns 2: 'a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}'
		var _utf8Size = function (str) {
			var size = 0,
				i = 0,
				l = str.length,
				code = '';
			for (i = 0; i < l; i++) {
				code = str.charCodeAt(i);
				if (code < 0x0080) {
					size += 1;
				} else if (code < 0x0800) {
					size += 2;
				} else {
					size += 3;
				}
			}
			return size;
		};
		var _getType = function (inp) {
			var type = typeof inp,
				match;
			var key;
	 
			if (type === 'object' && !inp) {
				return 'null';
			}
			if (type === "object") {
				if (!inp.constructor) {
					return 'object';
				}
				var cons = inp.constructor.toString();
				match = cons.match(/(\w+)\(/);
				if (match) {
					cons = match[1].toLowerCase();
				}
				var types = ["boolean", "number", "string", "array"];
				for (key in types) {
					if (cons == types[key]) {
						type = types[key];
						break;
					}
				}
			}
			return type;
		};
		var type = _getType(mixed_value);
		var val, ktype = '';
	 
		switch (type) {
		case "function":
			val = "";
			break;
		case "boolean":
			val = "b:" + (mixed_value ? "1" : "0");
			break;
		case "number":
			val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
			break;
		case "string":
			val = "s:" + _utf8Size(mixed_value) + ":\"" + mixed_value + "\"";
			break;
		case "array":
		case "object":
			val = "a";
	/*
				if (type == "object") {
					var objname = mixed_value.constructor.toString().match(/(\w+)\(\)/);
					if (objname == undefined) {
						return;
					}
					objname[1] = phpjs.serialize(objname[1]);
					val = "O" + objname[1].substring(1, objname[1].length - 1);
				}
				*/
			var count = 0;
			var vals = "";
			var okey;
			var key;
			for (key in mixed_value) {
				if (mixed_value.hasOwnProperty(key)) {
					ktype = _getType(mixed_value[key]);
					if (ktype === "function") {
						continue;
					}
	 
					okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
					vals += phpjs.serialize(okey) + phpjs.serialize(mixed_value[key]);
					count++;
				}
			}
			val += ":" + count + ":{" + vals + "}";
			break;
		case "undefined":
			// Fall-through
		default:
			// if the JS object has a property which contains a null value, the string cannot be unserialized by PHP
			val = "N";
			break;
		}
		if (type !== "object" && type !== "array") {
			val += ";";
		}
		return val;
	},
	
	unserialize: function(data) {
		// Takes a string representation of variable and recreates it  
		// 
		// version: 1103.1210
		// discuss at: http://phpjs.org/functions/unserialize
		// +     original by: Arpad Ray (mailto:arpad@php.net)
		// +     improved by: Pedro Tainha (http://www.pedrotainha.com)
		// +     bugfixed by: dptr1988
		// +      revised by: d3x
		// +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +        input by: Brett Zamir (http://brett-zamir.me)
		// +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +     improved by: Chris
		// +     improved by: James
		// +        input by: Martin (http://www.erlenwiese.de/)
		// +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +     improved by: Le Torbi
		// +     input by: kilops
		// +     bugfixed by: Brett Zamir (http://brett-zamir.me)
		// -      depends on: utf8_decode
		// %            note: We feel the main purpose of this function should be to ease the transport of data between php & js
		// %            note: Aiming for PHP-compatibility, we have to translate objects to arrays
		// *       example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
		// *       returns 1: ['Kevin', 'van', 'Zonneveld']
		// *       example 2: unserialize('a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
		// *       returns 2: {firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'}
		var utf8Overhead = function (chr) {
			// http://phpjs.org/functions/unserialize:571#comment_95906
			var code = chr.charCodeAt(0);
			if (code < 0x0080) {
				return 0;
			}
			if (code < 0x0800) {
				return 1;
			}
			return 2;
		};
	 
	 
		var error = function (type, msg, filename, line) {
			throw new window[type](msg, filename, line);
		};
		var read_until = function (data, offset, stopchr) {
			var buf = [];
			var chr = data.slice(offset, offset + 1);
			var i = 2;
			while (chr != stopchr) {
				if ((i + offset) > data.length) {
					error('Error', 'Invalid');
				}
				buf.push(chr);
				chr = data.slice(offset + (i - 1), offset + i);
				i += 1;
			}
			return [buf.length, buf.join('')];
		};
		var read_chrs = function (data, offset, length) {
			var buf;
	 
			buf = [];
			for (var i = 0; i < length; i++) {
				var chr = data.slice(offset + (i - 1), offset + i);
				buf.push(chr);
				length -= utf8Overhead(chr);
			}
			return [buf.length, buf.join('')];
		};
		var _unserialize = function (data, offset) {
			var readdata;
			var readData;
			var chrs = 0;
			var ccount;
			var stringlength;
			var keyandchrs;
			var keys;
	 
			if (!offset) {
				offset = 0;
			}
			var dtype = (data.slice(offset, offset + 1)).toLowerCase();
	 
			var dataoffset = offset + 2;
			var typeconvert = function (x) {
				return x;
			};
	 
			switch (dtype) {
			case 'i':
				typeconvert = function (x) {
					return parseInt(x, 10);
				};
				readData = read_until(data, dataoffset, ';');
				chrs = readData[0];
				readdata = readData[1];
				dataoffset += chrs + 1;
				break;
			case 'b':
				typeconvert = function (x) {
					return parseInt(x, 10) !== 0;
				};
				readData = read_until(data, dataoffset, ';');
				chrs = readData[0];
				readdata = readData[1];
				dataoffset += chrs + 1;
				break;
			case 'd':
				typeconvert = function (x) {
					return parseFloat(x);
				};
				readData = read_until(data, dataoffset, ';');
				chrs = readData[0];
				readdata = readData[1];
				dataoffset += chrs + 1;
				break;
			case 'n':
				readdata = null;
				break;
			case 's':
				ccount = read_until(data, dataoffset, ':');
				chrs = ccount[0];
				stringlength = ccount[1];
				dataoffset += chrs + 2;
	 
				readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
				chrs = readData[0];
				readdata = readData[1];
				dataoffset += chrs + 2;
				if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
					error('SyntaxError', 'String length mismatch');
				}
	 
				// Length was calculated on an utf-8 encoded string
				// so wait with decoding
				readdata = phpjs.utf8_decode(readdata);
				break;
			case 'a':
				readdata = {};
	 
				keyandchrs = read_until(data, dataoffset, ':');
				chrs = keyandchrs[0];
				keys = keyandchrs[1];
				dataoffset += chrs + 2;
	 
				for (var i = 0; i < parseInt(keys, 10); i++) {
					var kprops = _unserialize(data, dataoffset);
					var kchrs = kprops[1];
					var key = kprops[2];
					dataoffset += kchrs;
	 
					var vprops = _unserialize(data, dataoffset);
					var vchrs = vprops[1];
					var value = vprops[2];
					dataoffset += vchrs;
	 
					readdata[key] = value;
				}
	 
				dataoffset += 1;
				break;
			default:
				error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
				break;
			}
			return [dtype, dataoffset - offset, typeconvert(readdata)];
		};
	 
		return _unserialize((data + ''), 0)[2];
	}

};

}(window));

/* End of file trieage.js */
