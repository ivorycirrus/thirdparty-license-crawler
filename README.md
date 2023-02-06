# Third-party license crawler
crawling thirdparty licenses from package manager files (packages.json, pom.xml, ...)

# Quick Start
Install
```bashnpm install -g thirdparty-license-crawler
$ npm install -g thirdparty-license-crawler
```

Run cli command on your project directory
```bash
$ crawl-3rd-party-licenses
```

**LICENSE_THIRDPARTY.txt** file is created where you running on the script.

# Sample run
```
$ crawl-3rd-party-licenses --input .3rdpartylicense
Collect third-party licenses from package manager files ...
==[Retrieve package manager files]=========================
  - package.json
  - pom.xml
  - requirements.txt
==[Collect licenses]=======================================
  > npm licenses : 3
  > maven licenses : 2
  > pypi licenses : 1
==[Export licenses info]===================================
# Npm (PackageName@Version)
    fast-xml-parser@^4.1.1 - MIT
    globby@^13.1.3 - MIT
    yargs@^17.6.2 - MIT
# Maven (GroupId:ArtifactId:Version)
    junit:junit:4.11 -
    software.amazon.awssdk:bom:2.17.209 -
# Pypi (PackageName==Version)
    boto3==1.24.74 - Apache License 2.0
------------------------------------------------------------
LICENSE_THIRDPARTY.txt is created.
Done.
```

# Custom Configuration
You can run with your config files
```
$ crawl-3rd-party-licenses --input <your-config-file>
```

A example of config file
* pattern_files represented collecting file pattern.
* pattern_excludes are excluding file pattern. These are normally start with ```!``` for ignore.
* module excludes are excluding module pattern witch represented by RegEx format. 
```json
{
    "pattern_files" : [
        "**/package.json",
        "**/pom.xml",
        "**/requirements.txt",
    ],
    "pattern_excludes" : [
        "!**/node_modules/**"
    ],
    "module_excludes" : {
        "npm" : [
          "^\\@mymodule"
        ],
        "maven" : [
          "^sample"
        ],
        "pypi" : [
            "^py.*"
        ]
    }
}
```

# Dependencies
This tool is tested on MacOS. Dependelcies are below.
* node.js, npm
* pip3
* grep

# Restrictions
* Maven dependelcies are only collect artifact name and version. You have to update license information namually from maven central.
* PiPy packages refer installed pip packages infoemation. Installed PyPi packages only can detect license info.

# License
MIT