#!/usr/bin/env node

import { globby } from 'globby';
import yargs from 'yargs'
import { Config } from '../lib/config_loader.js';
import { DepNpm } from '../lib/dep_npm.js'
import { DepMaven } from '../lib/dep_maven.js'
import { DepPypi } from '../lib/dep_pypi.js'
import { TextOutput } from '../lib/text_output.js'

const options = yargs(process.argv.slice(2))
        .usage('Usage: $0 <command> [options]')
        .option("i", {alias:"input", describe: "Input file for configuration", type: "string", demandOption: false })
        .option("o", {alias:"output", describe: "Output file including 3ed-party module info", type: "string", demandOption: false })
        .help(true)
        .argv;

// utilities
const queryLicenses = (packageFiles, excludesList,  loader) => new Promise(async (resolve, reject) => {
    const moduleList = await loader.collect(packageFiles, excludesList);
    const licenses = await loader.licenses(moduleList);
    resolve(licenses);
});
const buildModuleExcludes = (module_excludes) => {
    const extractList = (obj, key) => (obj && obj[key]) ? obj[key].map( e => new RegExp(e) ) : [];
    return {
        npm : extractList(module_excludes, 'npm'),
        maven : extractList(module_excludes, 'maven'),
        pypi : extractList(module_excludes, 'pypi')
    };
}

// main function
(async ()=>{
    console.log('Collect third-party licenses from package manager files ...');
    
    const {pattern_files, pattern_excludes, module_excludes} = await Config.load(options.input);
    const path_pattern = Array.prototype.concat(pattern_files, pattern_excludes);
    const regexModuleExcludes = buildModuleExcludes(module_excludes);
    
    const file_3rd_party_licenses = (options.output && options.outputtoString().trim().length > 0)?options.output:'LICENSE_THIRDPARTY.txt'

    // retrieve package files
    console.log('==[Retrieve package manager files]=========================');
    const category = {
        npm: [],
        maven: [],
        pypi: []
    }
    const paths = await globby(path_pattern);
    paths.forEach(p => {
        console.log(`  - ${p}`)
        if(p.endsWith('package.json')) category.npm.push(p);
        else if (p.endsWith('pom.xml')) category.maven.push(p);
        else if (p.endsWith('requirements.txt')) category.pypi.push(p);
        else console.warn(`[Warn] file ${p} is not supported.`);
    })
    
    // collect 3rd-party licenses info
    console.log('==[Collect licenses]=======================================');
    const npm = await queryLicenses(category.npm, regexModuleExcludes.npm, DepNpm);
    console.log(`  > npm licenses : ${npm.licenses.length}`);

    const maven = await queryLicenses(category.maven, regexModuleExcludes.maven, DepMaven);
    console.log(`  > maven licenses : ${maven.licenses.length}`);

    const pypi = await queryLicenses(category.pypi, regexModuleExcludes.pypi, DepPypi);
    console.log(`  > pypi licenses : ${pypi.licenses.length}`);

    // output to file
    console.log(`==[Export licenses info]===================================`);    
    const output = new TextOutput(file_3rd_party_licenses);
    output.add(npm);
    output.add(maven);
    output.add(pypi);
    await output.write();

    // done
    console.log('------------------------------------------------------------');
    console.log(`${file_3rd_party_licenses} is created.`)
    console.log('Done.')
})()
