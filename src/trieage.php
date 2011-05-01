<?php

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

class Trie {
	
	// Formatting constants
	const SERIAL  = 0;
	const JSON    = 1;
	const EXPORT  = 2;
	const WORDS   = 3;
	
	/**
	 * The word storage array
	 *
	 * @access  protected
	 * @type    array
	 */
	protected $dictionary = array();
	
	/**
	 * Constructor
	 *
	 * @access  public
	 * @param   array     words to add to the dictionary
	 */
	public function __construct($data = array()) {
		$this->addWords($data);
	}
	
	/**
	 * Add new words to the dictionary
	 *
	 * @access  public
	 * @param   array     the words to add
	 * @return  void
	 */
	public function addWords($data) {
		if (is_array($data)) {
			foreach ($data as $word) {
				$this->addWord($word);
			}
		}
	}
	
	/**
	 * Add a new word to the dictionary
	 *
	 * @access  public
	 * @param   string    the word to add
	 * @return  void
	 */
	public function addWord($word) {
		if (! is_string($word) || ! strlen($word)) return false;
		// Make lowercase (for case-insensitive matching)
		$word = strtolower($word);
		// Get a reference to the top level of the dictionary
		$current =& $this->dictionary;
		for ($i = 0, $len = strlen($word); $i < $len; $i++) {
			$char = $word[$i];
			// Check if there is a branch for the current character
			if (! isset($current[$char])) {
				$current[$char] = array();
			}
			// Move down to the next level
			$current =& $current[$char];
		}
		$current[0] = true;
	}
	
	/**
	 * Removes words from the dictionary
	 *
	 * @access  public
	 * @param   array     the words to remove
	 * @return  void
	 */
	public function removeWords($data) {
		if (is_array($data)) {
			foreach ($data as $word) {
				$this->removeWord($word);
			}
		}
	}
	
	/**
	 * Remove a word from the dictionary
	 *
	 * @access  public
	 * @param   string    the word to remove
	 * @return  void
	 */
	public function removeWord($word) {
		if ($this->isValidWord($word)) {
			// Get a reference to the top level of the dictionary
			$chain = array();
			$current =& $this->dictionary;
			$chain[] =& $current;
			for ($i = 0, $len = strlen($word); $i < $len; $i++) {
				$char = $word[$i];
				// Move down to the next level
				$current =& $current[$char];
				$chain[] =& $current;
			}
			// Mark the current level as invalid
			$current[0] = false;
			// Remove any newly unneeded sections
			$last_empty = null;
			for ($i = count($chain) - 1; $i >= 0; $i--) {
				if ($this->containsWords($chain[$i])) {
					if ($last_empty) {
						foreach ($last_empty as $j => $k) {
							unset($last_empty[$j]);
						}
					}
					break;
				}
				$last_empty =& $chain[$i];
			}
		}
	}
	
	/**
	 * Search the dictionary for a given word
	 *
	 * @access  public
	 * @param   string    the word
	 * @return  bool
	 */
	public function isValidWord($word) {
		if (! is_string($word) || ! strlen($word)) return false;
		// Make lowercase (for case-insensitive matching)
		$word = strtolower($word);
		// Get a reference to the top level of the dictionary
		$current =& $this->dictionary;
		for ($i = 0, $len = strlen($word); $i < $len; $i++) {
			$char = $word[$i];
			// Check if there is a branch for the current character
			if (! isset($current[$char])) return false;
			// Move down to the next level
			$current =& $current[$char];
		}
		// Check if the current level is a valid word
		return (isset($current[0]) && $current[0]);
	}
	
	/**
	 * Check if a string is a valid word prefix
	 *
	 * @access  public
	 * @param   string    the prefix to test
	 * @param   bool      if not a prefix, but it is a word, return true
	 * @return  bool
	 */
	public function isValidPrefix($prefix, $ignore_whole_word = false) {
		if (! is_string($prefix) || ! strlen($prefix)) return false;
		// Make lowercase (for case-insensitive matching)
		$prefix = strtolower($prefix);
		// Get a reference to the top level of the dictionary
		$current =& $this->dictionary;
		for ($i = 0, $len = strlen($prefix); $i < $len; $i++) {
			$char = $prefix[$i];
			// Check if there is a branch for the current character
			if (! isset($current[$char])) return false;
			// Move down to the next level
			$current =& $current[$char];
		}
		return $this->containsWords($current, $ignore_whole_word);
	}
	
	/**
	 * Dump a string representation of the dictionary
	 *
	 * @access  public
	 * @param   int       the formatting constant
	 * @param   bool      return the result?
	 * @return  string
	 */
	public function dump($format = self::EXPORT, $return = false) {
		switch ($format) {
			// Serialization formatting
			case self::SERIAL:
				$content = serialize($this->dictionary);
			break;
			// JSON formatting
			case self::JSON:
				$content = json_encode($this->dictionary);
			break;
			// Raw data return
			case self::EXPORT:
				return $this->dictionary;
			break;
			// Gets a list of the words
			case self::WORDS:
				$content = $this->getWords();
				if (! $return) {
					$content = implode("\n", $content)."\n";
				}
			break;
			default:
				return false;
			break;
		}
		// Handle the result (return/echo)
		if ($return) {
			return $content;
		} else {
			echo $content;
			return true;
		}
	}
	
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
	protected function containsWords(&$arr, $ignore_whole_word = false) {
		// Check for a word
		if (! $ignore_whole_word && isset($arr[0]) && $arr[0]) return true;
		// Check sub-levels
		foreach ($arr as $i => &$sublevel) {
			if ($i === 0) continue;
			if ($this->containsWords($sublevel)) return true;
		}
		return false;
	}
	
	/**
	 * Build a list of all words in a dictionary array
	 *
	 * @access  public
	 * @param   array     the words dictionary
	 * @param   string    a prefix to add to all words
	 * @return  array
	 */
	protected function getWords(&$arr = null, $prefix = '') {
		if ($arr === null) {
			$arr =& $this->dictionary;
		}
		$result = array();
		foreach ($arr as $char => &$sublevel) {
			if ($char === 0) {
				$result[] = $prefix;
			} else {
				$result = array_merge($result, $this->getWords($sublevel, $prefix.$char));
			}
		}
		return $result;
	}
	
}



// ----------------------------------------------------------------------------
//  DEBUG TESTING

header('Content-Type: text/plain');

$trie = new Trie(array(
	'app', 'apps', 'apple', 'apples', 'bob', 'banana', 'bandana', 'ban', 'bans'
));

$trie->removeWords(array('bans', 'ban'));

$trie->dump(Trie::WORDS);
$trie->dump(Trie::JSON);



/* End of file trie.php */
