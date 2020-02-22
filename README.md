# Epr Elegant Theme


Personal modification of the [Elegant](https://github.com/mudassir0909/jsonresume-theme-elegant) responsive theme for [JsonResume](https://jsonresume.org/) by Mudassir Ali.

[Theme Preview](https://devpaezrubio.com/resume)

## Highlights
* Added command line interface
   * Compatible with `jsonresume`, but not required to use
   * Can be rendered to exact replica `.pdf`
* Design modifications
  * Added responsive sidebars to work experience.
  * Added hundreds of brand icons for profile support.
  * Changed to inline SVG icons, instead of icon font (*ensures icons are displayed even on offline builds*)
  * Fixed current event tooltip features.
  * Reorganized the order of the background sections.
  * Reworked the print design. (*maximum features, no print color waste*)
* Added continuous integration (*using Travis CI*)

## Command Line Interface
Epr Elegant Theme provides a basic command line tool as well. This will render the given .json file into the given file name on the same directory:

    eprresume myfolder/myresume.json outputname.html
    eprresume myfolder/myresume.json outputname.pdf

Both input path and output name are optional parameters.


### Extended Schema
An additional optional entry called `basics.priority` allows you to reorder entries in the file:

    "basics": {
      "priority": "research",
    }
