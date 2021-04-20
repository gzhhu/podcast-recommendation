import pkg_resources
from symspellpy import SymSpell, Verbosity


# Set up for basic Look Up
sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
dictionary_path = pkg_resources.resource_filename("symspellpy", "frequency_dictionary_en_82_765.txt")
# term_index is the column of the term and count_index is the
# column of the term frequency
sym_spell.load_dictionary(dictionary_path, term_index=0, count_index=1)


# sym_spell.lookup is a single term (1 word) correction look up
def word_level(sentence):
    text_split = sentence.split(' ')

    fixed_list = []
    for word in text_split:

        suggestions = sym_spell.lookup(word, Verbosity.CLOSEST, max_edit_distance=1, include_unknown=True)

        top_word = 0
        for correction in suggestions:
            if top_word < 1:
                fixed_word = str(correction)
                fixed_word = fixed_word.split(', ')
                fixed_word = fixed_word[0]
                fixed_list.append(fixed_word)
            top_word += 1

    final_sentence = ' '.join(fixed_list)
    return final_sentence

