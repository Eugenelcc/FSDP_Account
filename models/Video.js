const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Video = db.define('video', {
  title: {
    type: Sequelize.STRING
  },
  story: {
    type: Sequelize.STRING(2000)
  },
  language: {
    type: Sequelize.STRING
  },
  subtitles: {
    type: Sequelize.STRING,
  },
  classification: {
    type: Sequelize.STRING
  },
  dateRelease: {
    type: Sequelize.DATE
  },
  posterURL: {
    type: Sequelize.STRING
  },
  starring: {
    type: Sequelize.STRING
  },

});

module.exports = Video;