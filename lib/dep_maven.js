import { XMLParser } from "fast-xml-parser";
import { promises as fs } from 'node:fs';

/*
This module only collect maven dependencies, 
Querying license information is not supported yet

Trial and failure ways...
1. Maven Central Repository search
    - https://central.sonatype.org/search/rest-api-guide/
    - license metadata not included
2. `mvn site` or `mvn project-info-reports:dependencies`
    - build project report as html format
    - Some of licenses are not detected
3. crawling maven repo at https://mvnrepository.com/
    - try to crawling with puppeteer 
    - bot protected, cannot access detail page
*/

const _read_pom = (pomFile)=>{
    return new Promise(async (resolve, reject) => {
        const XMLdata = await fs.readFile(pomFile, 'utf8');
        let jObj = new XMLParser().parse(XMLdata);

        let depList = [];

        let dependencies;
        if(jObj.project 
            && jObj.project.dependencyManagement 
            && jObj.project.dependencyManagement.dependencies 
            && jObj.project.dependencyManagement.dependencies.dependency) {
                dependencies = jObj.project.dependencyManagement.dependencies.dependency;
        } else if(jObj.project 
            && jObj.project 
            && jObj.project.dependencies 
            && jObj.project.dependencies.dependency ) {
            dependencies = jObj.project.dependencies.dependency;
        }  else {
            resolve([]);
            return;
        }

        const properties = jObj.project.properties;        
        dependencies.forEach(element => {
            const verParam = element.version.match(/^\$\{(.+)\}$/);
            const version = (verParam) ? properties[verParam[1]] : element.version;
            depList.push(`${element.groupId}:${element.artifactId}${version?(':'+version):''}`);
        });
        
        resolve(depList);
    });
}

const _collect = function(pomList, excludesList) {
    return new Promise( async (resolve, reject) => {
        try{
            let depList = [];
            for(const pomFile of pomList) {
                const deps = await _read_pom(pomFile)
                deps.forEach( d => {
                    if(!excludesList.find(x => x.test(d))) {
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
            licenses.push({name: packageList[inx], license:''})
        }

        resolve({type: 'Maven (GroupId:ArtifactId:Version)', licenses: licenses});
    })
}

export const DepMaven = {
    collect : _collect,
    licenses : _licenses
}