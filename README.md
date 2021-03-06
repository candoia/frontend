# candoia-frontend

### Development Environment Setup

1. [Download and install nodejs](https://nodejs.org/en/)
2. Clone the frontend repository (`git clone ...`)
3. `cd` to the cloned repository
4. execute `npm install` (To install it is necessary the python version is within  Python >= v2.5.0 & < 3.0.0. If multiple version of python is installed and you get error related to python version then make sure you install a supported python version and use the command `npm install --python=python2.7` )

### Tasks:

#### Start
To start Candoia, execute `npm start`. By default, it will be started in `development` mode.

alternatively:

- `npm start -- --env=development` to explicitly start in `development` mode
- `npm start -- --env=production` to explicitly start in `production` mode
- `npm start -- --env=test` to explicitly start in `test` mode

#### Releases
To create a release for all platforms and architectures, execute `npm run release`.

alternatively:

- `npm run release -- --platform=<platform> --arch=<arch> --overwrite=<overwrite>`
- <platform> is either empty or one of: "all", "linux", "win32", or "darwin".
- <arch> is either empty, or one of: "all", "ia32", or "x64".
- <overwrite> is true of false. It will overwrite the output directory. By default it is false.


Releases will land in `/releases/version/Candoia-<platform>-<arch>`. Behind the scenes, we are using [electron-packager](https://www.npmjs.com/package/electron-packager) to package for Windows, Linux, and Mac.

#### Test
To run tests, execute `npm test`.

We use [jasmine 2.2](http://jasmine.github.io/2.2/introduction.html) for tests. All `.spec.js` files will automatically be collected.

#### Build Only
To only build, execute `npm run build`

### Project Layout

- `app` - Candoia goes here
- `config` - place for environment specific stuff
- `build` - in this folder lands built, runnable application
- `releases` - ready for distribution installers will land here
- `resources` - resources for particular operating system
- `tasks` - build and development environment scripts
