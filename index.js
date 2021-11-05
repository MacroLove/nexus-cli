require('colors');
const program = require('commander');
const https = require('https');

program
  .command('delete')
  .requiredOption('-d, --domain <domain name>')
  .requiredOption('-a, --auth <basic auth>')
  .requiredOption('-r, --repo <repository name>')
  .action(async function(options){
    let ret = await doReq(options.domain, '/nexus/service/rest/v1/assets?repository=' + options.repo, 'GET', options.auth);
    ret = JSON.parse(ret);
    let cnt = 0;
    while(ret && ret.items && ret.items.length > 0) {
      for (const item of ret.items) {
        console.log(`Deleting [${item.path}]......`.yellow);
        await doReq(options.domain, '/nexus/service/rest/v1/assets/' + item.id, 'DELETE', options.auth);
        cnt++;
      }
      ret = await doReq(options.domain, '/nexus/service/rest/v1/assets?repository=' + options.repo, 'GET', options.auth);
      ret = JSON.parse(ret);
    }
    console.log(`All [${cnt}] deleted OK!`.green);
});


program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// --------------------------------------------------------------- //
function doReq(domain, path, method, auth) {
  return new Promise((resolve, reject) => {  
    const req = https.request({
      hostname: domain,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Basic ' + auth
      }
    }, (res) => {
      let ret = '';
      res.on('data', (d) => {
        ret += d;
      });
      res.on('end', () => {
        resolve(ret);
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  
  });
}