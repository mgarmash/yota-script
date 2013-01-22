# yota-script
Small [PhantomJS](http://phantomjs.org/download.html)-based application for [Yota.ru](http://yota.ru) personal cabinet.

Copyright (C) 2013 Max Garmash max@garmash.org @linx56
## Usage
You need to download and install PhantomJS for your platform.

Then you can issue some commands:
`phantomjs yota.js your_login your_password [command] [parameter]`

## Available commands:

`check` or no command - default command, shows current active offer and remaining days.

`switch` - activates another offer, parameter is mandatory and must be one of `list` command results

`list` - list of available parameters for `switch` command

## Sample
`phantomjs yota.js your_login your_password switch 5.0`

## Limitations && problems
Sometimes script have some timing issues. You can enable debug mode for PhantomJS with `--debug=yes`.