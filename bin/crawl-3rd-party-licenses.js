#!/usr/bin/env node

import {globby} from 'globby';
import {DepNpm} from '../lib/dep_npm.js'
import {DepMaven} from '../lib/dep_maven.js'
import {DepPypi} from '../lib/dep_pypi.js'
import {TextOutput} from '../lib/text_output.js'

const pattern_files = [
    '**/package.json',  // npm
    '**/pom.xml',       // maven
    '**/requirements.txt',       // pypi
];

const pattern_excludes = [
    '!**/node_modules/**', // npm
];

const file_3rd_party_licenses = 'LICENSE_THIRDPARTY.txt'

const path_pattern = Array.prototype.concat(pattern_files, pattern_excludes);
const queryLicenses = (packageFiles, loader) => new Promise(async (resolve, reject) => {
    const moduleList = await loader.collect(packageFiles);
    const licenses = await loader.licenses(moduleList);
    resolve(licenses);
});

(async ()=>{
    console.log('Collect third-party licenses from package manager files ...');
    
    const paths = await globby(path_pattern);

    // retrieve package files
    console.log('\n==[Retrieve package manager files]=========================');
    const category = {
        npm: [],
        maven: [],
        pypi: []
    }    
    paths.forEach(p => {
        console.log(`  - ${p}`)
        if(p.endsWith('package.json')) category.npm.push(p);
        else if (p.endsWith('pom.xml')) category.maven.push(p);
        else if (p.endsWith('requirements.txt')) category.pypi.push(p);
        else console.warn(`[Warn] file ${p} is not supported.`);
    })
    
    // collect 3rd-party licenses info
    console.log('\n==[Collect licenses]=======================================');
    const npm = await queryLicenses(category.npm, DepNpm);
    console.log(`  > npm licenses : ${npm.licenses.length}`);

    const maven = await queryLicenses(category.maven, DepMaven);
    console.log(`  > maven licenses : ${maven.licenses.length}`);

    const pypi = await queryLicenses(category.pypi, DepPypi);
    console.log(`  > pypi licenses : ${pypi.licenses.length}`);

    // output to file
    console.log(`\n==[Export licenses info]===================================`);    
    const output = new TextOutput(file_3rd_party_licenses);
    output.add(npm);
    output.add(maven);
    output.add(pypi);
    await output.write();

    // done
    console.log('\n------------------------------------------------------------');
    console.log(`${file_3rd_party_licenses} is created.`)
    console.log('Done.')
})()
