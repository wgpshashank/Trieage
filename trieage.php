<?php

/*
| -------------------------------------------------------------------
| Trie Class
| -------------------------------------------------------------------
|
| An easy to use class for efficiently handling of dictionary-type data.
|
| @software    Trie.php
| @version     0.1.1-dev
| @author      James Brumond
| @copyright   Copyright 2011 James Brumond
| @license     Dual licensed under MIT and GPL
|
*/

class Trie {
	
	// Output formats
	const DUMP    = 0;
	const PRINTR  = 1
	const SERIAL  = 2;
	const JSON    = 3;
	
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
		$this->add_words($data);
	}
	
	/**
	 * Add new words to the dictionary
	 *
	 * @access  public
	 * @param   array     the words to add
	 * @return  void
	 */
	public function add_words($data) {
		if (is_array($data)) {
			foreach ($data as $word) {
				$this->add_word($word);
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
	public function add_word($word) {
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
	 * Check if a string is a valid word prefix
	 *
	 * @access  public
	 * @param   string    the prefix to test
	 * @param   bool      if not a prefix, but it is a word, return true
	 * @return  bool
	 */
	public function is_valid_prefix($prefix, $ignore_whole_word = false) {
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
		// Check whole words
		if (! $ignore_whole_word && isset($current[0]) && $current[0]) return true;
		// Check for prefixes
		foreach ($current as $char => &$sublevel) {
			
		}
	}
	
}

/* End of file trie.php */
