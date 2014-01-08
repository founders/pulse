Pulse
=====

Do great things, one accomplishment at a time.

[![Build Status](https://travis-ci.org/Illinois-Founders/pulse.png)](https://travis-ci.org/Illinois-Founders/pulse)

[See The Production App](https://pulse-il.jit.su)

## Vision

A community that enables individuals to accomplish great things.

## Execution

`Pulse` will be a single-page app centered around a chronological stream of accomplishments. Its primary purpose is to encourage people to accomplish small things. Its secondary purpose is to deter atrophy.

### The Stick

Atrophy in the community immediately affects everyone. Artificial lag is introduced so that "passive" actions like commenting on accomplishments becomes progressively more difficult to perform. This deters unproductive and unsightly comment threads. Emails will be sent out to laggards, encouraging them to share a recent accomplishment.

### The Carrot

Accomplished users can bask in the praise of their peers and watch as they rise on the leaderboard. In future updates, we should further gamify this by adding badges. Sharing accomplishments also temporarily lifts the artificial lag, which should lead to praise and thanks from the community.

## Technical Details

### Back-end

 * express 3
 * mongodb
 * socket.io
 * nodejitsu

### Front-end

 * handlebars
 * browserify
 * ribcage-ui
 * topcoat

## Contributing

**You'll need mongodb installed locally.**

Start a development server:

```sh
$ npm install
$ npm install nodemon -g
$ nodemon server.js
```

Or run the tests:

```sh
$ npm test
```

### Developing On Windows

#### Getting node and npm

 * Install node.js from [here](http://nodejs.org)
 * Right click on "This PC" or "My Computer", go to Advanced System Settings and edit Environment Variables
 * Add this to your PATH: `C:\Users\yourusername\AppData\Roaming\npm;C:\Program Files\nodejs`
    * The first path might already be there, the second is neglected by the installer as of this time of writing
 * Close and open your terminals. Commands like `npm` and `node` should now work.

#### Compiling native modules

 * Install [Python 2.7.3](http://www.python.org/download/releases/2.7.3/#download)
 * Install [Visual Studio 2012 Express](http://www.microsoft.com/en-us/download/confirmation.aspx?id=34673)
 * Install [Windows SDK](http://www.microsoft.com/en-us/download/details.aspx?id=8279)
 * Install [Visual C++ 2008 Redistributables](http://www.microsoft.com/en-us/download/details.aspx?id=15336)
 * Install [OpenSSL](http://slproweb.com/download/Win64OpenSSL-1_0_0k.exe)
 * Go to the `pulse` app directory and run `npm install --msvs_version=2012`

## Deployment

Deployment is automatic and happens whenever a push to the master branch does not break the build.

## License

Copyright (C) 2014 Ben Ng, Rohan Kapoor, Jay Bensal and Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
