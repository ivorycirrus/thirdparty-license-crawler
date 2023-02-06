import { promises as fs } from 'node:fs';
import { execSync } from 'child_process';

const REGEX_ACCEPT_REQS = /^(?!-|#).+(?<!\.whl)$/ 
const REGEX_VERSION = /(.+)+s?([\>\=]\=)\s?(.*)/
const REGEX_URL = /(.+)+s?\@\s?(.*)/

const _read_requirements_txt = (pkgFile)=>{
    return new Promise(async (resolve, reject) => {
        const depList = [];
        const contents = await fs.readFile(pkgFile, { encoding: 'utf8' })
        
        const lines = contents.split(/\r?\n/);
        lines.forEach(l => {
            const ll = l?l.toString().trim():'';
            if(REGEX_ACCEPT_REQS.test(ll)) {
                const mUrl = ll.match(REGEX_URL);
                const mVer = ll.match(REGEX_VERSION);
                if(mUrl) depList.push(mUrl[1].trim());
                else if(mVer) depList.push(`${mVer[1].trim()}${mVer[2]}${mVer[3]}`)
                else if(ll.length > 0) depList.push(ll)
            }
        });

        resolve(depList);
    });
}

const _collect = function(pkgList) {
    return new Promise( async (resolve, reject) => {
        try{
            let depList = [];
            for(const pkgFile of pkgList) {
                const deps = await _read_requirements_txt(pkgFile)
                depList.push(...deps);
            }
            resolve(depList);
        } catch (e) {
            reject (e);
        }
    });
}

const _licenses = function(packageList) {
    return new Promise( (resolve, reject) => {
        let licenses = [];
        for (const inx in packageList) {
            const name = packageList[inx];
            const mVer = name.match(REGEX_VERSION);
            const lic = execSync(`pip3 show ${mVer?mVer[1]:name} | grep --color=never License`)
            licenses.push({name, license: lic?lic.toString().trim().substring(9):''})
        }

        resolve({type: 'Pypi (PackageName==Version)', licenses: licenses});
    })
}

export const DepPypi = {
    collect : _collect,
    licenses : _licenses
}