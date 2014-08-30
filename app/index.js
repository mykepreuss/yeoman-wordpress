
'use strict';

var util   = require('util')
  , path   = require('path')
  , fs     = require('fs')
  , yeoman = require('yeoman-generator')
  , rimraf = require('rimraf')
  , exec   = require('child_process').exec
  , semver = require('semver')
  , config = require('./../config.js')
  , git = require('simple-git')()

module.exports = Generator

function Generator(args, options) {
  yeoman.generators.Base.apply(this, arguments)

  this.sourceRoot(path.join(__dirname, 'templates'))

  this.on('end', function() {
    this.installDependencies({skipInstall: options['skip-install']})
  })
}

util.inherits(Generator, yeoman.generators.NamedBase)

// try to find the config file and read the infos to set the prompts default values
Generator.prototype.getConfig = function getConfig() {
  var cb   = this.async()
    , self = this

  self.configExists = false

  config.getConfig(function(err, data) {
    if (!err) {
      self.configExists = true
    }

    self.defaultTheme = data.themeUrl
    self.latestVersion = data.latestVersion

    cb()
  })
}

// get the latest stable version of Wordpress
Generator.prototype.getVersion = function getVersion() {
  var cb   = this.async()
    , self = this

  this.log.writeln('')
  this.log.writeln('Trying to get the latest stable version of Wordpress (we\'re also going to load ACF because of course you\'re going to use it.')

  // try to get the latest version using the git tags
  try {
    var version = exec('git ls-remote --tags git://github.com/WordPress/WordPress.git', function(err, stdout, stderr) {
      if (err !== null) {
        self.writeln('exec error: ' + err)
      }
      else {
        var pattern = /\d\.\d[\.\d]*/ig
          , match = stdout.match(pattern)
          , patternShort = /^\d\.\d$/
          , latestVersion = match[match.length - 1]
          , semverLatestString = latestVersion
          , semverVersionString = self.latestVersion

        if (semverLatestString.match(patternShort)) semverLatestString += '.0'
        if (semverVersionString.match(patternShort)) semverVersionString += '.0'

        if (semverLatestString !== null && typeof semverLatestString !== 'undefined') {
          // update config if needed
          if (semver.gt(semverLatestString, semverVersionString)) {
            self.log.writeln('Updating config with latest version: '+latestVersion)
            config.updateWordpressVersion(latestVersion)
          }

          self.latestVersion = latestVersion
          self.log.writeln('Latest version: '+self.latestVersion)
        }
      }
      cb()
    })
  }
  catch(e) {
    cb()
  }
}

