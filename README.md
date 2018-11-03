# Jali Elegant Theme [![](https://img.shields.io/npm/v/jsonresume-theme-elegant-jali.svg)](https://www.npmjs.com/package/jsonresume-theme-elegant-jali) [![](https://travis-ci.org/Jaliborc/jsonresume-theme-elegant.svg)](https://travis-ci.org/Jaliborc/jsonresume-theme-elegant/) ![](https://david-dm.org/jaliborc/jsonresume-theme-elegant.svg) ![](https://img.shields.io/npm/l/jsonresume-theme-elegant-jali.svg)

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

## Command Line Interface
Added a basic command line to the theme. This will render the given .json file with the given file name in the same repository:

    jali-resume SOURCE_JSON TARGET_NAME

Additional optional flags:

    -r: Prioritizes research content
    -p: Generates paged adapted to static (i.e: print) media
