const express = require('express');
const fetchSensorInformation = require('../services/saintJohn-service');
const cors = require('cors');
const app = express();

app.use(cors());

const axios = require('axios');
const saveSnapshot = require('../services/snapshot-service');

const getLoboSensors = require('../services/lobo-service.js');
const getKilroySensors = require('../services/kilroy-service.js');

const indexLogic = async () => {
  const loboSnapshots = getLoboSensors();
  const kilroySnapshots = getKilroySensors();

  try {
    var allSnapshots = await Promise.all([loboSnapshots, kilroySnapshots]);
    allSnapshots = allSnapshots.reduce((acc, current) => {
      return [
        ...acc,
        ...current
      ]
    }, [])
  } catch (e) {
    console.log(e);
  }
  
  var ress = allSnapshots.map(saveSnapshot);
  var snapshotsWithDeltas = await Promise.all(ress);

  return snapshotsWithDeltas;
};

app.get('/', async (req, res) => {
  const response = await indexLogic();
  res.send(response);
});

app.get('/lobo', async (req, res) => {
  const result = await getLoboSensors();
  const resultsPromise = result.map(saveSnapshot);
  var snapshots = await Promise.all(resultsPromise);
  res.send(snapshots);
})

app.get('/killroy', async (req, res) => {
  const result = await getKilroySensors();
  const resultsPromise = result.map(saveSnapshot);
  var snapshots = await Promise.all(resultsPromise);
  res.send(snapshots);
});

app.listen(4010, () => console.log('app listening on port 4010!'));

app.get('/saint-john', async (req, res) => {
  try {
    const response = await fetchSensorInformation();
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = {
  indexLogic
}