Generator.prototype.askFor = function askFor() {
  var cb   = this.async()
    , self = this

  // Validate required
  var requiredValidate = function(value) {
    if (value == '') {
      return 'This field is required.';
    }
    return true;
  };

  var prompts = [{
          name: 'projectName',
          message: 'Project or Client Name',
          default: 'Assembly',
          filter: function (input) {
            return input.replace(/\ /g, '').toUpperCase()
          },
          validate: requiredValidate
      },
      {
          name: 'themeName',
          message: 'Enter the name of the WordPress theme',
          default: 'assembly-theme',
          filter: function (input) {
            return input.replace(/\ /g, '').toLowerCase()
          },
          validate: requiredValidate
      },
      {
          name: 'themeBoilerplate',
          message: 'Starter theme (please provide a github link)',
          default: self.defaultTheme,
          filter: function (input) {
            return input.replace(/\ /g, '').toLowerCase()
          },
          validate: requiredValidate
      },
      {
          name: 'wordpressVersion',
          message: 'Which version of Wordpress do you want?',
          default: self.latestVersion
      },
    {
      type: 'list',
      name: 'framework',
      message: 'Which front-end framework would you like?',
      choices: [
        {
          name: 'Bootstrap',
          value: 'includeBootstrap'
        }
      ]
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'jQuery is included by default so what more would you like?',
      choices: [
        {
          name: 'RequireJS',
          value: 'includeRequireJS',
          checked: true
        },
        {
          name: 'Modernizr',
          value: 'includeModernizr',
          checked: true
        },
        {
          name: 'Underscore',
          value: 'includeUnderscore',
          checked: true
        }
      ]
    },
    {
      type: 'list',
      name: 'versionControl',
      message: 'Which version control service are you using?',
      choices: [
        {
          name: 'BitBucket',
          value: 'includeBitBucket'
        },
        {
          name: 'Github',
          value: 'includeGitHub'
        }
      ]
    },
    {
      name: 'accountName',
      message: 'What is the name of the account?',
      default: 'assemblydigital',
      validate: requiredValidate
    },
    {
      name: 'repoName',
      message: 'What is the name of the repo?',
      validate: requiredValidate
    }]

  this.prompt(prompts, function(props) {
    // set the property to parse the gruntfile
    self.themeNameOriginal = props.themeName
    self.themeName = props.themeName
    self.projectNameOriginal = props.projectName
    self.projectName = props.projectName
    self.themeOriginalURL = props.themeBoilerplate
    self.themeBoilerplate = props.themeBoilerplate
    self.wordpressVersion = props.wordpressVersion
    self.includeRequireJS = props.includeRequireJS


    // check if the user only gave the repo url or the entire url with /archive/{branch}.tar.gz
    var tarballLink = (/[.]*archive\/[.]*.*.tar.gz/).test(self.themeBoilerplate)
    if (!tarballLink) {
      // if the user gave the repo url we add the end of the url. we assume he wants the master branch
      var lastChar = self.themeBoilerplate.substring(self.themeBoilerplate.length - 1)
      if (lastChar === '/') {
        self.themeBoilerplate = self.themeBoilerplate+'archive/master.tar.gz'
      }
      else {
        self.themeBoilerplate = self.themeBoilerplate+'/archive/master.tar.gz'
      }
    }

    //Preprocessor Questions
    var framework = props.framework;
    function whichframework(frameworkOptions) {
        return framework.indexOf(frameworkOptions) !== -1;
    }

    self.includeBootstrap = whichframework('Bootstrap');

    //Feature Questions
    var features = props.features;
    function hasFeature(feat) {
        return features.indexOf(feat) !== -1;
    }

    self.includeRequireJS = hasFeature('includeRequireJS');
    self.includeModernizr = hasFeature('includeModernizr');
    self.includeUnderscore = hasFeature('includeUnderscore');

    //Feature Questions
    var versionControl = props.versionControl;
    function hasVersionControl(versionOption) {
      return versionControl.indexOf(versionOption) !== -1;
    }

    self.includeBitBucket = hasVersionControl('includeBitBucket');
    self.includeGitHub = hasVersionControl('includeGitHub');

    self.accountName = props.accountName;
    self.repoName = props.repoName;

    // create the config file it does not exist
    if (!self.configExists) {
      var values = {
        themeUrl:   self.themeOriginalURL
      }
      config.createConfig(values, cb)
    } else {
      cb()
    }
  })
}

// download the framework and unzip it in the project app/
Generator.prototype.createApp = function createApp() {
  var cb   = this.async()
    , self = this

  this.log.writeln('Let\'s download the framework, shall we?')
  this.log.writeln('Downloading Wordpress version '+self.wordpressVersion)
  this.tarball('https://github.com/WordPress/WordPress/archive/'+self.wordpressVersion+'.tar.gz', 'app', cb)
}

// remove the basic theme and create a new one
Generator.prototype.createTheme = function createTheme() {
  var cb   = this.async()
    , self = this

  this.log.writeln('First let\'s remove the built-in themes we will not use')
  // remove the existing themes
  fs.readdir('app/wp-content/themes', function(err, files) {
    if (typeof files != 'undefined' && files.length !== 0) {
      files.forEach(function(file) {
        var pathFile = fs.realpathSync('app/wp-content/themes/'+file)
          , isDirectory = fs.statSync(pathFile).isDirectory()

        if (isDirectory) {
          rimraf.sync(pathFile)
          self.log.writeln('Removing ' + pathFile)
        }
      })
    }

    self.log.writeln('')
    self.log.writeln('Now we download the theme')

    // create the theme
    self.tarball(self.themeBoilerplate, 'app/wp-content/themes/'+self.themeName, cb)
  })
}

