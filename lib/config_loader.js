import { promises as fs } from 'node:fs';

const default_pattern_files = [
    '**/package.json',      // npm
    '**/pom.xml',           // maven
    '**/requirements.txt',  // pypi
];

const default_pattern_excludes = [
    '!**/node_modules/**', // npm
];

const _load_config = (cfgFile)=>{
    return new Promise(async (resolve, reject) => {
        if(!cfgFile) {
            resolve({
                pattern_files: default_pattern_files,
                pattern_excludes: default_pattern_excludes
            });
            return;
        }

        try {
            const contents = await fs.readFile(cfgFile, { encoding: 'utf8' })
            const jObj = JSON.parse(contents);

            const {pattern_files, pattern_excludes, module_excludes} = jObj;
            resolve({
                pattern_files: pattern_files ? pattern_files : default_pattern_files,
                pattern_excludes: pattern_excludes? pattern_excludes : default_pattern_excludes,
                module_excludes: module_excludes? module_excludes : {}
            })
        } catch(e) {
            console.log(e)
            reject(null);
        }
    });
}

export const Config = {
    load : _load_config
}