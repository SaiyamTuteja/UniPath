const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']); // Force using Google DNS to bypass ISP blocks

dns.resolveSrv('_mongodb._tcp.cluster0.t2xtz9z.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV lookup failed:', err.message);
    return;
  }
  console.log('SRV Records:', addresses);

  if (addresses && addresses.length > 0) {
    const hosts = addresses.map(a => `${a.name}:${a.port}`).join(',');
    const standardUri = `mongodb://${hosts}/?ssl=true&replicaSet=atlas-xxx-shard-0&authSource=admin&retryWrites=true&w=majority`;
    console.log('\nStandard Connection String template (replace replicaSet):');
    console.log(standardUri);
  }
});
