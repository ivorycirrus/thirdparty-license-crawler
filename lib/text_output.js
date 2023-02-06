import * as os from 'os';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

export class TextOutput {
    constructor(outputFile) {
        this.outputFile = outputFile;
        this.licenses = [];

        this.add = (lic) => this.licenses.push(lic);
        this.write = () => {
            return new Promise( async (resolve, reject) => {
                const fd = await fs.open(this.outputFile, 'w');
                let writeStream = fd.createWriteStream({encoding: 'utf-8'});

                this.licenses.forEach(item => {
                    const header = `# ${item.type}`;
                    writeStream.write(header + os.EOL);
                    console.log(header)

                    item.licenses.forEach(lic=> {
                        const licenseItem = `    ${lic.name} - ${lic.license}`;                        
                        writeStream.write(licenseItem + os.EOL);
                        console.log(licenseItem)
                    })
                    writeStream.write(os.EOL)
                });

                writeStream.end();
                resolve();
            });

        };
    }
}