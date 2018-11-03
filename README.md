# Jali Elegant Theme
[![](https://img.shields.io/npm/v/jsonresume-theme-elegant.svg)](https://www.npmjs.com/package/jsonresume-theme-elegant) [![](https://travis-ci.org/Jaliborc/jsonresume-theme-elegant.svg)](https://travis-ci.org/Jaliborc/jsonresume-theme-elegant/) ![](https://david-dm.org/jaliborc/jsonresume-theme-elegant.svg) ![](https://img.shields.io/npm/l/jsonresume-theme-elegant.svg)


Personal modification of the [Elegant](https://github.com/mudassir0909/jsonresume-theme-elegant) responsive theme for [JsonResume](https://jsonresume.org/) by Mudassir Ali.

[Theme Preview](http://jaliborc.com/resume)

## Modifications
* Added responsive sidebars to work experience.
* Added hundreds of brand icons for profile support.
* Changed to inline SVG icons, instead of icon font (*ensures icons are displayed even on offline builds*)
* Fixed current event tooltip features.
* Reorganized the order of the background sections.
* Reworked the print design. (*maximum features, no print color waste*)
* Added continuous integration (*using Travis CI*)

### Extended Schema
An additional optional entry called `style` allows you to make some minor changes to the resulting file:

    "style": {
      "priority": "research",
      "media": "print"
    }

## Command Line Interface
Jali Elegent Theme provides a basic command line tool as well. This will render the given .json file into the given file name on the same directory:

    jali-resume myfolder/myresume.json outputname.html

Both input path and output name are optional parameters.
