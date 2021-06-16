import PercyScript from '@percy/script';
import httpServer from 'http-server';
import fs from 'fs';
import glob from 'glob';

export const port = process.env.TEST_PORT_NUMBER || 8083;
export const testURL = `http://localhost:${port}`;



export function generateURLs() {
    const directories = [
        {
            name: 'components',
            path: 'dist/components',
        },
        {
            name: 'styles',
            path: 'dist/styles',
        },
    ];

    let urls = [];
    return new Promise((resolve, reject) => {
        for (const directory of directories) {
            fs.readdir(directory.path, async (err, folders) => {
                if (err) {
                    console.log('Unable to scan directory: ' + err);
                    reject(err);
                }
                for (const folder of folders) {
                    glob(`${directory.path}/${folder}/**/*.html`, { ignore: `${directory.path}/${folder}/index.html` }, function(er, files) {
                        if (er) {
                            console.log('Problem getting files paths: ' + er);
                        }
                        for (const file of files) {
                            urls.push({ url: `${testURL}/${file}`, name: file });
                            resolve(urls);
                        }
                    });
                }
            });
        }
    });
}
PercyScript.run(async (page, percySnapshot) => {

    let server = httpServer.createServer();
    server.listen(port);
    console.log(`Server started at ${testURL}`);

    // Get all snapshots of components, patterns and styles
    const urls = await generateURLs();
    for (const url of urls) {
        await page.goto(url.url);
        await percySnapshot(url.name, { widths: [375, 1300] });
    }

    server.close();
});
