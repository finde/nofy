const RedisSMQ = require("rsmq");
const RSMQWorker = require("rsmq-worker");

/**
 * @return {callback}
 */
module.exports = async function MessageQueue(nofy, { express, config }, cb) {
  if (!config.rsmq) {
    return cb('SKIP');
  }

  nofy.messageQueue = new RedisSMQ(config.rsmq);
  nofy.queue = nofy.queue || {};

  // delete dangling
  if (config.rsmq.alwaysRestart) {
    const qs = await new Promise((resolve) => {
      nofy.messageQueue.listQueues((err, queues) => {
        resolve(queues);
      })
    });
    for (let qIndex = 0; qIndex < qs.length; qIndex += 1) {
      await nofy.messageQueue.deleteQueueAsync({ qname: qs[qIndex] });
    }
  }

  const controllerArr = Object.entries(nofy.controllers);
  for (let controllerIndex = 0; controllerIndex < controllerArr.length; controllerIndex += 1) {
    // const cName = controllerArr[controllerIndex][0];
    const cObj = controllerArr[controllerIndex][1];

    for (let workerIndex = 0; workerIndex < cObj.workers.length; workerIndex += 1) {
      const { qname, n, file, handler } = cObj.workers[workerIndex];
      if (!nofy.queue[qname]) {
        try {
          const resp = await nofy.messageQueue.createQueueAsync({ qname });
          const resp_done = await nofy.messageQueue.createQueueAsync({ qname: `${qname}-done` });

          if (resp === 1 && resp_done === 1) {
            nofy.queue[qname] = { file, workers: n };
          }

          const donePipe = new RSMQWorker(`${qname}-done`, { rsmq: nofy.messageQueue });
          donePipe.on('message', (msg, next, id) => {
            cObj[handler]({ id, msg });
            next();
          });
          donePipe.start();


        } catch (e) {
          if (e.name === 'queueExists') {
            nofy.queue[qname] = { file, workers: n };
          } else {
            console.error(e)
          }
        }
      }
    }
  }

  return cb('OK');
};