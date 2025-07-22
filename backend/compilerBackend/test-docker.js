// test-docker.js
const Docker = require('dockerode');
const docker = new Docker();

async function test() {
  console.log('Creating container...');
  const container = await docker.createContainer({
    Image: 'onlinejudge-python',  // <-- CHANGED to your existing image
    Cmd: ['/bin/sh', '-c', 'python3 -c "print(\'Hello from Docker!\')"'],  // <-- CHANGED to use sh -c
    AttachStdout: true,
    AttachStderr: true,
    HostConfig: { 
      AutoRemove: false
    }
  });
  
  console.log('Starting container...');
  await container.start();
  
  console.log('Waiting for container to finish...');
  await container.wait();
  
  console.log('Getting logs...');
  const logs = await container.logs({
    follow: false,
    stdout: true,
    stderr: true
  });
  
  console.log('Output:', logs.toString('utf8'));
  await container.remove();
}

test().catch(console.error);