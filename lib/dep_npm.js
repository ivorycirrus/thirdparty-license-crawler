import { promises as fs } from 'node:fs';
import { execSync } from 'child_process';

const _read_packages_json = (pkgFile)=>{
    return new Promise(async (resolve, reject) => {
        const contents = await fs.readFile(pkgFile, { encoding: 'utf8' })
        const jObj = JSON.parse(contents)

        if(jObj.dependencies) {
            const depList = Object.keys(jObj.dependencies).map(k=>`${k}@${jObj.dependencies[k]}`);
            resolve(depList);
        } else {
            resolve([]);
        }
    });
}

const _collect = function(pkgList, excludesList) {
    return new Promise( async (resolve, reject) => {
        try{
            let depList = [];
            for(const pkgFile of pkgList) {
                const deps = await _read_packages_json(pkgFile)
                deps.forEach( d => {
                    if(!excludesList.find(x => x.test(d)) && !depList.find(x => x===d)) {
                        depList.push(d);
                    }
                })
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
            const verInx = name.lastIndexOf('@')
            const pkgName = (verInx>0)?name.substr(0, verInx):name;
            const lic = execSync(`npm info ${pkgName} license`)
            licenses.push({name, license: lic?lic.toString().trim():''})
        }

        resolve({type: 'Npm (PackageName@Version)', licenses: licenses});
    })
}

export const DepNpm = {
    collect : _collect,
    licenses : _licenses
}