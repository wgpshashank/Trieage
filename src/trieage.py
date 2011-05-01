"""
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
"""

class Trie:
	'An efficient dictionary storage/lookup class'
	
	# Formatting constants
	SERIAL = 0
	JSON   = 1
	EXPORT = 2
	WORDS  = 3
	
	"""
	 Constructor
	
	 @access  public
	 @param   list      words to add
	"""
	def __init__(self, data = [ ]):
		self.dictionary = { };
		self.addWords(data);
	
	"""
	 Add words to the dictionary
	 
	 @access  public
	 @param   list      words to add
	 @return  void
	"""
	def addWords(self, data):
		for i in data:
			self.addWord(data[i])


# End of file trieage.py
