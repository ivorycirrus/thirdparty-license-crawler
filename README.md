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