// remove the default plugins and add ACF
Generator.prototype.addACF = function addACF() {
  var cb   = this.async()
    , self = this

  fs.readdir('app/wp-content/plugins', function(err, files) {
    self.log.writeln('')
    self.log.writeln('Now we download Advanced Custom Fields')
    self.tarball('https://github.com/elliotcondon/acf/archive/master.zip', 'app/wp-content/plugins/acf', cb)
  })
}

// generate the files to use Yeoman and the git related files
Generator.prototype.createThemeFiles = function createThemeFiles() {

    //Make the LESS Folders
    this.mkdir('app/wp-content/themes/'+this.themeName+'/assets/less');
    this.mkdir('app/wp-content/themes/'+this.themeName+'/assets/less/site');

    //Copy the files over
    this.template('starter-less/_style.less', 'app/wp-content/themes/'+this.themeName+'/assets/less/style.less');
    this.copy('starter-less/variables.less', 'app/wp-content/themes/'+this.themeName+'/assets/less/site/variables.less');
    this.copy('starter-less/mixins.less', 'app/wp-content/themes/'+this.themeName+'/assets/less/site/mixins.less');
    this.copy('starter-less/global.less', 'app/wp-content/themes/'+this.themeName+'/assets/less/site/global.less');

    this.template('global/_style.css', 'app/wp-content/themes/'+this.themeName+'/style.css');

    this.template('global/head-template.html', 'app/wp-content/themes/'+this.themeName+'/templates/head-template.html')

  if (this.includeRequireJS) {
    this.copy('global/_main.js', 'app/wp-content/themes/'+this.themeName+'/assets/js/main.js');
    this.copy('global/app.js', 'app/wp-content/themes/'+this.themeName+'/assets/js/app.js');
  }

  this.template('global/base-template.html', 'app/wp-content/themes/'+this.themeName+'/base-template.html');
  this.template('global/head-template.html', 'app/wp-content/themes/'+this.themeName+'/templates/head-template.html')

  //Make folder for distribution
  this.mkdir('dist');
}

// generate the files to use Yeoman and the git related files
Generator.prototype.createYeomanFiles = function createYeomanFiles() {

  this.copy('global/_package.json', 'package.json')
  this.template('global/bowerrc', '.bowerrc')
  this.copy('global/_bower.json', 'bower.json')
  this.copy('global/README.md', 'README.md')

  this.template('Gruntfile.js', 'Gruntfile.js')

  this.copy('global/gitignore', '.gitignore')
  this.copy('global/gitattributes', '.gitattributes')
  this.copy('global/editorconfig', '.editorconfig');
  this.copy('global/jshintrc', '.jshintrc');
}

// Git setup
Generator.prototype.initGit = function initGit() {
  var cb = this.async();

  if (this.includeBitBucket) {
    var accountName = this.accountName;
    var repoName = this.repoName;
    var repoURL = 'https://bitbucket.org/'+ accountName +'/'+ repoName +'.git';
  }

  if (this.includeGitHub) {
    var accountName = this.accountName;
    var repoName = this.repoName;
    var repoURL = 'https://github.com/'+ accountName +'/'+ repoName +'.git';
  }

  console.log('Initializing Git');

  git.init(function(err) {

    if (err) console.log(err);
    console.log('Git init complete');

    git.add('--all', function(err) {

      if (err) console.log(err);

    }).addRemote('origin', repoURL)
    .commit('Initial Commit', function(err, d) {

      if (err) console.log(err);
      console.log('Git add and commit complete: ' + JSON.stringify(d, null, '  '));

    })
    .push('origin', 'master');

    cb();
  });
};

Generator.prototype.endGenerator = function endGenerator() {
  this.log.writeln('')
  this.log.writeln('Looks like we\'re done!')
  this.log.writeln('Now you just need to install Wordpress the usual way')
  this.log.writeln('Don\'t forget to activate the new theme in the admin panel, and then you can start coding!')
  this.log.writeln('')
}
