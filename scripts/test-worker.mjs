import('../dist/server/index.js')
  .then(m => {
    const w = m.default;
    console.log('Worker exports:', Object.keys(m));
    console.log('fetch type:', typeof w?.fetch);
    console.log('OK - Worker loaded in Node.js');
    process.exit(0);
  })
  .catch(e => {
    console.error('ERROR loading worker:', e.message);
    process.exit(1);
  });
